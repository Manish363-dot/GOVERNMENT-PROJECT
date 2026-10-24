import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore in environments where not supported
}

/**
 * Meta WhatsApp Cloud API Service
 * Handles sending WhatsApp OTPs, complaint confirmation receipts, and status update notifications.
 */

interface WhatsAppConfig {
  token: string | null;
  phoneNumberId: string | null;
  apiVersion: string;
}

const config: WhatsAppConfig = {
  token: process.env.WHATSAPP_TOKEN || null,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
};

/**
 * Format Indian mobile numbers to international WhatsApp format: 91XXXXXXXXXX
 */
export function formatWhatsAppNumber(mobile: string): string {
  const clean = mobile.replace(/\D/g, '');
  if (clean.length === 10) {
    return `91${clean}`;
  }
  if (clean.length === 12 && clean.startsWith('91')) {
    return clean;
  }
  return clean;
}

/**
 * Low-level sender to Meta Cloud API Graph endpoint
 */
async function sendMetaGraphMessage(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN || config.token;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || config.phoneNumberId;

  if (!token || !phoneNumberId) {
    console.warn('⚠️ [WhatsApp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in .env. Message logged to console only.');
    return { success: false, error: 'WhatsApp API credentials not configured' };
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData: any = await response.json();

    if (!response.ok) {
      const errCode = responseData?.error?.code;
      const errMsg = responseData?.error?.message;
      console.error(`❌ [WhatsApp API Error ${errCode}]:`, errMsg);

      if (errCode === 131030) {
        console.warn('⚠️ [Action Required]: Meta Test Sandbox requires you to add your mobile number to "Manage phone number list" in Meta Developer Portal before it can deliver messages.');
      }

      return { 
        success: false, 
        error: errMsg || `HTTP ${response.status} WhatsApp error` 
      };
    }

    console.log('✅ [WhatsApp] Message delivered successfully to Meta API! Message ID:', responseData?.messages?.[0]?.id);
    return { success: true, data: responseData };
  } catch (err: any) {
    console.error('❌ [WhatsApp Network Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send WhatsApp Verification OTP to citizen
 */
export async function sendWhatsAppOtp(mobile: string, otp: string): Promise<{ success: boolean; devOtp?: string; error?: string }> {
  const formattedTo = formatWhatsAppNumber(mobile);

  console.log(`\n========================================`);
  console.log(`📲 [WHATSAPP OTP] To: +${formattedTo}`);
  console.log(`🔑 Verification Code: ${otp}`);
  console.log(`⏰ Valid for 5 Minutes`);
  console.log(`========================================\n`);

  // Meta Cloud API template payload (guaranteed delivery for outbound business messages)
  const templatePayload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_OTP_TEMPLATE || 'jaspers_market_order_confirmation_v1',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'नागरिक (Citizen)' },
            { type: 'text', text: `OTP: ${otp}` },
            { type: 'text', text: '5 Minutes' },
          ],
        },
      ],
    },
  };

  const result = await sendMetaGraphMessage(templatePayload);

  return {
    success: result.success,
    devOtp: otp,
    error: result.error,
  };
}

/**
 * Send Complaint Registration Confirmation Receipt on WhatsApp
 */
export async function sendWhatsAppComplaintReceipt(
  mobile: string,
  details: {
    complaintNumber: string;
    citizenName: string;
    area: string;
    complaintType: string;
    trackingUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const formattedTo = formatWhatsAppNumber(mobile);

  const templatePayload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_RECEIPT_TEMPLATE || 'jaspers_market_order_confirmation_v1',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: details.citizenName },
            { type: 'text', text: `#${details.complaintNumber}` },
            { type: 'text', text: details.area },
          ],
        },
      ],
    },
  };

  return await sendMetaGraphMessage(templatePayload);
}

/**
 * Send Status Update Notification on WhatsApp
 */
export async function sendWhatsAppStatusUpdate(
  mobile: string,
  details: {
    complaintNumber: string;
    citizenName: string;
    newStatus: 'new' | 'in_progress' | 'resolved';
    remark?: string | null;
    trackingUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const formattedTo = formatWhatsAppNumber(mobile);
  const portalUrl = details.trackingUrl || `http://localhost:5173/complaints?tab=track&query=${details.complaintNumber}`;

  const statusTitleHi = 
    details.newStatus === 'resolved' 
      ? '✅ समस्या का समाधान कर दिया गया है (Resolved)' 
      : details.newStatus === 'in_progress'
      ? '🟡 कार्य प्रगति पर है (In Progress - Assigned to Sanitation Team)'
      : '📋 शिकायत समीक्षा में है (Under Review)';

  const messageBody = 
`🏛️ *ग्राम पंचायत - शिकायत स्थिति अपडेट*
━━━━━━━━━━━━━━━━━━━━━━━━
नमस्ते *${details.citizenName}*,

आपकी शिकायत संख्या *#${details.complaintNumber}* की स्थिति अपडेट की गई है:

📊 *नई स्थिति:* ${statusTitleHi}
${details.remark ? `💬 *अधिकारी की टिप्पणी:* "${details.remark}"\n` : ''}
🔗 *विवरण देखें व पुष्टि करें:*
${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━
_स्वच्छ ग्राम - स्वस्थ उत्तराखंड_`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedTo,
    type: 'text',
    text: {
      preview_url: true,
      body: messageBody,
    },
  };

  return await sendMetaGraphMessage(payload);
}
