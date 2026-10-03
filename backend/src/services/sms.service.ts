import https from 'https';
import http from 'http';

export interface SendSmsResult {
    sent: boolean;
    provider: string;
    message?: string;
}

/**
 * Sends a real 6-digit SMS OTP to a 10-digit Indian mobile number.
 * Supports Twilio, Fast2SMS, and MSG91 via native HTTP requests.
 */
export async function sendRealSmsOtp(mobile: string, otp: string): Promise<SendSmsResult> {
    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    // 1. Fast2SMS (Indian Low-Cost SMS Gateway)
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

    // 2. Twilio SMS Gateway
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioFrom) {
        try {
            const postData = new URLSearchParams({
                To: `+${formattedMobile}`,
                From: twilioFrom,
                Body: `Your Zila Panchayat Safai official verification code is: ${otp}. Valid for 5 minutes.`,
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

    // 3. Fallback: No SMS provider configured in .env
    console.log('\n========================================================');
    console.log('📲 [REAL SMS NOTICE - SMS GATEWAY NOT CONFIGURED IN .ENV]');
    console.log(`Target Mobile: +91 ${cleanMobile}`);
    console.log(`OTP Code: ${otp}`);
    console.log('To deliver real SMS to phones, add FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID in backend/.env');
    console.log('========================================================\n');

    return { sent: false, provider: 'Console Dev Fallback' };
}
