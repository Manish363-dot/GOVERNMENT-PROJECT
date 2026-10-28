import { Request, Response } from 'express';
import { ContactFormInput } from './contact.schema';
import { sendEmail } from '../notifications/email.service';

export async function submitInquiry(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, subject, message }: ContactFormInput = req.body;
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL || process.env.SMTP_USER || 'ama@zilapanchayatalmora.in';

    // 1. Email notification to District Administration
    const adminSubject = `[जिला पंचायत अल्मोड़ा - नागरिक संदेश/शिकायत] प्रेषक: ${name}`;
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
            <h2>कार्यालय जिला पंचायत अल्मोड़ा</h2>
            <p>पोर्टल नागरिक संदेश / शिकायत • Uttarakhand Shasan</p>
          </div>
          <div class="body">
            <div style="background:#e0f2fe; border:1px solid #bae6fd; border-radius:8px; padding:10px 14px; margin-bottom:18px; font-size:12px; color:#0369a1;">
              <strong>दिनांक (Date):</strong> ${dateFormatted}
            </div>
            <div class="info-row"><span class="label">नागरिक का नाम (Name):</span><span class="value">${name}</span></div>
            <div class="info-row"><span class="label">ईमेल पता (Email):</span><span class="value">${email}</span></div>
            <div class="info-row"><span class="label">दूरभाष / मोबाइल (Phone):</span><span class="value">${phone || 'Not provided'}</span></div>
            
            <p style="margin:18px 0 6px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase;">संदेश / शिकायत विवरण (Message):</p>
            <div class="message-box">${message}</div>
          </div>
          <div class="footer">
            यह संदेश जिला पंचायत अल्मोड़ा के आधिकारिक वेब पोर्टल के माध्यम से प्राप्त हुआ है।
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Acknowledgment email to the Citizen
    const citizenSubject = `[कार्यालय जिला पंचायत अल्मोड़ा] आपका संदेश प्राप्त हुआ`;
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
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tricolor"><div class="saffron"></div><div class="white"></div><div class="green"></div></div>
          <div class="header">
            <h2>कार्यालय जिला पंचायत अल्मोड़ा</h2>
            <p>नागरिक संवाद एवं शिकायत प्रकोष्ठ • उत्तराखण्ड शासन</p>
          </div>
          <div class="body">
            <p>आदरणीय <strong>${name}</strong> जी,</p>
            <p>कार्यालय जिला पंचायत अल्मोड़ा से संपर्क करने के लिए धन्यवाद। आपका संदेश / शिकायत हमें प्राप्त हो गई है।</p>

            <p style="font-size:13px; color:#475569; line-height:1.6;">
              हमारी प्रशासनिक टीम कार्यालय समय (सोमवार से शनिवार, सुबह 10:00 बजे से शाम 5:00 बजे तक) के दौरान प्राप्त सभी संदेशों एवं शिकायतों की समीक्षा करती है। आवश्यक होने पर संबंधित विभाग द्वारा आपके दिए गए विवरण के आधार पर आपसे संपर्क किया जाएगा।
            </p>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:12px; color:#64748b; margin-top:20px;">
              <strong>दिनांक (Date Submitted):</strong> ${dateFormatted}
            </div>

            <p style="margin-top:24px; font-size:13px; color:#334155;">
              सादर,<br />
              <strong>कार्यालय अपर मुख्य अधिकारी (AMA)</strong><br />
              जिला पंचायत अल्मोड़ा, उत्तराखण्ड शासन
            </p>
          </div>
          <div class="footer">
            हेल्पलाइन: +91 9456790163 &nbsp;|&nbsp; ईमेल: ama@zilapanchayatalmora.in<br />
            कार्यालय जिला पंचायत अल्मोड़ा, धारानौला, अल्मोड़ा — 263601
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
        text: `नागरिक संदेश: ${name} (${email}, ${phone}):\n\n${message}`,
      }),
      sendEmail({
        to: email,
        subject: citizenSubject,
        html: citizenHtml,
        text: `आदरणीय ${name} जी,\n\nकार्यालय जिला पंचायत अल्मोड़ा से संपर्क करने के लिए धन्यवाद। आपका संदेश प्राप्त हो गया है।\n\nकार्यालय अपर मुख्य अधिकारी (AMA)\nजिला पंचायत अल्मोड़ा`,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'आपका संदेश सफलतापूर्वक प्रेषित कर दिया गया है।',
    });
  } catch (error: any) {
    console.error('Error submitting contact inquiry:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit inquiry',
    });
  }
}
