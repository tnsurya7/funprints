import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.ADMIN_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return NextResponse.json(
        { error: 'Admin configuration not found' },
        { status: 500 }
      );
    }

    // Validate credentials
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        email: adminEmail,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}