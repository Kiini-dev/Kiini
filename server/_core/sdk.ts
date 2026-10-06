import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { jwtVerify } from "jose";
// Schema doesn't export a `User` type; use a compat alias while we iterate fixes.
type User = any;
import * as db from "../db";
import { getUserOrganizationId } from "../db-users";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;
const RESERVED_ORG_SUBDOMAINS = new Set(["www", "app", "admin"]);

export async function resolveUserOrganizationContext(
  user: User,
  resolveMembership: (userId: string, email?: string | null) => Promise<string | null> = getUserOrganizationId,
): Promise<User> {
  if (user.organizationId) return user;
  const organizationId = await resolveMembership(user.id, user.email ?? null);
  return organizationId ? { ...user, organizationId } : user;
}

function getOrganizationSlugFromRequest(req: Request): string | null {
  const hostname = String(req.hostname || "").toLowerCase();
  const baseDomain = String(process.env.ORG_BASE_DOMAIN || "kiini.africa").toLowerCase();
  const subdomainSuffix = `.${baseDomain}`;
  if (hostname.endsWith(subdomainSuffix)) {
    const slug = hostname.slice(0, -subdomainSuffix.length);
    if (slug && !slug.includes(".") && !RESERVED_ORG_SUBDOMAINS.has(slug)) return slug;
  }

  const referer = req.get("referer");
  const requestHost = req.get("host")?.toLowerCase();
  if (!referer || !requestHost) return null;
  try {
    const refererUrl = new URL(referer);
    if (refererUrl.host.toLowerCase() !== requestHost) return null;
    return refererUrl.pathname.match(/^\/org\/([a-z0-9-]+)(?:\/|$)/i)?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function resolveRequestOrganizationContext(
  user: User,
  req: Request,
  findOrganization: (slug: string) => Promise<any> = db.getOrganizationBySlug,
): Promise<User> {
  if (user.organizationId || user.role !== "super_admin") return user;
  const slug = getOrganizationSlugFromRequest(req);
  if (!slug) return user;

  try {
    const organization = await findOrganization(slug);
    if (!organization || !organization.id || Number(organization.isActive) === 0 || Number(organization.isArchived) === 1) {
      return user;
    }
    return { ...user, organizationId: organization.id, organizationSlug: organization.slug };
  } catch (error) {
    console.warn("[Auth] Failed to resolve platform admin tenant context:", error);
    return user;
  }
}

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class SDKServer {
  private readonly localUserCache = new Map<string, { user: User; expiresAt: number }>();

  constructor() {}

  invalidateLocalUserCache(userId: string) {
    this.localUserCache.delete(userId);
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  /**
   * Authenticate request by checking session cookie
   * Returns the user if authenticated, null if not
   * Does not throw errors - authentication is optional for public procedures
   */
  async authenticateRequest(req: Request): Promise<User | null> {
    // First try Authorization header (Docker/HTTP localStorage fallback)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    let procedure = req.path || req.url?.split('?')[0] || 'unknown';
    const queryString = req.url?.split('?')[1] || '';
    const params = new URLSearchParams(queryString);
    
    // For batch calls, try to extract individual procedure names
    const batch = params.get('batch');
    if (batch) {
      try {
        const procedureNames = JSON.parse(batch).map((b: any) => b[0]).join(', ');
        procedure = `BATCH[${procedureNames}]`;
      } catch {
        procedure = 'BATCH_CALL';
      }
    }
    
    console.log(`[authenticateRequest] Procedure: ${procedure}, Authorization:`, authHeader ? 'YES' : 'NO');
    
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.slice(7);
      try {
        const localUser = await this.verifyLocalJWT(headerToken);
        if (localUser) {
          console.log('[authenticateRequest] JWT verified from Authorization header, user:', localUser.email);
          return await resolveRequestOrganizationContext(localUser, req);
        }
      } catch (err) {
        console.log('[authenticateRequest] JWT verification failed from header:', err);
        // fall through to cookie-based auth
      }
    }

    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);

    if (!sessionCookie) {
      // No session cookie is fine - just return null for public procedures
      return null;
    }

    try {
      const localUser = await this.verifyLocalJWT(sessionCookie);
      return localUser ? await resolveRequestOrganizationContext(localUser, req) : null;
    } catch (error) {
      // Log error but don't throw - allow public procedures to work
      console.error("[Auth] Error authenticating request:", error);
      return null;
    }
  }

  /**
   * Verify local JWT token (for email/password authentication)
   */
  private async verifyLocalJWT(token: string): Promise<User | null> {
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      
      const userId = payload.userId as string;
      if (!userId) {
        return null;
      }

      const cached = this.localUserCache.get(userId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.user;
      }

      const user = await db.getUser(userId);
      if (!user) {
        return null;
      }

      const resolvedUser = await resolveUserOrganizationContext(user);
      this.localUserCache.set(userId, { user: resolvedUser, expiresAt: Date.now() + 60_000 });

      return resolvedUser;
    } catch (error) {
      // Not a local JWT token, return null to try OAuth
      return null;
    }
  }
}

export const sdk = new SDKServer();
