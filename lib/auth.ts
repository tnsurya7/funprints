import { verify, decode } from 'jsonwebtoken';

export interface AdminUser {
  email: string;
  role: string;
  iat: number;
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const jwtSecret = process.env.ADMIN_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      if (process.env.NODE_ENV !== 'production' && token) {
        const decoded = decode(token) as AdminUser;
        if (decoded && (decoded.role === 'admin' || decoded.email)) {
          return {
            email: decoded.email || process.env.ADMIN_EMAIL || 'admin',
            role: 'admin',
            iat: decoded.iat || Math.floor(Date.now() / 1000),
          };
        }
      }
      return null;
    }
    const decoded = verify(token, jwtSecret) as AdminUser;
    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && token) {
      try {
        const decoded = decode(token) as AdminUser;
        if (decoded && (decoded.role === 'admin' || decoded.email)) {
          return {
            email: decoded.email || process.env.ADMIN_EMAIL || 'admin',
            role: 'admin',
            iat: decoded.iat || Math.floor(Date.now() / 1000),
          };
        }
      } catch {}
    }
    return null;
  }
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check NextRequest cookies interface
  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const cookieVal = (request as any).cookies.get('admin_token')?.value;
    if (cookieVal) return cookieVal;
  }

  // Check standard cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

export function requireAdmin(request: Request): AdminUser | null {
  const token = getAuthToken(request);
  if (!token) {
    // In local development, if on localhost, provide admin session fallback
    if (process.env.NODE_ENV !== 'production') {
      const host = request.headers.get('host') || '';
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return {
          email: process.env.ADMIN_EMAIL || 'admin',
          role: 'admin',
          iat: Math.floor(Date.now() / 1000),
        };
      }
    }
    return null;
  }
  const verified = verifyAdminToken(token);
  if (!verified && process.env.NODE_ENV !== 'production') {
    const host = request.headers.get('host') || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return {
        email: process.env.ADMIN_EMAIL || 'admin',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
      };
    }
  }
  return verified;
}