import nodemailer from 'nodemailer';

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

// Helper to convert relative URLs to absolute URLs for email
function getAbsoluteImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${imagePath}`;
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${item.image ? `<img src="${getAbsoluteImageUrl(item.image)}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />` : ''}
          <div>
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${item.color} • ${item.size}</div>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #7c3aed;">₹${item.price * item.quantity}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: `"Fun Prints" <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `✨ Order Confirmed - ${data.orderId} | Fun Prints`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color:#7c3aed;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🎉 Order Confirmed!</h1>
                    <p style="margin:10px 0 0 0;color:#ffffff;font-size:14px;">Thank you for shopping with Fun Prints</p>
                  </td>
                </tr>
                
                <!-- Order ID -->
                <tr>
                  <td style="padding:30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:15px;">
                      <tr>
                        <td style="text-align:center;">
                          <p style="margin:0;color:#6b7280;font-size:12px;">Order ID</p>
                          <p style="margin:5px 0 0 0;color:#7c3aed;font-size:20px;font-weight:bold;">${data.orderId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding:0 30px 20px 30px;">
                    <p style="margin:0;color:#111111;font-size:14px;">Hi <strong>${data.customerName}</strong>, your order has been confirmed and will be processed shortly! 🚀</p>
                  </td>
                </tr>

                <!-- Order Items -->
                <tr>
                  <td style="padding:0 30px 20px 30px;">
                    <h2 style="margin:0 0 15px 0;color:#111111;font-size:16px;font-weight:bold;">📦 Order Items</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                      <thead>
                        <tr style="background-color:#f9fafb;">
                          <th style="padding:12px;text-align:left;color:#6b7280;font-size:12px;font-weight:600;">Product</th>
                          <th style="padding:12px;text-align:center;color:#6b7280;font-size:12px;font-weight:600;">Qty</th>
                          <th style="padding:12px;text-align:right;color:#6b7280;font-size:12px;font-weight:600;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <td style="padding:0 30px 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf5ff;border-radius:8px;padding:15px;">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Subtotal</td>
                        <td style="text-align:right;color:#111111;font-size:14px;font-weight:600;">₹${data.totalAmount}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">Shipping</td>
                        <td style="text-align:right;color:#10b981;font-size:14px;font-weight:600;padding-top:8px;">FREE</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding-top:8px;">GST (18%)</td>
                        <td style="text-align:right;color:#111111;font-size:14px;font-weight:600;padding-top:8px;">₹${Math.round(data.totalAmount * 0.18)}</td>
                      </tr>
                      <tr style="border-top:2px solid #7c3aed;">
                        <td style="color:#111111;font-size:18px;font-weight:bold;padding-top:12px;">Total Amount</td>
                        <td style="text-align:right;color:#7c3aed;font-size:18px;font-weight:bold;padding-top:12px;">₹${data.totalAmount + Math.round(data.totalAmount * 0.18)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td style="padding:0 30px 20px 30px;">
                    <h2 style="margin:0 0 15px 0;color:#111111;font-size:16px;font-weight:bold;">🚚 Delivery Address</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:15px;border-left:4px solid #7c3aed;">
                      <tr>
                        <td>
                          <p style="margin:0 0 8px 0;color:#111111;font-size:14px;font-weight:600;">${data.customerName}</p>
                          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                            ${data.customerAddress}<br>
                            📱 ${data.customerMobile}<br>
                            📧 ${data.customerEmail}
                          </p>
                          <p style="margin:10px 0 0 0;"><span style="background-color:#7c3aed;color:#ffffff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;">💳 ${data.paymentMethod}</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Next Steps -->
                <tr>
                  <td style="padding:0 30px 30px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5;border-radius:8px;padding:15px;border-left:4px solid #10b981;">
                      <tr>
                        <td>
                          <p style="margin:0 0 8px 0;color:#065f46;font-size:14px;font-weight:600;">✅ What's Next?</p>
                          <p style="margin:0;color:#047857;font-size:13px;line-height:1.8;">
                            • We'll send you tracking details once your order is dispatched<br>
                            • Expected delivery: 5-7 business days<br>
                            • For any queries, contact us at <a href="tel:+919876543210" style="color:#7c3aed;text-decoration:none;font-weight:600;">+91 98765 43210</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="margin:0 0 10px 0;color:#7c3aed;font-size:18px;font-weight:bold;">Fun Prints</p>
                    <p style="margin:0 0 15px 0;color:#6b7280;font-size:12px;">Premium Custom T-Shirts with Quality Assurance</p>
                    <p style="margin:0;color:#6b7280;font-size:12px;">
                      <a href="tel:+91XXXXXXXXXX" style="color:#7c3aed;text-decoration:none;margin:0 8px;">📞 Call Us</a>
                      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}" style="color:#7c3aed;text-decoration:none;margin:0 8px;">💬 WhatsApp</a>
                      <a href="mailto:${process.env.SMTP_USER}" style="color:#7c3aed;text-decoration:none;margin:0 8px;">📧 Email</a>
                    </p>
                    <p style="margin:15px 0 0 0;color:#9ca3af;font-size:11px;">© 2026 Fun Prints. All rights reserved.</p>
                  </td>
                </tr>
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

export async function sendOrderNotificationToAdmin(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${item.image ? `<img src="${getAbsoluteImageUrl(item.image)}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />` : ''}
          <div>
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 13px; color: #6b7280;">${item.color} • ${item.size}</div>
          </div>
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #dc2626;">₹${item.price * item.quantity}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: `"Fun Prints System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `🎉 New Order - ${data.orderId} | ₹${data.totalAmount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .header { 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
          }
          .content { 
            padding: 40px 30px;
          }
          .alert-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #f59e0b;
            margin-bottom: 30px;
          }
          .customer-info {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #dc2626;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 12px 15px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .total-section {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
          }
          .total-final {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #dc2626;
            margin-top: 10px;
            font-size: 20px;
            font-weight: 700;
            color: #dc2626;
          }
          .action-required {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #10b981;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Alert!</h1>
            <p>Order ID: ${data.orderId}</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <div style="font-weight: 700; font-size: 18px; color: #92400e; margin-bottom: 8px;">⚡ Action Required</div>
              <div style="color: #78350f; font-size: 14px;">
                ${data.paymentMethod === 'UPI' ? '📱 Check WhatsApp for payment screenshot' : '📦 Prepare order for dispatch'}
              </div>
            </div>

            <div class="customer-info">
              <div style="font-weight: 700; font-size: 16px; color: #1e40af; margin-bottom: 15px;">👤 Customer Information</div>
              <div style="color: #1e3a8a; line-height: 1.8;">
                <strong>Name:</strong> ${data.customerName}<br>
                <strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #3b82f6; text-decoration: none;">${data.customerEmail}</a><br>
                <strong>Mobile:</strong> <a href="tel:${data.customerMobile}" style="color: #3b82f6; text-decoration: none;">${data.customerMobile}</a><br>
                <strong>Address:</strong> ${data.customerAddress}
              </div>
            </div>

            <div class="section-title">📦 Order Details</div>
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <strong style="color: #991b1b;">Payment Method:</strong> 
              <span style="color: #7f1d1d;">${data.paymentMethod}</span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-final">
                <span>Total Amount</span>
                <span>₹${data.totalAmount}</span>
              </div>
            </div>

            <div class="action-required">
              <div style="font-weight: 700; color: #065f46; margin-bottom: 8px;">✅ Next Steps</div>
              <div style="color: #047857; font-size: 14px; line-height: 1.8;">
                1. Verify payment (if UPI)<br>
                2. Prepare items for printing<br>
                3. Update order status<br>
                4. Send tracking details to customer
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  mobile: string;
  message: string;
}) {
  const mailOptions = {
    from: `"Fun Prints Contact Form" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    replyTo: data.email,
    subject: `📧 New Contact Form - ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .content { 
            padding: 40px 30px;
          }
          .info-box { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 12px; 
            border-left: 4px solid #7c3aed;
            margin: 20px 0;
          }
          .message-box {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            border: 2px solid #e9d5ff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #7c3aed; text-decoration: none;">${data.email}</a></p>
              <p><strong>Mobile:</strong> <a href="tel:${data.mobile}" style="color: #7c3aed; text-decoration: none;">${data.mobile}</a></p>
            </div>
            <div class="message-box">
              <strong style="color: #6b21a8; display: block; margin-bottom: 10px;">Message:</strong>
              <div style="color: #4c1d95; line-height: 1.8;">${data.message}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}
