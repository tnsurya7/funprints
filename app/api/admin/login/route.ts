import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const envEmail = process.env.ADMIN_EMAIL || '';
    const envPassword = process.env.ADMIN_PASSWORD || '';
    const jwtSecret = process.env.ADMIN_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Server authentication configuration missing' }, { status: 500 });
    }

    const inputEmail = (email || '').trim().toLowerCase();
    const targetEmail = envEmail.trim().toLowerCase();

    let authenticated = false;

    // Check environment credentials
    if (inputEmail === targetEmail && password === envPassword) {
      authenticated = true;
    } else {
      // Check Neon DB admin_users
      try {
        const rows = await sql`
          SELECT id, email, password_hash, role FROM admin_users
          WHERE LOWER(email) = ${inputEmail}
          LIMIT 1;
        `;
        if (rows.length > 0) {
          const match = await bcrypt.compare(password, rows[0].password_hash);
          if (match) authenticated = true;
        }
      } catch (dbErr) {
        console.warn('Admin DB lookup warning:', dbErr);
      }
    }

    if (!authenticated) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = sign(
      { 
        email: inputEmail,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      token,
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}