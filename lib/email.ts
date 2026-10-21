import nodemailer from 'nodemailer';
import { getProductImage } from './enhanced-products';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
}

// Helper to sanitize HTML in email templates
function escapeHtml(text: string | number | undefined | null): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to convert relative URLs to absolute URLs for email with proper encoding for email clients (Gmail/Apple)
function getAbsoluteImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return encodeURI(imagePath);
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funprints.vercel.app';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${encodeURI(cleanPath)}`;
}

// Helper for responsive Head tag with website font and media queries
function getEmailHead(title: string): string {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${escapeHtml(title)}</title>
    <style>
      /* Mobile responsive & compact rules */
      @media only screen and (max-width: 600px) {
        .email-outer-td { padding: 6px 0 !important; }
        .email-container { width: 100% !important; max-width: 100% !important; border-radius: 8px !important; }
        .email-header-padding { padding: 16px 12px !important; }
        .email-card-padding { padding: 12px 10px !important; }
        .email-footer-padding { padding: 16px 10px !important; }
        .email-inner-card { padding: 8px 10px !important; margin-bottom: 8px !important; }
        .mobile-logo { width: 44px !important; height: 44px !important; margin-bottom: 6px !important; }
        .mobile-title { font-size: 16px !important; line-height: 1.25 !important; }
        .mobile-subtitle { font-size: 11px !important; }
        .mobile-text-sm { font-size: 11px !important; }
        .mobile-text-xs { font-size: 10px !important; }
        .mobile-thumb { width: 40px !important; height: 40px !important; }
        .mobile-thumb-td { width: 44px !important; padding-right: 6px !important; }
        .mobile-btn { padding: 5px 10px !important; font-size: 10.5px !important; }
        .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      }
    </style>
  `;
}

// Helper for unified header with official FunPrint Logo and brand styling
function getEmailHeader(title: string, subtitle?: string, accentColor: string = '#FFC006'): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funprints.vercel.app';
  const logoUrl = `${baseUrl}/logo.png`;
  return `
    <tr>
      <td class="email-header-padding" style="background-color: #0a0a0a; padding: 20px 16px; text-align: center; border-bottom: 3px solid ${accentColor}; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <img class="mobile-logo" src="${logoUrl}" alt="FunPrint" width="48" height="48" style="display: block; margin: 0 auto 8px auto; width: 48px; height: 48px; object-fit: contain;" />
        <h1 class="mobile-title" style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.2px; line-height: 1.25;">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="mobile-subtitle" style="margin: 4px 0 0 0; color: ${accentColor}; font-size: 11.5px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.3px;">${escapeHtml(subtitle)}</p>` : ''}
      </td>
    </tr>
  `;
}

// Configurable company and contact constants
const DEFAULT_SUPPORT_PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9344925600';
const DEFAULT_SUPPORT_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@funprint.in';
const DEFAULT_COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'OSHIVO EXIM (OPC) PVT LTD';
const DEFAULT_COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'No: 325, Paper Mills Road, Perambur';

// Helper for unified footer with complete company information, social links, and copyright (strictly no emojis)
function getEmailFooterHtml(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://funprints.vercel.app';
  return `
    <!-- Branded Clean Responsive Compact Footer -->
    <tr>
      <td class="email-footer-padding" style="background-color: #0a0a0a; padding: 16px 12px; text-align: center; border-top: 3px solid #FFC006; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <p style="margin: 0 0 2px 0; color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">FunPrint</p>
        <p style="margin: 0 0 2px 0; color: #FFC006; font-size: 11.5px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Unleash Your Style with FunPrint</p>
        <p style="margin: 0 0 10px 0; color: #d4d4d8; font-size: 11px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Tiruppur &amp; Chennai</p>
        
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto 10px auto; text-align: center;">
          <tr>
            <td style="padding: 3px 6px;">
              <a href="https://instagram.com/funprint.in" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #18181b; color: #f4f4f5; font-size: 11px; font-weight: 600; text-decoration: none; padding: 6px 14px; border-radius: 9999px; border: 1px solid #3f3f46; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Instagram
              </a>
            </td>
            <td style="padding: 3px 6px;">
              <a href="${baseUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #18181b; color: #f4f4f5; font-size: 11px; font-weight: 600; text-decoration: none; padding: 6px 14px; border-radius: 9999px; border: 1px solid #3f3f46; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                funprint.in
              </a>
            </td>
          </tr>
        </table>

        <div style="border-top: 1px solid #27272a; padding-top: 10px; margin-top: 6px; color: #a1a1aa; font-size: 11px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <p style="margin: 0; font-weight: 800; color: #f4f4f5; font-size: 11.5px; letter-spacing: 0.3px;">${escapeHtml(DEFAULT_COMPANY_NAME)}</p>
          <p style="margin: 2px 0 0 0; color: #d4d4d8;">${escapeHtml(DEFAULT_COMPANY_ADDRESS)}</p>
          <p style="margin: 3px 0 0 0;">
            Phone: <a href="tel:${escapeHtml(DEFAULT_SUPPORT_PHONE)}" style="color: #FFC006; text-decoration: none; font-weight: 700;">${escapeHtml(DEFAULT_SUPPORT_PHONE)}</a> &nbsp;&bull;&nbsp; 
            Email: <a href="mailto:${escapeHtml(DEFAULT_SUPPORT_EMAIL)}" style="color: #FFC006; text-decoration: none; font-weight: 700;">${escapeHtml(DEFAULT_SUPPORT_EMAIL)}</a>
          </p>
          <p style="margin: 8px 0 0 0; color: #71717a; font-size: 10px; border-top: 1px dashed #27272a; padding-top: 8px;">
            &copy; 2026 FunPrint. All rights reserved.
          </p>
        </div>
      </td>
    </tr>
  `;
}

// 1. ORDER CONFIRMATION TO CUSTOMER
export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const isCod = (data.paymentMethod || '').toUpperCase().includes('COD');

  const itemsHtml = data.items
    .map((item) => {
      const itemImage = item.image || getProductImage(item.name, item.color);
      return `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${itemImage ? `<td width="48" class="mobile-thumb-td" style="width: 48px; padding-right: 8px; vertical-align: middle;"><img class="mobile-thumb" src="${getAbsoluteImageUrl(itemImage)}" alt="${escapeHtml(item.name)}" width="44" height="44" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; display: block;" /></td>` : ''}
            <td style="vertical-align: middle;">
              <div style="font-weight: 700; color: #111827; margin-bottom: 2px; font-size: 12.5px; line-height: 1.25; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">${escapeHtml(item.name)}</div>
              <div style="font-size: 11px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Color: <strong>${escapeHtml(item.color)}</strong> &bull; Size: <strong>${escapeHtml(item.size)}</strong></div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #111827; font-weight: 600; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; vertical-align: middle;">${Number(item.quantity)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800; color: #111827; font-size: 12.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif; vertical-align: middle; white-space: nowrap;">₹${Number(item.price) * Number(item.quantity)}</td>
    </tr>
  `;
    })
    .join('');

  const mailOptions = {
    from: `"FunPrint Orders" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Order Placed: ${data.orderId} | FunPrint`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Order Placed - ${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <!-- Header with Logo -->
                ${getEmailHeader('Order Placed Successfully!', 'Thank you for shopping with FunPrint')}
                
                <!-- Order ID & Payment Method Badge -->
                <tr>
                  <td class="email-card-padding" style="padding: 12px 14px 8px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0" class="email-inner-card" style="background-color: #f8fafc; border-radius: 8px; padding: 8px 12px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Order Reference</p>
                          <p style="margin: 2px 0 0 0; color: #0f172a; font-size: 15px; font-weight: 900; font-family: monospace; white-space: nowrap;">${escapeHtml(data.orderId)}</p>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <span style="display: inline-block; background-color: ${isCod ? '#eff6ff' : '#fef3c7'}; color: ${isCod ? '#1e40af' : '#b45309'}; padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 800; border: 1px solid ${isCod ? '#bfdbfe' : '#fde68a'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space: nowrap;">
                            ${isCod ? 'Cash on Delivery (COD)' : 'Manual UPI Payment'}
                          </span>
                        </td>
                      </tr>
                      ${isCod ? `
                      <tr>
                        <td colspan="2" style="padding-top: 6px; border-top: 1px dashed #e2e8f0; margin-top: 6px;">
                          <p style="margin: 0; color: #1e40af; font-size: 11px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Pay cash or UPI upon package handover at your doorstep
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td class="email-card-padding" style="padding: 0 14px 10px 14px;">
                    <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Hi <strong>${escapeHtml(data.customerName)}</strong>, your order has been received. Our team is reviewing the details before moving it to production.
                    </p>
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td class="email-card-padding" style="padding: 0 14px 10px 14px;">
                    <div style="margin: 0 0 6px 0; color: #0f172a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Items in Order</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <th style="padding: 6px 10px; text-align: left; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Product</th>
                          <th style="padding: 6px 8px; text-align: center; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Qty</th>
                          <th style="padding: 6px 10px; text-align: right; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Price Summary -->
                <tr>
                  <td class="email-card-padding" style="padding: 0 14px 10px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0" class="email-inner-card" style="background-color: #f8fafc; border-radius: 8px; padding: 10px 12px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <tr>
                        <td style="color: #64748b; font-size: 12px; padding: 2px 0;">Subtotal</td>
                        <td style="text-align: right; color: #0f172a; font-size: 12px; font-weight: 600; padding: 2px 0;">₹${Number(data.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 12px; padding: 2px 0;">Pan-India Delivery</td>
                        <td style="text-align: right; color: #16a34a; font-size: 12px; font-weight: 800; padding: 2px 0;">FREE</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-size: 12px; padding: 2px 0;">Payment Method</td>
                        <td style="text-align: right; color: #0f172a; font-size: 12px; font-weight: 700; padding: 2px 0;">
                          ${isCod ? 'Cash on Delivery (COD)' : 'Manual UPI Payment'}
                        </td>
                      </tr>
                      <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="color: #0f172a; font-size: 13px; font-weight: 800; padding-top: 6px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Total Amount</td>
                        <td style="text-align: right; color: #0f172a; font-size: 15px; font-weight: 900; padding-top: 6px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">₹${Number(data.totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td class="email-card-padding" style="padding: 0 14px 10px 14px;">
                    <div style="margin: 0 0 6px 0; color: #0f172a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Shipping &amp; Contact Details</div>
                    <table width="100%" cellpadding="0" cellspacing="0" class="email-inner-card" style="background-color: #f8fafc; border-radius: 8px; padding: 10px 12px; border-left: 3px solid #FFC006; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 2px 0; color: #0f172a; font-size: 12.5px; font-weight: 800;">${escapeHtml(data.customerName)}</p>
                          <p style="margin: 0; color: #475569; font-size: 11.5px; line-height: 1.45;">
                            ${escapeHtml(data.customerAddress)}<br>
                            Mobile: ${escapeHtml(data.customerMobile)} &bull; Email: ${escapeHtml(data.customerEmail)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Next Steps Info -->
                <tr>
                  <td class="email-card-padding" style="padding: 0 14px 14px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0" class="email-inner-card" style="background-color: ${isCod ? '#eff6ff' : '#ecfdf5'}; border-radius: 8px; padding: 10px 12px; border-left: 3px solid ${isCod ? '#3b82f6' : '#10b981'}; border: 1px solid ${isCod ? '#bfdbfe' : '#a7f3d0'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px 0; color: ${isCod ? '#1e40af' : '#065f46'}; font-size: 12px; font-weight: 800;">
                            ${isCod ? 'Cash on Delivery (COD) Instructions' : 'Order & Payment Verification'}
                          </p>
                          <p style="margin: 0; color: ${isCod ? '#1d4ed8' : '#047857'}; font-size: 11px; line-height: 1.45;">
                            ${isCod 
                              ? `&bull; <strong>Doorstep Payment:</strong> Pay cash or UPI upon handover (₹${Number(data.totalAmount)}).<br>
                                 &bull; <strong>Order Verification:</strong> Our admin team will verify and confirm before dispatch.<br>
                                 &bull; Live tracking information will be emailed once dispatched.<br>
                                 &bull; Delivery in 3-5 business days across India.`
                              : `&bull; <strong>UPI Verification:</strong> Please ensure your 12-digit UTR is submitted. Our team will verify before dispatch.<br>
                                 &bull; Live tracking information will be emailed once dispatched.<br>
                                 &bull; Delivery in 3-5 business days across India.`
                            }
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Branded Footer -->
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 2. ORDER NOTIFICATION TO ADMIN
// Designated Admin recipient mailbox for order alerts and form submissions
export const ADMIN_NOTIFICATION_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.SMTP_USER,
].filter(Boolean) as string[];

// 2. ORDER NOTIFICATION TO ADMIN
export async function sendOrderNotificationToAdmin(data: OrderEmailData, recipientOverride?: string | string[]) {
  const isCod = (data.paymentMethod || '').toUpperCase().includes('COD');

  const itemsHtml = data.items
    .map((item) => {
      const itemImage = item.image || getProductImage(item.name, item.color);
      return `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${itemImage ? `<td width="48" class="mobile-thumb-td" style="width: 48px; padding-right: 8px; vertical-align: middle;"><img class="mobile-thumb" src="${getAbsoluteImageUrl(itemImage)}" alt="${escapeHtml(item.name)}" width="44" height="44" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; display: block;" /></td>` : ''}
            <td style="vertical-align: middle;">
              <div style="font-weight: 700; color: #111827; margin-bottom: 2px; font-size: 12.5px; line-height: 1.25; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">${escapeHtml(item.name)}</div>
              <div style="font-size: 11px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${escapeHtml(item.color)} &bull; ${escapeHtml(item.size)}</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 8px 6px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #111827; font-weight: 600; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; vertical-align: middle;">${Number(item.quantity)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #111827; font-size: 12.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif; vertical-align: middle; white-space: nowrap;">₹${Number(item.price) * Number(item.quantity)}</td>
    </tr>
  `;
    })
    .join('');

  const mailOptions = {
    from: `"FunPrint System" <${process.env.SMTP_USER}>`,
    to: recipientOverride || ADMIN_NOTIFICATION_EMAILS,
    subject: `New Order Alert: ${escapeHtml(data.orderId)} | ₹${Number(data.totalAmount)} [${isCod ? 'COD' : 'UPI'}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`New Order Alert - ${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                ${getEmailHeader('New Customer Order Alert', `Order ID: ${data.orderId}`)}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <!-- Action Required Notice -->
                    <div class="email-inner-card" style="background: ${isCod ? '#eff6ff' : '#fef3c7'}; border-left: 3px solid ${isCod ? '#3b82f6' : '#f59e0b'}; padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <div style="font-weight: 800; font-size: 12px; color: ${isCod ? '#1e40af' : '#92400e'}; margin-bottom: 2px;">
                        Action Required &mdash; ${isCod ? 'Cash on Delivery (COD) Verification' : 'UPI Payment Verification'}
                      </div>
                      <div style="color: ${isCod ? '#1d4ed8' : '#78350f'}; font-size: 11.5px; line-height: 1.45;">
                        ${isCod 
                          ? 'Customer selected <strong>Cash on Delivery (COD)</strong>: "Pay cash or UPI upon package handover at your doorstep". Please check the order details in the Admin Portal under <strong>Verify Payments</strong> and confirm the order before dispatch.' 
                          : 'Customer selected <strong>Manual UPI Payment</strong>. Please check the customer UTR in the Admin Portal under <strong>Verify Payments</strong> and verify against the merchant bank statement before confirming order.'}
                      </div>
                    </div>

                    <!-- Customer & Payment Details -->
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 4px;">Order &amp; Customer Details</div>
                      <div style="color: #334155; font-size: 11.5px; line-height: 1.5;">
                        <strong>Payment Method:</strong> ${isCod ? '<span style="color: #1e40af; font-weight: 800;">Cash on Delivery (COD)</span> &bull; Doorstep' : '<span style="color: #92400e; font-weight: 800;">Manual UPI Payment</span> &bull; Pending'}<br>
                        <strong>Customer Name:</strong> ${escapeHtml(data.customerName)}<br>
                        <strong>Email:</strong> ${escapeHtml(data.customerEmail)} &bull; <strong>Mobile:</strong> ${escapeHtml(data.customerMobile)}<br>
                        <strong>Delivery Address:</strong> ${escapeHtml(data.customerAddress)}
                      </div>
                    </div>

                    <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Order Items</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                      <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <th style="padding: 6px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Product</th>
                          <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Qty</th>
                          <th style="padding: 6px 10px; text-align: right; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-inner-card" style="background-color: #0f172a; border-radius: 8px; margin-bottom: 10px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
                      <tr>
                        <td style="padding: 8px 12px; color: #ffffff; font-size: 12.5px; font-weight: 700; text-align: left; vertical-align: middle;">
                          Total Order Value (${isCod ? 'COD Due' : 'UPI Collected'})
                        </td>
                        <td align="right" style="padding: 8px 12px; color: #FFC006; font-size: 16px; font-weight: 900; text-align: right; vertical-align: middle; white-space: nowrap;">
                          ₹${Number(data.totalAmount)}
                        </td>
                      </tr>
                    </table>

                    <div class="email-inner-card" style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 10px 12px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <div style="font-weight: 800; color: #065f46; font-size: 12px; margin-bottom: 2px;">Next Steps for Admin</div>
                      <div style="color: #047857; font-size: 11px; line-height: 1.45;">
                        1. Open Admin Dashboard &gt; <strong>Verify Payments</strong> tab.<br>
                        2. Check and click <strong>Verify Payment</strong> to confirm the order.<br>
                        3. Print shipping label and dispatch via courier with live tracking.
                      </div>
                    </div>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 3. CONTACT FORM ENQUIRY (Sends to both receiver and both admin emails)
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  mobile: string;
  message: string;
}) {
  return sendContactFormEmails(data);
}

export async function sendContactFormEmails(data: {
  name: string;
  email: string;
  mobile: string;
  message: string;
}, adminRecipientOverride?: string | string[]) {
  // 1. Notification to both Admins
  const adminMail = {
    from: `"FunPrint Contact Form" <${process.env.SMTP_USER}>`,
    to: adminRecipientOverride || ADMIN_NOTIFICATION_EMAILS,
    replyTo: data.email,
    subject: `New Contact Enquiry - ${escapeHtml(data.name)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`New Contact Form - ${data.name}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('New Contact Enquiry', 'Website Support Message')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12.5px;"><strong>Sender Name:</strong> ${escapeHtml(data.name)}</p>
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12.5px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a></p>
                      <p style="margin: 0; color: #1e293b; font-size: 12.5px;"><strong>Mobile:</strong> <a href="tel:${escapeHtml(data.mobile)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.mobile)}</a></p>
                    </div>
                    <div class="email-inner-card" style="background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 8px; padding: 10px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <strong style="color: #854d0e; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</strong>
                      <div style="color: #713f12; line-height: 1.5; font-size: 12.5px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
                    </div>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  // 2. Confirmation to Customer / Receiver
  const customerMail = {
    from: `"FunPrint Customer Care" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: `We Received Your Enquiry - FunPrint`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead('Enquiry Received - FunPrint')}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('Thank You for Contacting FunPrint', 'Enquiry Received')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <p style="color: #1e293b; font-size: 13.5px; margin-top: 0; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.name)}</strong>,</p>
                    <div class="email-inner-card" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; margin: 10px 0; text-align: center; color: #15803d; font-size: 13px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      We received your enquiry form, we will contact you soon!
                    </div>
                    <p style="color: #475569; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0;">
                      Thank you for contacting us. We have received your enquiry and our team will get back to you shortly.
                    </p>
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 0 0 4px 0; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase;">Your Submitted Enquiry:</p>
                      <div style="color: #334155; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
                    </div>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0 0 0;">
                      For immediate assistance, please call our support desk at <a href="tel:${escapeHtml(DEFAULT_SUPPORT_PHONE)}" style="color: #0f172a; font-weight: 700;">${escapeHtml(DEFAULT_SUPPORT_PHONE)}</a>.
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return Promise.allSettled([
    transporter.sendMail(adminMail),
    transporter.sendMail(customerMail),
  ]);
}

// 4. BULK ORDER ENQUIRIES (Sends to customer and admin)
export async function sendBulkOrderEmails(data: {
  name: string;
  email?: string;
  mobile: string;
  company?: string;
  productType?: string;
  quantity?: string | number;
  message?: string;
  customizations?: string[];
}, adminRecipientOverride?: string | string[]) {
  const rawCustomizations = data.customizations;
  const customizationsList: string[] = Array.isArray(rawCustomizations)
    ? rawCustomizations.map((c) => String(c).trim()).filter(Boolean)
    : typeof rawCustomizations === 'string' && (rawCustomizations as string).trim()
    ? (rawCustomizations as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const customizationsText = customizationsList.length > 0
    ? customizationsList.join(', ')
    : 'Standard options';

  const customizationsBadgesHtml = customizationsList.length > 0
    ? customizationsList
        .map(
          (c) =>
            `<span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2.5px 8px; margin: 2px 4px 2px 0; font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.3;">${escapeHtml(c)}</span>`
        )
        .join('')
    : `<span style="color: #0f172a; font-weight: 700; font-size: 11.5px;">Standard options</span>`;

  // 1. Admin Email
  const adminMail = {
    from: `"FunPrint Wholesale" <${process.env.SMTP_USER}>`,
    to: adminRecipientOverride || ADMIN_NOTIFICATION_EMAILS,
    replyTo: data.email || undefined,
    subject: `New Bulk Order Enquiry - ${escapeHtml(data.name)} (${escapeHtml(data.company || 'Individual')})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Bulk Enquiry - ${data.name}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('New Bulk Order Enquiry', 'Wholesale Lead Alert')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Contact Name:</strong> ${escapeHtml(data.name)}</p>
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Company:</strong> ${escapeHtml(data.company || 'N/A')}</p>
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Mobile:</strong> <a href="tel:${escapeHtml(data.mobile)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.mobile)}</a></p>
                      ${data.email ? `<p style="margin: 0; color: #1e293b; font-size: 12px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a></p>` : ''}
                    </div>

                    <div class="email-inner-card" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="color: #64748b; font-size: 11.5px; padding: 4px 6px 4px 0; width: 42%; vertical-align: top;">Garment / Product Type</td>
                          <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 11.5px; padding: 4px 0 4px 6px; width: 58%; vertical-align: top;">${escapeHtml(data.productType || 'Custom Apparel')}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 11.5px; padding: 4px 6px 4px 0; width: 42%; vertical-align: top; white-space: nowrap;">Estimated Quantity</td>
                          <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 11.5px; padding: 4px 0 4px 6px; width: 58%; vertical-align: top;">${escapeHtml(String(data.quantity || '50+'))} pcs</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 8px; padding-bottom: 2px; border-top: 1px dashed #e2e8f0;">
                            <div style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Customizations:</div>
                            <div style="line-height: 1.4;">
                              ${customizationsBadgesHtml}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    ${data.message ? `
                      <div class="email-inner-card" style="background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 8px; padding: 10px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong style="color: #854d0e; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase;">Requirements:</strong>
                        <div style="color: #713f12; line-height: 1.45; font-size: 12px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
                      </div>
                    ` : ''}
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const promises: Promise<any>[] = [transporter.sendMail(adminMail)];

  // 2. Customer Confirmation Email
  if (data.email) {
    const customerMail = {
      from: `"FunPrint Wholesale" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: `We Received Your Enquiry - FunPrint Wholesale`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getEmailHead('Bulk Enquiry Received')}
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
            <tr>
              <td align="center" class="email-outer-td" style="padding: 0 6px;">
                <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  ${getEmailHeader('Bulk Enquiry Received', 'Wholesale & Custom Apparel')}
                  <tr>
                    <td class="email-card-padding" style="padding: 14px 14px;">
                      <p style="color: #1e293b; font-size: 13.5px; margin-top: 0; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.name)}</strong>,</p>
                      <div class="email-inner-card" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; margin: 10px 0; text-align: center; color: #15803d; font-size: 13px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        We received your enquiry form, we will contact you soon!
                      </div>
                      <p style="color: #475569; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0;">
                        Thank you for your bulk apparel inquiry. Our wholesale manufacturing division in Tiruppur is preparing a customized price quotation and fabric swatch options for you.
                      </p>

                      <div class="email-inner-card" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="color: #64748b; font-size: 11.5px; padding: 4px 6px 4px 0; width: 42%; vertical-align: top;">Product Type</td>
                            <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 11.5px; padding: 4px 0 4px 6px; width: 58%; vertical-align: top;">${escapeHtml(data.productType || 'Custom Apparel')}</td>
                          </tr>
                          <tr>
                            <td style="color: #64748b; font-size: 11.5px; padding: 4px 6px 4px 0; width: 42%; vertical-align: top; white-space: nowrap;">Estimated Quantity</td>
                            <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 11.5px; padding: 4px 0 4px 6px; width: 58%; vertical-align: top;">${escapeHtml(String(data.quantity || '50+'))} pcs</td>
                          </tr>
                          <tr>
                            <td style="color: #64748b; font-size: 11.5px; padding: 4px 6px 4px 0; width: 42%; vertical-align: top;">Organization</td>
                            <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 11.5px; padding: 4px 0 4px 6px; width: 58%; vertical-align: top;">${escapeHtml(data.company || 'Individual')}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 8px; padding-bottom: 2px; border-top: 1px dashed #e2e8f0;">
                              <div style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Customizations:</div>
                              <div style="line-height: 1.4;">
                                ${customizationsBadgesHtml}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      ${data.message ? `
                        <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          <strong style="color: #64748b; font-size: 10px; text-transform: uppercase; display: block; margin-bottom: 2px;">Requirements:</strong>
                          <p style="margin: 0; color: #334155; font-size: 12px; line-height: 1.45; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                        </div>
                      ` : ''}

                      <p style="color: #64748b; font-size: 11px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0 0 0;">
                        A wholesale representative will reach out to you within 24 hours. For urgent bulk orders, call our sales desk at <a href="tel:${escapeHtml(DEFAULT_SUPPORT_PHONE)}" style="color: #0f172a; font-weight: 700;">${escapeHtml(DEFAULT_SUPPORT_PHONE)}</a>.
                      </p>
                    </td>
                  </tr>
                  ${getEmailFooterHtml()}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
    promises.push(transporter.sendMail(customerMail));
  }

  return Promise.allSettled(promises);
}

// 5. RETAIL ORDER ENQUIRIES (Sends to customer and admin - STRICTLY NO PRICES)
export async function sendRetailOrderEmails(data: {
  customerName: string;
  email?: string;
  mobile: string;
  items: any[];
  notes?: string;
  totalQuantity?: number;
}, adminRecipientOverride?: string | string[]) {
  const itemsHtml = Array.isArray(data.items)
    ? data.items
        .map(
          (it: any) => `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif; font-size: 12px; font-weight: 700; color: #111827;">
            ${escapeHtml(it.style || it.garment)}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${escapeHtml(it.color)} / ${escapeHtml(it.sizesSummary || it.size || 'Assorted')}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; color: #111827; font-size: 11.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${Number(it.quantity || 1)}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            ${escapeHtml(it.logoPlacement || 'Custom Print')}
          </td>
        </tr>
      `
        )
        .join('')
    : '';

  const totalCount = data.totalQuantity || (Array.isArray(data.items) ? data.items.reduce((s, it) => s + (it.quantity || 1), 0) : 1);

  // 1. Admin Email
  const adminMail = {
    from: `"FunPrint Retail Orders" <${process.env.SMTP_USER}>`,
    to: adminRecipientOverride || ADMIN_NOTIFICATION_EMAILS,
    replyTo: data.email || undefined,
    subject: `New Custom Retail Order - ${escapeHtml(data.customerName)} (${totalCount} items)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Retail Custom Order - ${data.customerName}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('New Custom Retail Order', 'Retail Customization Request')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Customer:</strong> ${escapeHtml(data.customerName)}</p>
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Mobile:</strong> <a href="tel:${escapeHtml(data.mobile)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.mobile)}</a></p>
                      ${data.email ? `<p style="margin: 0; color: #1e293b; font-size: 12px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a></p>` : ''}
                    </div>

                    <div style="margin: 0 0 6px 0; color: #0f172a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Custom Garment Items (${totalCount} pcs)</div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                      <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                          <th style="padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Style</th>
                          <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Color/Size</th>
                          <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Qty</th>
                          <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Print</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    ${data.notes ? `
                      <div class="email-inner-card" style="background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 8px; padding: 10px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong style="color: #854d0e; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase;">Instructions:</strong>
                        <div style="color: #713f12; line-height: 1.45; font-size: 12px; white-space: pre-wrap;">${escapeHtml(data.notes)}</div>
                      </div>
                    ` : ''}
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const promises: Promise<any>[] = [transporter.sendMail(adminMail)];

  // 2. Customer Confirmation Email (STRICTLY NO PRICES)
  if (data.email) {
    const customerMail = {
      from: `"FunPrint Custom Orders" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: `We Received Your Enquiry - FunPrint Custom Orders`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getEmailHead('Custom Order Received')}
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
            <tr>
              <td align="center" class="email-outer-td" style="padding: 0 6px;">
                <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  ${getEmailHeader('Custom Order Received', 'Custom Apparel with Your Logo')}
                  <tr>
                    <td class="email-card-padding" style="padding: 14px 14px;">
                      <p style="color: #1e293b; font-size: 13.5px; margin-top: 0; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.customerName)}</strong>,</p>
                      <div class="email-inner-card" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; margin: 10px 0; text-align: center; color: #15803d; font-size: 13px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        We received your enquiry form, we will contact you soon!
                      </div>
                      <p style="color: #475569; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0;">
                        Thank you for submitting your custom logo order enquiry. Our production floor in Chennai &amp; Tiruppur is reviewing your selected styles and print placements.
                      </p>

                      <div style="margin: 10px 0 6px 0; color: #0f172a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">Selected Items (${totalCount} Pieces)</div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 10px;">
                        <thead>
                          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <th style="padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Style</th>
                            <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Color/Size</th>
                            <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Qty</th>
                            <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Print</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>

                      ${data.notes ? `
                        <div class="email-inner-card" style="background: #f8fafc; border-left: 3px solid #FFC006; padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          <strong style="color: #0f172a; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 2px;">Instructions:</strong>
                          <p style="margin: 0; color: #475569; font-size: 11.5px;">${escapeHtml(data.notes)}</p>
                        </div>
                      ` : ''}

                      <p style="color: #64748b; font-size: 11px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0 0 0;">
                        Our team will contact you on WhatsApp or call you at <strong>${escapeHtml(data.mobile)}</strong> to collect your logo file before printing.
                      </p>
                    </td>
                  </tr>
                  ${getEmailFooterHtml()}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
    promises.push(transporter.sendMail(customerMail));
  }

  return Promise.allSettled(promises);
}

// 4. CUSTOMER OTP VERIFICATION
export async function sendCustomerOtpEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"FunPrint" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your FunPrint Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead('Verify Your Account')}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('Email Verification Code', 'One-Time Password (OTP)')}
                <tr>
                  <td class="email-card-padding" style="padding: 20px 16px; text-align: center;">
                    <div style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 8px 0;">Verify Your Email Address</div>
                    <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Use the following OTP to complete your account verification. This code is valid for <strong>5 minutes</strong>.
                    </p>
                    
                    <div style="display: inline-block; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #111827; background: #FEF3C7; border: 2px dashed #FFC006; padding: 8px 20px; border-radius: 8px; margin: 16px 0; font-family: monospace;">
                      ${escapeHtml(otp)}
                    </div>

                    <p style="color: #6b7280; font-size: 11px; margin: 10px 0 0 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      If you did not request this verification code, please ignore this email. Never share your OTP with anyone.
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 5. PASSWORD RESET
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const mailOptions = {
    from: `"FunPrint Security" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Password Reset Request - FunPrint`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead('Password Reset Request')}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('Password Reset Request', 'Account Security')}
                <tr>
                  <td class="email-card-padding" style="padding: 20px 16px;">
                    <div style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 8px 0;">Hello ${escapeHtml(name || 'Customer')},</div>
                    <p style="color: #4b5563; font-size: 13px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0 0 14px 0;">
                      We received a request to reset the password for your account. Click below to set a new password (valid for <strong>5 minutes</strong>).
                    </p>
                    <div style="text-align: center; margin: 16px 0;">
                      <a href="${escapeHtml(resetUrl)}" class="mobile-btn" style="display: inline-block; background-color: #FFC006; color: #111827; font-weight: 900; font-size: 13.5px; text-decoration: none; padding: 10px 24px; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">Reset My Password</a>
                    </div>
                    <p style="font-size: 11px; color: #6b7280; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 14px 0 0 0;">
                      If you didn't request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 6. PAYMENT SUBMITTED FOR VERIFICATION
export async function sendPaymentSubmittedEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  amount: number;
  transactionRef: string;
}) {
  const mailOptions = {
    from: `"FunPrint Orders" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Payment Submitted for Verification - Order #${escapeHtml(data.orderId)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Payment Submitted - #${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                ${getEmailHeader('Payment Submitted for Verification', `Order Reference: #${data.orderId}`)}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <p style="color: #334155; font-size: 13.5px; margin-top: 0; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.customerName)}</strong>,</p>
                    <p style="color: #475569; font-size: 12.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0 0 10px 0;">We received your payment transaction reference for order <strong>#${escapeHtml(data.orderId)}</strong>.</p>
                    <div class="email-inner-card" style="background: #fef3c7; border: 1px solid #fde68a; padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 2px 0; color: #1e293b; font-size: 12px;"><strong>Amount Payable:</strong> ₹${Number(data.amount)}</p>
                      <p style="margin: 2px 0; color: #1e293b; font-size: 12px;"><strong>UTR / Ref:</strong> <span style="font-family: monospace; font-weight: 700;">${escapeHtml(data.transactionRef)}</span></p>
                      <p style="margin: 2px 0; color: #92400e; font-size: 12px;"><strong>Status:</strong> <span style="font-weight: 800;">SUBMITTED FOR VERIFICATION</span></p>
                    </div>
                    <p style="color: #64748b; font-size: 11.5px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0 0 0;">
                      Our finance team is verifying this transaction with our merchant bank statement. Once verified, your order status will automatically update to <strong>CONFIRMED</strong> and begin manufacturing in our Tiruppur facility.
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 7. PAYMENT STATUS UPDATE (CONFIRMED OR REJECTED)
export async function sendPaymentStatusUpdateEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  amount: number;
  paymentMethod?: string;
  status: 'CONFIRMED' | 'REJECTED';
  notes?: string;
}) {
  const isConfirmed = data.status === 'CONFIRMED';
  const isCod = (data.paymentMethod || '').toUpperCase().includes('COD');

  const subject = isConfirmed
    ? isCod
      ? `Order Confirmed & Verified (COD) - #${escapeHtml(data.orderId)} | FunPrint`
      : `Payment Confirmed & Order Verified - #${escapeHtml(data.orderId)} | FunPrint`
    : `Order Verification Issue - #${escapeHtml(data.orderId)} | FunPrint`;

  const headerTitle = isConfirmed
    ? isCod ? 'Order Confirmed & Verified!' : 'Payment Confirmed & Verified!'
    : 'Verification Issue';

  const headerSubtitle = isConfirmed
    ? isCod ? 'Cash on Delivery (COD) Order Verified' : `UPI Payment Verified - #${data.orderId}`
    : `Order #${data.orderId}`;

  const mailOptions = {
    from: `"FunPrint Orders" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(isConfirmed ? `Order Confirmed - #${data.orderId}` : `Order Issue - #${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                ${getEmailHeader(
                  headerTitle,
                  headerSubtitle,
                  isConfirmed ? '#10b981' : '#ef4444'
                )}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <p style="color: #334155; font-size: 13.5px; margin-top: 0; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.customerName)}</strong>,</p>
                    <p style="color: #475569; font-size: 12.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0 0 10px 0;">
                      ${isConfirmed 
                        ? isCod
                          ? `Great news! Your Cash on Delivery (COD) order <strong>#${escapeHtml(data.orderId)}</strong> has been verified and confirmed by our team. Your garments have entered production.`
                          : `Your UPI payment of <strong>₹${Number(data.amount)}</strong> for Order <strong>#${escapeHtml(data.orderId)}</strong> has been verified. Your order is confirmed and in production.`
                        : `We encountered an issue verifying the order or payment details for Order <strong>#${escapeHtml(data.orderId)}</strong>.`}
                    </p>

                    ${isConfirmed && isCod ? `
                      <div class="email-inner-card" style="background: #eff6ff; border-left: 3px solid #3b82f6; padding: 10px 12px; margin: 10px 0; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong style="color: #1e40af; font-size: 12px; display: block; margin-bottom: 2px;">Cash on Delivery (COD):</strong>
                        <p style="margin: 0; color: #1d4ed8; font-size: 11.5px; line-height: 1.45;">
                          Total Payable: <strong>₹${Number(data.amount)}</strong><br>
                          Please pay via cash or UPI upon package handover at your doorstep.
                        </p>
                      </div>
                    ` : ''}

                    ${data.notes ? `
                      <div class="email-inner-card" style="background: #f8fafc; border-left: 3px solid #f59e0b; padding: 10px 12px; margin: 10px 0; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <strong style="color: #0f172a; font-size: 11px;">Note from FunPrint Desk:</strong>
                        <p style="margin: 2px 0 0 0; color: #475569; font-size: 11.5px;">${escapeHtml(data.notes)}</p>
                      </div>
                    ` : ''}
                    <p style="color: #0f172a; font-size: 12.5px; font-weight: 600; margin-top: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Thank you for choosing FunPrint!</p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 8. SHIPMENT & TRACKING UPDATE (Sent strictly to customer for tracked milestones)
export async function sendTrackingUpdateEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  courierName?: string;
  trackingId?: string;
  status: string;
  trackingUrl?: string;
}) {
  const normStatus = (data.status || '').toUpperCase();
  let subject = `Shipment Update for Order #${escapeHtml(data.orderId)} (${escapeHtml(data.status)})`;
  let headerTitle = 'Shipment Status Update';
  let headerSubtitle = `Order Reference: #${data.orderId}`;
  let headerColor = '#3b82f6';
  let statusMessage = `Your order <strong>#${escapeHtml(data.orderId)}</strong> status is now: <strong>${escapeHtml(data.status)}</strong>`;

  if (normStatus === 'ORDER_PLACED') {
    subject = `Order #${escapeHtml(data.orderId)} Placed Successfully - FunPrint`;
    headerTitle = 'Order Placed Successfully!';
    headerSubtitle = `Order #${data.orderId} is being prepared`;
    headerColor = '#3b82f6';
    statusMessage = `Thank you for your order! Your order <strong>#${escapeHtml(data.orderId)}</strong> has been placed successfully and has entered our fulfillment queue.`;
  } else if (normStatus === 'ORDER_CONFIRMED' || normStatus === 'CONFIRMED') {
    subject = `Order #${escapeHtml(data.orderId)} Confirmed & Verified - FunPrint`;
    headerTitle = 'Order Confirmed & Verified!';
    headerSubtitle = `Order #${data.orderId} verified by accounts & production`;
    headerColor = '#10b981';
    statusMessage = `Great news! Your order <strong>#${escapeHtml(data.orderId)}</strong> has been confirmed and verified. We are now preparing your garments for custom printing.`;
  } else if (normStatus === 'OUT_FOR_DELIVERY') {
    subject = `Out for Delivery: Order #${escapeHtml(data.orderId)} will arrive soon! - FunPrint`;
    headerTitle = 'Your Order is Out for Delivery!';
    headerSubtitle = `Delivery partner is arriving with your package`;
    headerColor = '#f59e0b';
    statusMessage = `Your package for order <strong>#${escapeHtml(data.orderId)}</strong> is out for delivery today and will be handed over to you shortly.`;
  }

  const mailOptions = {
    from: `"FunPrint Shipping" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Shipment Update - #${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                ${getEmailHeader(headerTitle, headerSubtitle, headerColor)}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <p style="color: #334155; font-size: 13.5px; margin-top: 0; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.customerName)}</strong>,</p>
                    <p style="color: #475569; font-size: 12.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0 0 10px 0;">${statusMessage}</p>
                    <div class="email-inner-card" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 2px 0; color: #1e3a8a; font-size: 12px;"><strong>Shipment Status:</strong> ${escapeHtml(data.status)}</p>
                      ${data.courierName ? `<p style="margin: 2px 0; color: #1e3a8a; font-size: 12px;"><strong>Courier Partner:</strong> ${escapeHtml(data.courierName)}</p>` : ''}
                      ${data.trackingId ? `<p style="margin: 2px 0; color: #1e3a8a; font-size: 12px;"><strong>Tracking ID / AWB:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: bold;">${escapeHtml(data.trackingId)}</span></p>` : ''}
                      ${data.trackingUrl ? `<p style="margin: 8px 0 0 0;"><a href="${escapeHtml(data.trackingUrl)}" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 11.5px;">Track Package Live &rarr;</a></p>` : ''}
                    </div>
                    <p style="color: #64748b; font-size: 11px; margin-top: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      You can check the live tracking status anytime from your customer account or by clicking the tracking link above.
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 9. ORDER DELIVERED CONFIRMATION (Sent to customer when package is delivered successfully)
export async function sendOrderDeliveredEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  courierName?: string;
  trackingId?: string;
  deliveryAddress?: string;
  totalAmount?: number;
}) {
  const mailOptions = {
    from: `"FunPrint Deliveries" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `Order #${escapeHtml(data.orderId)} Delivered Successfully - FunPrint`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Order Delivered - #${data.orderId}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                ${getEmailHeader('Order Delivered Successfully!', `Order Reference: #${data.orderId}`, '#10b981')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <p style="color: #334155; font-size: 13.5px; margin-top: 0; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.customerName)}</strong>,</p>
                    <p style="color: #475569; font-size: 12.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0 0 10px 0;">
                      Great news! Your FunPrint custom apparel order <strong>#${escapeHtml(data.orderId)}</strong> has been delivered successfully.
                    </p>

                    <div class="email-inner-card" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 2px 0; color: #166534; font-size: 12px;"><strong>Delivery Status:</strong> ORDER DELIVERED SUCCESSFULLY</p>
                      ${data.courierName ? `<p style="margin: 2px 0; color: #166534; font-size: 12px;"><strong>Courier Partner:</strong> ${escapeHtml(data.courierName)}</p>` : ''}
                      ${data.trackingId ? `<p style="margin: 2px 0; color: #166534; font-size: 12px;"><strong>Tracking ID / AWB:</strong> <span style="font-family: monospace; font-weight: bold;">${escapeHtml(data.trackingId)}</span></p>` : ''}
                      ${data.deliveryAddress ? `<p style="margin: 6px 0 0 0; color: #374151; font-size: 11.5px; border-top: 1px dashed #86efac; padding-top: 6px;"><strong>Destination:</strong> ${escapeHtml(data.deliveryAddress)}</p>` : ''}
                    </div>

                    <p style="color: #334155; font-size: 12px; line-height: 1.45; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0 0 0;">
                      We hope you enjoy wearing your new custom apparel! For feedback or assistance, email us at <a href="mailto:${escapeHtml(DEFAULT_SUPPORT_EMAIL)}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${escapeHtml(DEFAULT_SUPPORT_EMAIL)}</a> or call <a href="tel:${escapeHtml(DEFAULT_SUPPORT_PHONE)}" style="color: #111827; font-weight: bold;">${escapeHtml(DEFAULT_SUPPORT_PHONE)}</a>.
                    </p>

                    <p style="color: #0f172a; font-size: 12.5px; font-weight: 700; margin-top: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Thank you for choosing FunPrint!
                    </p>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// 10. BRAND BULK ORDER ENQUIRY (Sends to both admin receiver and sender customer)
export interface BrandEnquiryEmailData {
  name: string;
  phone: string;
  email: string;
  brands: string[] | string;
  message?: string;
}

export async function sendBrandEnquiryEmail(
  data: BrandEnquiryEmailData,
  adminRecipientOverride?: string | string[]
) {
  const brandsList = Array.isArray(data.brands)
    ? data.brands
    : (data.brands || '').split(',').map((b) => b.trim()).filter(Boolean);

  const brandsText = brandsList.length > 0 ? brandsList.join(', ') : 'Selected Brands';

  const brandsBadgesHtml = brandsList.length > 0
    ? brandsList
        .map(
          (b) =>
            `<span style="display: inline-block; background-color: #0f172a; color: #ffffff; border-radius: 6px; padding: 4px 10px; margin: 3px 5px 3px 0; font-size: 11.5px; font-weight: 700; letter-spacing: 0.2px;">${escapeHtml(b)}</span>`
        )
        .join('')
    : `<span style="color: #0f172a; font-weight: 700; font-size: 11.5px;">All Brands</span>`;

  // 1. Admin Email
  const adminMail = {
    from: `"FunPrint Brand Collaborations" <${process.env.SMTP_USER}>`,
    to: adminRecipientOverride || ADMIN_NOTIFICATION_EMAILS,
    replyTo: data.email || undefined,
    subject: `New Brand Bulk Order Enquiry - ${escapeHtml(data.name)} (${escapeHtml(brandsText)})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${getEmailHead(`Brand Bulk Enquiry - ${data.name}`)}
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
          <tr>
            <td align="center" class="email-outer-td" style="padding: 0 6px;">
              <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                ${getEmailHeader('New Brand Bulk Order Enquiry', 'Top Brands Collaboration Lead', '#FFC006')}
                <tr>
                  <td class="email-card-padding" style="padding: 14px 14px;">
                    <div class="email-inner-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Contact Person:</strong> ${escapeHtml(data.name)}</p>
                      <p style="margin: 0 0 4px 0; color: #1e293b; font-size: 12px;"><strong>Mobile / WhatsApp:</strong> <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${escapeHtml(data.phone)}</a></p>
                      <p style="margin: 0; color: #1e293b; font-size: 12px;"><strong>Email ID:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a></p>
                    </div>

                    <div class="email-inner-card" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <div style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;">Selected Brands (Bulk Order):</div>
                      <div style="line-height: 1.5;">
                        ${brandsBadgesHtml}
                      </div>
                    </div>

                    ${data.message ? `
                      <div class="email-inner-card" style="background: #fefce8; border-left: 3px solid #ca8a04; border-radius: 8px; padding: 10px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 10px;">
                        <strong style="color: #854d0e; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase;">Customer Concern &amp; Requirements:</strong>
                        <div style="color: #713f12; line-height: 1.45; font-size: 12px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
                      </div>
                    ` : ''}

                    <div style="text-align: center; margin-top: 14px;">
                      <a href="https://wa.me/91${String(data.phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${data.name}, thank you for reaching out to FunPrint regarding your bulk enquiry for ${brandsText}! How can we assist with your order requirements?`)}"
                         style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        Chat on WhatsApp with Customer
                      </a>
                    </div>
                  </td>
                </tr>
                ${getEmailFooterHtml()}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const promises: Promise<any>[] = [transporter.sendMail(adminMail)];

  // 2. Customer Confirmation Email
  if (data.email) {
    const customerMail = {
      from: `"FunPrint Brand Collaborations" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: `We Received Your Brand Bulk Enquiry - FunPrint Collaboration`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getEmailHead('Brand Bulk Enquiry Received')}
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'TeX Gyre Termes', 'Times New Roman', Georgia, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
            <tr>
              <td align="center" class="email-outer-td" style="padding: 0 6px;">
                <table class="email-container" width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  ${getEmailHeader('Brand Bulk Enquiry Received', 'Top Brands & FunPrint Collaborations', '#FFC006')}
                  <tr>
                    <td class="email-card-padding" style="padding: 14px 14px;">
                      <p style="color: #1e293b; font-size: 13.5px; margin-top: 0; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Hello <strong>${escapeHtml(data.name)}</strong>,</p>
                      <div class="email-inner-card" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; margin: 10px 0; text-align: center; color: #15803d; font-size: 13px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        We received your enquiry form, we will contact you soon!
                      </div>
                      <p style="color: #475569; font-size: 12px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 8px 0;">
                        Thank you for showing interest in our brand collaborations. FunPrint partners directly with top brands to offer the best factory bulk prices for your team, company, or institutional apparel needs.
                      </p>

                      <div class="email-inner-card" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <div style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;">Requested Brands:</div>
                        <div style="line-height: 1.5;">
                          ${brandsBadgesHtml}
                        </div>
                      </div>

                      ${data.message ? `
                        <div class="email-inner-card" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 12px; margin: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          <div style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Your Concern / Message:</div>
                          <div style="color: #334155; font-size: 12px; line-height: 1.45; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
                        </div>
                      ` : ''}

                      <p style="color: #475569; font-size: 11.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 12px 0 0 0;">
                        Our wholesale brand coordinator will review stock availability and contact you via phone/WhatsApp at <strong>${escapeHtml(data.phone)}</strong> with bulk pricing quotes and customization options.
                      </p>
                    </td>
                  </tr>
                  ${getEmailFooterHtml()}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    promises.push(transporter.sendMail(customerMail));
  }

  const results = await Promise.allSettled(promises);
  const errors = results.filter((r) => r.status === 'rejected');
  if (errors.length === promises.length) {
    throw new Error('Failed to send all brand enquiry emails');
  }
  return { success: true };
}


