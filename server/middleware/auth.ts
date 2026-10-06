import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { COOKIE_NAME } from '@shared/const';
import { getUserById } from '../db-users';

if (!process.env.JWT_SECRET) {
  const msg = '[SECURITY] JWT_SECRET environment variable is not set. Using an insecure fallback. Set JWT_SECRET before deploying to production!';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-insecure-fallback');

/**
 * Express middleware to validate JWT authentication.
 * Reads the session cookie (or Authorization Bearer header as fallback),
 * verifies the JWT, loads the user from the database, and attaches it
 * to `req.user`. Returns 401 if the token is missing or invalid.
 */
export async function validateAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Try session cookie first, then fall back to Authorization header
    const cookieToken: string | undefined = req.cookies?.[COOKIE_NAME];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    const token = cookieToken ?? bearerToken;

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify the JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = (payload as { userId?: string }).userId;

    if (!userId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    // Load the user record so downstream handlers have full context
    const user = await getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request for downstream handlers
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
