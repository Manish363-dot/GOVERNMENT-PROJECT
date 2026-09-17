import nodemailer, { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

/**
 * Send an email using SMTP or log to console if SMTP is not configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ sent: boolean; devMode: boolean }> {
  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || `"Zila Panchayat Safai Portal" <${process.env.SMTP_USER || 'no-reply@uk.gov.in'}>`;

  if (!mailer) {
    console.log('\n========================================================');
    console.log('📬 [DEV EMAIL NOTICE - SMTP NOT CONFIGURED IN .env]');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content (Text): ${options.text || 'See HTML body'}`);
    console.log('========================================================\n');
    return { sent: true, devMode: true };
  }

  try {
    await mailer.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log(`✅ Email successfully sent to ${options.to}`);
    return { sent: true, devMode: false };
  } catch (error: any) {
    console.error('❌ Failed to send email via SMTP:', error.message);
    // Fallback: also log so user is not blocked
    console.log(`Fallback OTP email for ${options.to}: ${options.text}`);
    return { sent: false, devMode: false };
  }
}

/**
 * Send a 6-digit Verification OTP email with official Uttarakhand Government styling.
 */
export async function sendVerificationOtpEmail(toEmail: string, fullName: string, otp: string): Promise<boolean> {
  const subject = `[Zila Panchayat Safai] Verification Code: ${otp}`;
  const text = `Your Zila Panchayat Safai official verification code is: ${otp}. Valid for 15 minutes.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
        .tricolor { height: 4px; display: flex; width: 100%; }
        .tricolor-green { flex: 1; background: #15803d; }
        .tricolor-white { flex: 1; background: #ffffff; }
        .tricolor-saffron { flex: 1; background: #ea580c; }
        .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .otp-box { background: #f1f5f9; border: 2px dashed #0f172a; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="tricolor">
          <div class="tricolor-green" style="background:#15803d; width:33.3%;"></div>
          <div class="tricolor-white" style="background:#f8fafc; width:33.3%;"></div>
          <div class="tricolor-saffron" style="background:#ea580c; width:33.4%;"></div>
        </div>
        <div class="header">
          <h1>Zila Panchayat Safai</h1>
          <p>Government of Uttarakhand • Command Portal</p>
        </div>
        <div class="content">
          <p>Dear <strong>${fullName || 'Official'}</strong>,</p>
          <p>You have submitted an administrative registration request for the Zila Panchayat Smart Waste Collection Tracking Portal.</p>
          <p>To verify your Gmail address and activate your account, please enter the following 6-digit verification code:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin:8px 0 0 0; font-size:12px; color:#64748b;">Valid for 15 minutes</p>
          </div>

          <p style="font-size:13px; color:#64748b;">
            ⚠️ <strong>Security Notice:</strong> Do not share this passkey or verification code with anyone. If you did not initiate this request, please contact your district IT administrator immediately.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Government of Uttarakhand. All rights reserved.</p>
          <p>NIC Cloud Gateway • 256-Bit SSL Encrypted Communication</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: toEmail, subject, text, html });
  return result.sent;
}
