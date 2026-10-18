import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { sendCustomerOtpEmail, sendPasswordResetEmail } from '@/lib/email';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export async function sendRegistrationOTP(email: string, phone: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/\s+/g, '');

  // Check if email or phone already registered
  const existing = await sql`
    SELECT id, email, phone FROM customers 
    WHERE email = ${normalizedEmail} OR phone = ${normalizedPhone}
    LIMIT 1;
  `;

  if (existing.length > 0) {
    if (existing[0].email === normalizedEmail) {
      return { success: false, message: 'This email is already registered. Please login instead.' };
    }
    return { success: false, message: 'This phone number is already registered. Please login instead.' };
  }

  // Rate limit: Check if OTP sent in last 1 minute
  const recentOtp = await sql`
    SELECT id, created_at FROM email_verification_otps
    WHERE email = ${normalizedEmail} AND created_at > NOW() - INTERVAL '1 minute'
    LIMIT 1;
  `;

  if (recentOtp.length > 0) {
    return { success: false, message: 'Please wait 1 minute before requesting another OTP.' };
  }

  const rawOtp = generateOTP();
  const otpHashed = hashString(rawOtp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  await sql`
    INSERT INTO email_verification_otps (email, phone, otp_hash, expires_at)
    VALUES (${normalizedEmail}, ${normalizedPhone}, ${otpHashed}, ${expiresAt.toISOString()});
  `;

  // Send OTP via email
  try {
    await sendCustomerOtpEmail(normalizedEmail, rawOtp);
  } catch (err: any) {
    console.error('Failed to send OTP email:', err);
    // In dev, let user know email failed if SMTP is not configured
    return { success: false, message: 'Unable to deliver OTP email. Please verify SMTP settings.' };
  }

  return { success: true, message: 'OTP sent to your email! Valid for 5 minutes.' };
}

export async function verifyRegistrationOTP(email: string, otp: string): Promise<{ verified: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const otpHashed = hashString(otp.trim());

  const records = await sql`
    SELECT id, attempts, expires_at, verified_at FROM email_verification_otps
    WHERE email = ${normalizedEmail} AND verified_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (records.length === 0) {
    return { verified: false, message: 'No pending OTP verification found. Please request a new OTP.' };
  }

  const record = records[0];

  if (new Date(record.expires_at) < new Date()) {
    return { verified: false, message: 'OTP has expired (validity is 5 minutes). Please request a new one.' };
  }

  if (record.attempts >= 5) {
    return { verified: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  const match = await sql`
    SELECT id FROM email_verification_otps
    WHERE id = ${record.id} AND otp_hash = ${otpHashed}
    LIMIT 1;
  `;

  if (match.length === 0) {
    await sql`
      UPDATE email_verification_otps SET attempts = attempts + 1 WHERE id = ${record.id};
    `;
    return { verified: false, message: 'Invalid OTP code. Please check and try again.' };
  }

  // Mark verified
  await sql`
    UPDATE email_verification_otps SET verified_at = NOW() WHERE id = ${record.id};
  `;

  return { verified: true, message: 'Email verified successfully.' };
}

export async function registerCustomer(params: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  otp: string;
}): Promise<{ success: boolean; message: string; sessionToken?: string; customer?: Customer }> {
  const { fullName, phone, email, password, otp } = params;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim().replace(/\s+/g, '');

  if (!fullName || !normalizedPhone || !normalizedEmail || !password) {
    return { success: false, message: 'All fields (Full Name, Phone, Email, Password) are mandatory.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  // Verify OTP was validly completed
  const otpHashed = hashString(otp.trim());
  const verifiedRecord = await sql`
    SELECT id FROM email_verification_otps
    WHERE email = ${normalizedEmail} AND otp_hash = ${otpHashed} AND verified_at IS NOT NULL
      AND verified_at > NOW() - INTERVAL '15 minutes'
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (verifiedRecord.length === 0) {
    return { success: false, message: 'Please verify the OTP code first.' };
  }

  // Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const customerInsert = await sql`
      INSERT INTO customers (full_name, phone, email)
      VALUES (${fullName.trim()}, ${normalizedPhone}, ${normalizedEmail})
      RETURNING id, full_name, phone, email, is_active, created_at;
    `;

    const newCustomer = customerInsert[0];

    await sql`
      INSERT INTO customer_credentials (customer_id, password_hash)
      VALUES (${newCustomer.id}, ${passwordHash});
    `;

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO customer_sessions (customer_id, session_token, expires_at)
      VALUES (${newCustomer.id}, ${sessionToken}, ${expiresAt.toISOString()});
    `;

    return {
      success: true,
      message: 'Account created successfully!',
      sessionToken,
      customer: {
        id: newCustomer.id,
        fullName: newCustomer.full_name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        isActive: newCustomer.is_active,
        createdAt: newCustomer.created_at,
      },
    };
  } catch (err: any) {
    if (err.message?.includes('unique') || err.code === '23505') {
      return { success: false, message: 'An account with this email or phone number already exists.' };
    }
    console.error('Registration error:', err);
    return { success: false, message: 'An error occurred during account creation. Please try again.' };
  }
}

export async function loginCustomer(params: {
  identifier: string; // Email or Phone
  password: string;
}): Promise<{ success: boolean; message: string; sessionToken?: string; customer?: Customer }> {
  const { identifier, password } = params;
  const cleanId = identifier.trim().toLowerCase();

  const customerRows = await sql`
    SELECT c.id, c.full_name, c.phone, c.email, c.is_active, c.created_at, cc.password_hash
    FROM customers c
    JOIN customer_credentials cc ON cc.customer_id = c.id
    WHERE (LOWER(c.email) = ${cleanId} OR c.phone = ${identifier.trim()})
    LIMIT 1;
  `;

  if (customerRows.length === 0) {
    return { success: false, message: 'Invalid email/phone or password.' };
  }

  const customer = customerRows[0];

  if (!customer.is_active) {
    return { success: false, message: 'Your account is deactivated. Please contact support.' };
  }

  const passwordValid = await bcrypt.compare(password, customer.password_hash);
  if (!passwordValid) {
    return { success: false, message: 'Invalid email/phone or password.' };
  }

  // Create session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await sql`
    INSERT INTO customer_sessions (customer_id, session_token, expires_at)
    VALUES (${customer.id}, ${sessionToken}, ${expiresAt.toISOString()});
  `;

  return {
    success: true,
    message: 'Login successful!',
    sessionToken,
    customer: {
      id: customer.id,
      fullName: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      isActive: customer.is_active,
      createdAt: customer.created_at,
    },
  };
}

export async function getCustomerFromSession(token: string): Promise<Customer | null> {
  if (!token) return null;

  const rows = await sql`
    SELECT c.id, c.full_name, c.phone, c.email, c.is_active, c.created_at
    FROM customer_sessions s
    JOIN customers c ON c.id = s.customer_id
    WHERE s.session_token = ${token} AND s.expires_at > NOW() AND c.is_active = TRUE
    LIMIT 1;
  `;

  if (rows.length === 0) return null;

  // Update last_active_at asynchronously
  sql`UPDATE customer_sessions SET last_active_at = NOW() WHERE session_token = ${token}`.catch(() => {});

  const row = rows[0];
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function logoutCustomer(token: string): Promise<void> {
  if (!token) return;
  await sql`DELETE FROM customer_sessions WHERE session_token = ${token}`;
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  const customerRows = await sql`
    SELECT id, full_name, email FROM customers WHERE email = ${cleanEmail} LIMIT 1;
  `;

  // Always return generic response to prevent account enumeration
  if (customerRows.length === 0) {
    return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
  }

  const customer = customerRows[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashString(resetToken);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await sql`
    INSERT INTO password_reset_tokens (customer_id, token_hash, expires_at)
    VALUES (${customer.id}, ${tokenHash}, ${expiresAt.toISOString()});
  `;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail(customer.email, customer.full_name, resetUrl);
  } catch (err) {
    console.error('Password reset email error:', err);
  }

  return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const tokenHash = hashString(token.trim());

  const tokenRows = await sql`
    SELECT id, customer_id, expires_at, used_at FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (tokenRows.length === 0) {
    return { success: false, message: 'Invalid or expired password reset link.' };
  }

  const t = tokenRows[0];
  if (t.used_at) {
    return { success: false, message: 'This reset link has already been used.' };
  }

  if (new Date(t.expires_at) < new Date()) {
    return { success: false, message: 'This reset link has expired. Please request a new one.' };
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE customer_credentials SET password_hash = ${newHash}, updated_at = NOW()
    WHERE customer_id = ${t.customer_id};
  `;

  await sql`
    UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${t.id};
  `;

  // Revoke all existing sessions for security
  await sql`
    DELETE FROM customer_sessions WHERE customer_id = ${t.customer_id};
  `;

  return { success: true, message: 'Password updated successfully! You can now log in.' };
}
