import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore in environments where not supported
}

/**
 * Meta WhatsApp Cloud API Service
 * Handles sending complaint confirmation receipts and status update notifications.
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
 * Check Meta WhatsApp Cloud API configuration status (no secret leakage)
 */
export function getWhatsAppConfigStatus() {
  const token = process.env.WHATSAPP_TOKEN || config.token;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || config.phoneNumberId;
  const apiVersion = process.env.WHATSAPP_API_VERSION || config.apiVersion || 'v20.0';
  const rentalTemplate = process.env.WHATSAPP_RENTAL_NOTICE_TEMPLATE || null;

  return {
    configured: Boolean(token && phoneNumberId),
    apiVersion,
    phoneNumberIdMasked: phoneNumberId ? `***${phoneNumberId.slice(-4)}` : null,
    rentalTemplate,
  };
}

/**
 * Low-level sender to Meta Cloud API Graph endpoint
 */
async function sendMetaGraphMessage(
  payload: any
): Promise<{ success: boolean; messageId?: string; errorCode?: number; data?: any; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN || config.token;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || config.phoneNumberId;
  const apiVersion = process.env.WHATSAPP_API_VERSION || config.apiVersion || 'v20.0';

  if (!token || !phoneNumberId) {
    console.warn('⚠️ [WhatsApp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in .env. Message logged to console only.');
    return { success: false, error: 'Meta WhatsApp API credentials (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID) not configured in backend .env' };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

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
        console.warn('⚠️ [Action Required]: Meta Test Sandbox requires adding this number to the recipient allowlist in Meta Developer Portal.');
      } else if (errCode === 131047) {
        console.warn('⚠️ [Meta 24h Window]: Outside 24h session window — configure an approved Utility template in WHATSAPP_RENTAL_NOTICE_TEMPLATE.');
      }

      const helpfulError =
        errCode === 131047
          ? `${errMsg || 'Re-engagement required'} (24h window closed — set WHATSAPP_RENTAL_NOTICE_TEMPLATE in .env)`
          : errCode === 131030
          ? `${errMsg || 'Recipient not allowed'} (Add mobile number to Meta Sandbox allowlist or switch to Live mode)`
          : errMsg || `HTTP ${response.status} WhatsApp error`;

      return {
        success: false,
        errorCode: errCode,
        error: helpfulError,
      };
    }

    const messageId = responseData?.messages?.[0]?.id;
    console.log('✅ [WhatsApp] Message delivered successfully to Meta API! Message ID:', messageId);
    return { success: true, messageId, data: responseData };
  } catch (err: any) {
    console.error('❌ [WhatsApp Network Error]:', err.message);
    return { success: false, error: err.message };
  }
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
  const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
  const portalUrl = details.trackingUrl || `${baseUrl}/complaints?tab=track&query=${details.complaintNumber}`;

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

/**
 * Builds official Zila Panchayat Almora rental notice WhatsApp message text & wa.me fallback URL
 */
export function buildRentalNoticeWhatsAppPayload(
  mobile: string,
  details: {
    noticeNumber: string;
    title: string;
    message: string;
    priority?: string;
    tenantName?: string;
    shopNumber?: string | null;
  }
): { formattedTo: string; messageBody: string; whatsappUrl: string } {
  const formattedTo = formatWhatsAppNumber(mobile);
  const baseUrl = (process.env.FRONTEND_URL || 'https://zilapanchayatalmora.in')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');
  const statusUrl = `${baseUrl}/rental/check-status`;

  const priorityLabel =
    details.priority === 'URGENT'
      ? 'अति आवश्यक (URGENT)'
      : details.priority === 'IMPORTANT'
      ? 'महत्वपूर्ण (IMPORTANT)'
      : 'सामान्य (NORMAL)';

  const shopLine = details.shopNumber ? `\n🏪 *आवंटित दुकान:* ${details.shopNumber}` : '';
  const tenantLine = details.tenantName ? `\n👤 *किरायेदार:* ${details.tenantName}` : '';

  const messageBody =
`🏛️ *कार्यालय जिला पंचायत अल्मोड़ा*
_वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन प्रकोष्ठ_
━━━━━━━━━━━━━━━━━━━━
📜 *सूचना संख्या:* ${details.noticeNumber}
⚡ *प्राथमिकता:* ${priorityLabel}${tenantLine}${shopLine}

📌 *विषय:* ${details.title}

${details.message}

🔗 *किराया स्थिति एवं रसीद देखें:*
${statusUrl}
━━━━━━━━━━━━━━━━━━━━
_कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड शासन)_`;

  const whatsappUrl = `https://wa.me/${formattedTo}?text=${encodeURIComponent(messageBody)}`;
  return { formattedTo, messageBody, whatsappUrl };
}

/**
 * Send Individual Commercial Rental Notice to Tenant's Registered WhatsApp Number via Meta Cloud API.
 * Uses WHATSAPP_RENTAL_NOTICE_TEMPLATE if configured (for business-initiated templates outside 24h),
 * otherwise sends a formatted text message directly via Meta Graph API.
 */
export async function sendWhatsAppRentalNotice(
  mobile: string,
  details: {
    noticeNumber: string;
    title: string;
    message: string;
    priority?: string;
    tenantName?: string;
    shopNumber?: string | null;
  }
): Promise<{
  success: boolean;
  messageId?: string;
  errorCode?: number;
  error?: string;
  whatsappUrl: string;
  messageBody: string;
}> {
  const { formattedTo, messageBody, whatsappUrl } = buildRentalNoticeWhatsAppPayload(mobile, details);
  const templateName = process.env.WHATSAPP_RENTAL_NOTICE_TEMPLATE?.trim();
  const templateLang = process.env.WHATSAPP_RENTAL_NOTICE_TEMPLATE_LANG?.trim() || 'en';

  const sanitizeTplParam = (val?: string | null, maxLen = 900, fallback = '-') => {
    const cleaned = (val || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return (cleaned || fallback).slice(0, maxLen);
  };

  let payload: any;
  if (templateName) {
    payload = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLang },
        ...(templateName !== 'hello_world'
          ? {
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: sanitizeTplParam(details.tenantName, 120, 'किरायेदार') },
                    { type: 'text', text: sanitizeTplParam(details.noticeNumber, 80, 'NOTICE') },
                    { type: 'text', text: sanitizeTplParam(details.title, 200, 'सूचना') },
                    { type: 'text', text: sanitizeTplParam(details.message, 900, '-') },
                  ],
                },
              ],
            }
          : {}),
      },
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedTo,
      type: 'text',
      text: {
        preview_url: true,
        body: messageBody,
      },
    };
  }

  const apiResult = await sendMetaGraphMessage(payload);
  return {
    success: apiResult.success,
    messageId: apiResult.messageId,
    errorCode: apiResult.errorCode,
    error: apiResult.error,
    whatsappUrl,
    messageBody,
  };
}
