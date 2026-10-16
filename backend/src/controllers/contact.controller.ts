import { Request, Response } from 'express';
import { ContactFormInput } from '../schemas/contact.schema';
import { sendEmail } from '../services/email.service';

export async function submitInquiry(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, subject, message }: ContactFormInput = req.body;
    const referenceId = `INQ-${Date.now().toString().slice(-6)}`;
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL || 'amazpalmora@gmail.com';

    // 1. Email notification to District Administration
    const adminSubject = `[Inquiry #${referenceId}] New Contact Form Submission - ${subject}`;
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; }
          .tricolor { height: 4px; display: flex; width: 100%; }
          .saffron { flex: 1; background: #ea580c; }
          .white { flex: 1; background: #ffffff; }
          .green { flex: 1; background: #16a34a; }
          .header { background: #0f172a; padding: 24px; color: #ffffff; text-align: center; }
          .header h2 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
          .body { padding: 28px 24px; color: #334155; }
          .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-size: 13px; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 600; }
          .message-box { background: #f8fafc; border-left: 4px solid #ea580c; padding: 16px; border-radius: 6px; margin: 20px 0 10px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tricolor"><div class="saffron"></div><div class="white"></div><div class="green"></div></div>
          <div class="header">
            <h2>Zila Panchayat Almora — Citizen Inquiry</h2>
            <p>Solid Waste Management & Tracking Portal</p>
          </div>
          <div class="body">
            <div style="background:#e0f2fe; border:1px solid #bae6fd; border-radius:8px; padding:12px; margin-bottom:18px; font-size:12px; color:#0369a1;">
              <strong>Ref ID:</strong> ${referenceId} &nbsp;|&nbsp; <strong>Date:</strong> ${dateFormatted}
            </div>
            <div class="info-row"><span class="label">Sender Name:</span><span class="value">${name}</span></div>
            <div class="info-row"><span class="label">Email Address:</span><span class="value">${email}</span></div>
            <div class="info-row"><span class="label">Phone / Mobile:</span><span class="value">${phone || 'Not provided'}</span></div>
            <div class="info-row"><span class="label">Subject / Topic:</span><span class="value">${subject}</span></div>
            
            <p style="margin:18px 0 6px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase;">Message / Query:</p>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">
            This message was sent via the Zila Panchayat Almora Official Web Portal Contact Form.
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Acknowledgment email to the Citizen
    const citizenSubject = `[Ref #${referenceId}] Your inquiry has been received — Zila Panchayat Almora`;
    const citizenHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; }
          .tricolor { height: 4px; display: flex; width: 100%; }
          .saffron { flex: 1; background: #ea580c; }
          .white { flex: 1; background: #ffffff; }
          .green { flex: 1; background: #16a34a; }
          .header { background: #0f172a; padding: 24px; color: #ffffff; text-align: center; }
          .header h2 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
          .body { padding: 28px 24px; color: #334155; }
          .ref-banner { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px; text-align:center; margin-bottom:20px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tricolor"><div class="saffron"></div><div class="white"></div><div class="green"></div></div>
          <div class="header">
            <h2>District Panchayat Almora</h2>
            <p>Official Grievance & Citizen Communication Desk</p>
          </div>
          <div class="body">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for contacting the <strong>District Panchayat Almora — Solid Waste Management & Vehicle Tracking Administration</strong>. We have received your inquiry.</p>
            
            <div class="ref-banner">
              <span style="font-size:11px; color:#15803d; text-transform:uppercase; font-weight:700; letter-spacing:1px; display:block;">Inquiry Reference Number</span>
              <span style="font-size:24px; font-weight:800; color:#14532d; font-family:monospace; letter-spacing:2px;">${referenceId}</span>
            </div>

            <p style="font-size:13px; color:#475569; line-height:1.6;">
              Our administrative team reviews all incoming inquiries during standard office hours (Monday – Saturday, 10:00 AM to 5:00 PM). If your message requires departmental action or a formal response, a representative will reach out to you at this email address or your provided phone number.
            </p>

            <div style="background:#f8fafc; border-radius:8px; padding:12px; font-size:12px; color:#64748b; margin-top:20px;">
              <strong>Subject:</strong> ${subject}<br />
              <strong>Date Submitted:</strong> ${dateFormatted}
            </div>

            <p style="margin-top:24px; font-size:13px; color:#334155;">
              Warm regards,<br />
              <strong>Apar Mukhya Adhikari (AMA) Desk</strong><br />
              Zila Panchayat Almora, Uttarakhand
            </p>
          </div>
          <div class="footer">
            Toll-Free Helpline: 1800-185-1850 &nbsp;|&nbsp; Email: amazpalmora@gmail.com<br />
            Government of Uttarakhand • Swachh Bharat Mission (Grameen)
          </div>
        </div>
      </body>
      </html>
    `;

    // Trigger emails concurrently
    await Promise.allSettled([
      sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
        text: `New contact form submission from ${name} (${email}, ${phone}):\n\nSubject: ${subject}\n\n${message}`,
      }),
      sendEmail({
        to: email,
        subject: citizenSubject,
        html: citizenHtml,
        text: `Dear ${name},\n\nWe have received your inquiry (Ref #${referenceId}). Our team will review your message and respond if needed.\n\nRegards,\nZila Panchayat Almora`,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been sent successfully. An acknowledgment has been emailed to you.',
      referenceId,
    });
  } catch (error: any) {
    console.error('Error submitting contact inquiry:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit inquiry',
    });
  }
}
