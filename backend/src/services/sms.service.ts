import https from 'https';

export interface SendSmsResult {
    sent: boolean;
    provider: string;
    message?: string;
    verificationId?: string; // Message Central returns this for OTP validation
}

/**
 * Message Central CPaaS — Send OTP via VerifyNow API
 * Docs: https://cpaas.messagecentral.com
 * Auth Token is passed directly from env (pre-generated from dashboard)
 */
async function sendMessageCentralOtp(mobile: string, otp: string): Promise<SendSmsResult> {
    const authToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;

    if (!authToken || !customerId) return { sent: false, provider: 'MessageCentral', message: 'Credentials not configured' };

    const cleanMobile = mobile.replace(/\D/g, '');

    // Message Central VerifyNow v3 - Send OTP
    // They generate OTP on their side, but since we manage OTP ourselves,
    // we send a custom message with the OTP via their SMS API
    try {
        const queryParams = new URLSearchParams({
            countryCode: '91',
            customerId: customerId,
            flowType: 'SMS',
            mobileNumber: cleanMobile,
        }).toString();

        const postData = JSON.stringify({
            countryCode: '91',
            customerId: customerId,
            flowType: 'SMS',
            mobileNumber: cleanMobile,
            message: `Your Almora Zila Panchayat complaint verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        });

        const result: any = await new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname: 'cpaas.messagecentral.com',
                    path: `/verification/v3/send?${queryParams}`,
                    method: 'POST',
                    headers: {
                        'authToken': authToken,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                    },
                },
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk));
                    res.on('end', () => {
                        try { resolve({ statusCode: res.statusCode, data: JSON.parse(body) }); }
                        catch { resolve({ statusCode: res.statusCode, data: body }); }
                    });
                }
            );
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log(`📤 [MessageCentral] Response [${result.statusCode}]:`, JSON.stringify(result.data));

        if (result.statusCode === 200 || result.statusCode === 201 ||
            (result.data && (result.data.responseCode === '200' || result.data.message?.toLowerCase().includes('success')))) {
            const vId = result.data?.data?.verificationId || result.data?.verificationId;
            console.log(`✅ [REAL SMS SENT] MessageCentral sent OTP to +91 ${cleanMobile} (VerificationID: ${vId})`);
            return {
                sent: true,
                provider: 'MessageCentral',
                verificationId: vId,
            };
        } else {
            console.error('❌ MessageCentral API Error:', result.data);
            return { sent: false, provider: 'MessageCentral', message: JSON.stringify(result.data) };
        }
    } catch (err: any) {
        console.error('❌ MessageCentral Request Exception:', err.message);
        return { sent: false, provider: 'MessageCentral', message: err.message };
    }
}

/**
 * Validates OTP code against Message Central verification API
 */
export async function validateMessageCentralOtp(verificationId: string, code: string): Promise<{ valid: boolean; message?: string }> {
    const authToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;

    if (!authToken || !customerId) return { valid: false, message: 'Message Central credentials missing' };

    try {
        const queryParams = new URLSearchParams({
            customerId: customerId,
            verificationId: verificationId,
            code: code,
        }).toString();

        const result: any = await new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname: 'cpaas.messagecentral.com',
                    path: `/verification/v3/validateOtp?${queryParams}`,
                    method: 'GET',
                    headers: {
                        'authToken': authToken,
                    },
                },
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk));
                    res.on('end', () => {
                        try { resolve({ statusCode: res.statusCode, data: JSON.parse(body) }); }
                        catch { resolve({ statusCode: res.statusCode, data: body }); }
                    });
                }
            );
            req.on('error', reject);
            req.end();
        });

        console.log(`🔍 [MessageCentral Validate] VerificationID: ${verificationId} | Code: ${code} | Response:`, JSON.stringify(result.data));

        const respCode = result.data?.responseCode;
        const msg = result.data?.message;

        if (respCode === 200 || respCode === '200' || msg === 'SUCCESS' || msg === 'VERIFIED') {
            return { valid: true };
        } else {
            return { valid: false, message: msg || 'Invalid OTP code' };
        }
    } catch (err: any) {
        console.error('❌ MessageCentral Validate Exception:', err.message);
        return { valid: false, message: err.message };
    }
}

/**
 * Sends a real 6-digit SMS OTP to a 10-digit Indian mobile number.
 * Priority: MessageCentral → Fast2SMS → Twilio → Console Fallback
 */
export async function sendRealSmsOtp(mobile: string, otp: string): Promise<SendSmsResult> {
    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    // 1. Message Central (Primary - Indian CPaaS)
    if (process.env.MESSAGE_CENTRAL_AUTH_TOKEN && process.env.MESSAGE_CENTRAL_CUSTOMER_ID) {
        const result = await sendMessageCentralOtp(cleanMobile, otp);
        if (result.sent) return result;
        console.warn('⚠️ MessageCentral failed, trying next provider...');
    }

    // 2. Fast2SMS (Fallback)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
        try {
            const postData = JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: cleanMobile,
            });

            const options = {
                hostname: 'www.fast2sms.com',
                path: '/dev/bulkV2',
                method: 'POST',
                headers: {
                    'authorization': fast2smsKey,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };

            const res: any = await new Promise((resolve, reject) => {
                const req = https.request(options, (response) => {
                    let body = '';
                    response.on('data', (chunk) => (body += chunk));
                    response.on('end', () => resolve(JSON.parse(body)));
                });
                req.on('error', (e) => reject(e));
                req.write(postData);
                req.end();
            });

            if (res && res.return) {
                console.log(`✅ [REAL SMS SENT] Fast2SMS sent OTP ${otp} to +91 ${cleanMobile}`);
                return { sent: true, provider: 'Fast2SMS' };
            } else {
                console.error('❌ Fast2SMS API Error:', res);
            }
        } catch (err: any) {
            console.error('❌ Fast2SMS Request Exception:', err.message);
        }
    }

    // 3. Twilio SMS Gateway (Fallback)
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioFrom) {
        try {
            const postData = new URLSearchParams({
                To: `+${formattedMobile}`,
                From: twilioFrom,
                Body: `Your Almora Zila Panchayat complaint verification code is: ${otp}. Valid for 5 minutes.`,
            }).toString();

            const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

            const options = {
                hostname: 'api.twilio.com',
                path: `/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };

            const res: any = await new Promise((resolve, reject) => {
                const req = https.request(options, (response) => {
                    let body = '';
                    response.on('data', (chunk) => (body += chunk));
                    response.on('end', () => resolve(JSON.parse(body)));
                });
                req.on('error', (e) => reject(e));
                req.write(postData);
                req.end();
            });

            if (res && res.sid) {
                console.log(`✅ [REAL SMS SENT] Twilio sent OTP to +${formattedMobile}`);
                return { sent: true, provider: 'Twilio' };
            } else {
                console.error('❌ Twilio API Error:', res);
            }
        } catch (err: any) {
            console.error('❌ Twilio Request Exception:', err.message);
        }
    }

    // 4. Fallback: Dev console log
    console.log('\n========================================================');
    console.log('📲 [DEV FALLBACK - SMS NOT SENT - No Gateway Responded]');
    console.log(`Target Mobile: +91 ${cleanMobile}`);
    console.log(`OTP Code: ${otp}`);
    console.log('Configure MESSAGE_CENTRAL_AUTH_TOKEN in backend/.env to send real SMS.');
    console.log('========================================================\n');

    return { sent: false, provider: 'Console Dev Fallback' };
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Sends a Complaint Confirmation SMS after successful registration.
 * Contains the Complaint ID and tracking instructions.
 */
export async function sendConfirmationSms(
    mobile: string,
    complaintNumber: string,
    name: string
): Promise<void> {
    const cleanMobile = mobile.replace(/\D/g, '');
    const authToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;

    const message =
        `Namaskar ${name}! Your complaint has been successfully registered with Almora Zila Panchayat Safai Vibhag.\n` +
        `Complaint ID: ${complaintNumber}\n` +
        `Track your complaint status anytime at our portal or save this ID for future reference.\n` +
        `- Almora Zila Panchayat`;

    console.log(`\n📩 [CONFIRMATION SMS] Sending to +91 ${cleanMobile}`);
    console.log(`   Complaint ID: ${complaintNumber}`);

    // ── Try Message Central ──
    if (authToken && customerId) {
        try {
            const queryParams = new URLSearchParams({
                countryCode: '91',
                customerId,
                flowType: 'SMS',
                mobileNumber: cleanMobile,
            }).toString();

            const postData = JSON.stringify({
                countryCode: '91',
                customerId,
                flowType: 'SMS',
                mobileNumber: cleanMobile,
                message,
            });

            const result: any = await new Promise((resolve, reject) => {
                const req = https.request(
                    {
                        hostname: 'cpaas.messagecentral.com',
                        path: `/verification/v3/send?${queryParams}`,
                        method: 'POST',
                        headers: {
                            'authToken': authToken,
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(postData),
                        },
                    },
                    (res) => {
                        let body = '';
                        res.on('data', (chunk) => (body += chunk));
                        res.on('end', () => {
                            try { resolve({ statusCode: res.statusCode, data: JSON.parse(body) }); }
                            catch { resolve({ statusCode: res.statusCode, data: body }); }
                        });
                    }
                );
                req.on('error', reject);
                req.write(postData);
                req.end();
            });

            if (result.statusCode === 200 || result.statusCode === 201) {
                console.log(`✅ [CONFIRMATION SMS SENT] MessageCentral → +91 ${cleanMobile}`);
                return;
            }
            console.warn('⚠️ MessageCentral confirmation SMS failed:', result.data);
        } catch (err: any) {
            console.error('❌ MessageCentral confirmation SMS error:', err.message);
        }
    }

    // ── Try Twilio fallback ──
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioToken && twilioFrom) {
        try {
            const postData = new URLSearchParams({
                To: `+91${cleanMobile}`,
                From: twilioFrom,
                Body: message,
            }).toString();

            const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

            const res: any = await new Promise((resolve, reject) => {
                const req = https.request(
                    {
                        hostname: 'api.twilio.com',
                        path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(postData),
                        },
                    },
                    (response) => {
                        let body = '';
                        response.on('data', (chunk) => (body += chunk));
                        response.on('end', () => resolve(JSON.parse(body)));
                    }
                );
                req.on('error', reject);
                req.write(postData);
                req.end();
            });

            if (res?.sid) {
                console.log(`✅ [CONFIRMATION SMS SENT] Twilio → +91 ${cleanMobile}`);
                return;
            }
        } catch (err: any) {
            console.error('❌ Twilio confirmation SMS error:', err.message);
        }
    }

    // ── Dev fallback ──
    console.log('\n========================================================');
    console.log('📋 [CONFIRMATION SMS — DEV FALLBACK]');
    console.log(`To: +91 ${cleanMobile}`);
    console.log(`Message: ${message}`);
    console.log('========================================================\n');
}
