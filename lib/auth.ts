import { verify } from 'jsonwebtoken';

export interface AdminUser {
  email: string;
  role: string;
  iat: number;
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const jwtSecret = process.env.ADMIN_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = verify(token, jwtSecret) as AdminUser;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAdmin(request: Request): AdminUser | null {
  const token = getAuthHeader(request);
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}