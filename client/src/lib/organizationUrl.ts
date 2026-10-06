const DEFAULT_ORG_BASE_DOMAIN = "kiini.africa";
const RESERVED_ORG_SUBDOMAINS = new Set(["www", "app", "admin"]);

export function getOrgBaseDomain(): string {
  return import.meta.env.VITE_ORG_BASE_DOMAIN || DEFAULT_ORG_BASE_DOMAIN;
}

export function getOrgSubdomainSlug(hostname = typeof window !== "undefined" ? window.location.hostname : ""): string | null {
  const baseDomain = getOrgBaseDomain();
  const suffix = `.${baseDomain}`;
  if (!hostname.endsWith(suffix)) return null;
  const slug = hostname.slice(0, -suffix.length);
  return slug && !slug.includes(".") && !RESERVED_ORG_SUBDOMAINS.has(slug.toLowerCase()) ? slug : null;
}

export function getEffectiveOrgUrlMode(mode?: "path" | "subdomain" | null): "path" | "subdomain" {
  void mode;
  return "subdomain";
}

export function getOrgSubdomainUrl(slug: string, path = "/crm-home", _mode?: "path" | "subdomain"): string {
  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const normalizedSlug = slug.trim().toLowerCase();
  const baseDomain = getOrgBaseDomain();
  const isReservedSlug = RESERVED_ORG_SUBDOMAINS.has(normalizedSlug);
  const tenantOrigin = isReservedSlug
    ? `${protocol}//${baseDomain}`
    : `${protocol}//${normalizedSlug}.${baseDomain}`;
  let normalizedPath = path;

  try {
    const targetUrl = new URL(path, tenantOrigin);
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(path)) {
      const baseDomain = getOrgBaseDomain();
      const isKiiniDomain = targetUrl.hostname === baseDomain || targetUrl.hostname.endsWith(`.${baseDomain}`);
      if (!isKiiniDomain) return path;
    }
    normalizedPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    normalizedPath = path.startsWith("/") ? path : `/${path}`;
  }

  if (!normalizedPath.startsWith("/")) normalizedPath = `/${normalizedPath}`;
  const finalPath = normalizedPath === "/" ? "/crm-home" : normalizedPath;
  const orgPrefix = `/org/${normalizedSlug}`;
  const tenantPath = isReservedSlug
    ? finalPath === orgPrefix || finalPath.startsWith(`${orgPrefix}/`) ? finalPath : `${orgPrefix}${finalPath}`
    : finalPath;
  return `${tenantOrigin}${tenantPath}`;
}

export function getOrganizationUrl(slug: string, path: string, mode?: "path" | "subdomain") {
  if (typeof window !== "undefined" && mode) window.localStorage.setItem("organization-url-mode", mode);
  return getOrgSubdomainUrl(slug, path, mode);
}

export function getOrgSubdomainHost(slug: string): string {
  return `${slug}.${getOrgBaseDomain()}`;
}

export function normalizeBrowserNavigationTarget(
  target: string,
  currentLocation: string = typeof window !== "undefined" ? window.location.href : "https://kiini.africa/",
): string {
  if (!target || target.startsWith("#")) return target;

  try {
    const currentUrl = new URL(currentLocation);
    const targetUrl = new URL(target, currentUrl);

    if (targetUrl.origin !== currentUrl.origin) {
      return target;
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` || "/";
  } catch {
    return target;
  }
}

export function navigateToBrowserTarget(
  target: string,
  navigate: (path: string, ...args: any[]) => void,
  currentLocation: string = typeof window !== "undefined" ? window.location.href : "https://kiini.africa/",
): boolean {
  if (!target) return false;

  try {
    const currentUrl = new URL(currentLocation);
    const targetUrl = new URL(target, currentUrl);

    if (targetUrl.origin !== currentUrl.origin) {
      if (typeof window !== "undefined") {
        window.location.assign(target);
      }
      return true;
    }

    navigate(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` || "/");
    return true;
  } catch {
    navigate(target);
    return true;
  }
}

export function getInternalOrgPath(slug: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/org/${slug}${normalizedPath === "/" ? "/crm-home" : normalizedPath}`;
}

export function stripOrgPathPrefixes(slug: string, path: string): string {
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = `/${slug}`;
  while (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
    normalizedPath = normalizedPath.slice(prefix.length) || "/";
  }
  return normalizedPath === "/" ? "/crm-home" : normalizedPath;
}
