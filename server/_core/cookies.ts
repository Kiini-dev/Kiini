import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const ORG_BASE_DOMAIN = "kiini.africa";

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Get session cookie options with proper Docker/development support
 * 
 * In Docker HTTP environments:
 * - sameSite: "lax" (allows same-site cookies without secure flag)
 * - secure: false (HTTP connections)
 * 
 * In production HTTPS:
 * - sameSite: "none" (allows cross-site cookies)
 * - secure: true (HTTPS connections)
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);
  const hostname = req.hostname;
  const isLocalHost = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const sharedOrgDomain = hostname === ORG_BASE_DOMAIN || hostname.endsWith(`.${ORG_BASE_DOMAIN}`)
    ? `.${ORG_BASE_DOMAIN}`
    : undefined;

  // Determine sameSite and secure flags based on environment
  let sameSite: "lax" | "strict" | "none" = "lax";
  let secure = false;

  if (isSecure) {
    // Production HTTPS environment
    if (isLocalHost) {
      // Local HTTPS (e.g., localhost:443)
      sameSite = "lax";
      secure = true;
    } else {
      // Production HTTPS (cross-domain)
      sameSite = "none";
      secure = true;
    }
  } else {
    // Development HTTP environment (Docker, localhost)
    sameSite = "lax";
    secure = false;
  }

  return {
    domain: sharedOrgDomain,
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
