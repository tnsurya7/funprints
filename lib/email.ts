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
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
          }
          .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .order-id {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .order-id strong {
            font-size: 24px;
            color: #7c3aed;
            font-weight: 700;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #7c3aed;
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
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
          }
          .total-final {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #7c3aed;
            margin-top: 10px;
            font-size: 20px;
            font-weight: 700;
            color: #7c3aed;
          }
          .address-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #7c3aed;
          }
          .info-badge {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 10px;
          }
          .footer { 
            background: #f9fafb;
            text-align: center; 
            padding: 30px; 
            color: #6b7280; 
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo {
            font-size: 20px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            color: #7c3aed;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for shopping with Fun Prints</p>
          </div>
          
          <div class="content">
            <div class="order-id">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Order ID</div>
              <strong>${data.orderId}</strong>
            </div>

            <div class="section">
              <div style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">
                Hi <strong>${data.customerName}</strong>, your order has been confirmed and will be processed shortly! 🚀
              </div>
            </div>

            <div class="section">
              <div class="section-title">📦 Order Items</div>
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
                <div class="total-row">
                  <span style="color: #6b7280;">Subtotal</span>
                  <span style="font-weight: 600;">₹${data.totalAmount}</span>
                </div>
                <div class="total-row">
                  <span style="color: #6b7280;">Shipping</span>
                  <span style="font-weight: 600; color: #10b981;">FREE</span>
                </div>
                <div class="total-row">
                  <span style="color: #6b7280;">GST (18%)</span>
                  <span style="font-weight: 600;">₹${Math.round(data.totalAmount * 0.18)}</span>
                </div>
                <div class="total-final">
                  <span>Total Amount</span>
                  <span>₹${data.totalAmount + Math.round(data.totalAmount * 0.18)}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">🚚 Delivery Address</div>
              <div class="address-box">
                <div style="font-weight: 600; margin-bottom: 8px;">${data.customerName}</div>
                <div style="color: #6b7280; line-height: 1.8;">
                  ${data.customerAddress}<br>
                  📱 ${data.customerMobile}<br>
                  📧 ${data.customerEmail}
                </div>
              </div>
              <div class="info-badge">💳 ${data.paymentMethod}</div>
            </div>

            <div class="section">
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
                <div style="font-weight: 600; color: #065f46; margin-bottom: 8px;">✅ What's Next?</div>
                <div style="color: #047857; font-size: 14px; line-height: 1.8;">
                  • We'll send you tracking details once your order is dispatched<br>
                  • Expected delivery: 5-7 business days<br>
                  • For any queries, contact us at <a href="tel:+919876543210" style="color: #7c3aed; text-decoration: none; font-weight: 600;">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">Fun Prints</div>
            <p style="margin: 10px 0;">Premium Custom T-Shirts with Quality Assurance</p>
            <div class="social-links">
              <a href="tel:+919876543210">📞 Call Us</a>
              <a href="https://wa.me/919344925600">💬 WhatsApp</a>
              <a href="mailto:${process.env.SMTP_USER}">📧 Email</a>
            </div>
            <p style="margin-top: 20px; color: #9ca3af;">© 2026 Fun Prints. All rights reserved.</p>
          </div>
        </div>
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
