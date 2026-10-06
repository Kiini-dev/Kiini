/**
 * Shared utility to fetch company info from settings DB.
 * Used by all PDF generators, email templates, and report exporters
 * so that no file needs to hardcode company details.
 */
import { getDb } from '../db';
import { settings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tagline: string;
  kraPin: string;
  logo: string;
  currency: string;
}

/** Fetch company info from the `company` settings category. */
export async function getCompanyInfo(): Promise<CompanyInfo> {
  const defaults: CompanyInfo = {
    name: process.env.COMPANY_NAME || 'Your Company',
    email: process.env.COMPANY_EMAIL || '',
    phone: '',
    address: '',
    website: '',
    tagline: '',
    kraPin: '',
    logo: '',
    currency: 'KES',
  };

  try {
    const db = await getDb();
    if (!db) return defaults;

    const rows = await db.select().from(settings).where(eq(settings.category, 'company'));
    let logoRows = await db.select().from(settings).where(eq(settings.category, 'app_logo'));
    if (logoRows.length === 0) {
      logoRows = await db.select().from(settings).where(eq(settings.category, 'company_logos'));
    }
    const map: Record<string, string> = {};
    rows.forEach(r => { if (r.key) map[r.key] = r.value ?? ''; });
    logoRows.forEach(r => { if (r.key) map[r.key] = r.value ?? ''; });
    const logo = map.largeLogo || map.smallLogo || map.logoUrl || map.logo || map.imageUrl || map.companyLogo || map.company_logo || map.logo_url || '';

    return {
      name: map.companyName || map.name || defaults.name,
      email: map.email || map.companyEmail || defaults.email,
      phone: map.phone || defaults.phone,
      address: map.address || defaults.address,
      website: map.website || defaults.website,
      tagline: map.tagline || defaults.tagline,
      kraPin: map.kraPin || map.taxId || defaults.kraPin,
      logo,
      currency: map.currency || map.defaultCurrency || defaults.currency,
    };
  } catch {
    return defaults;
  }
}

export function addCompanyLogo(doc: any, logo: string, x = 160, y = 10, width = 30, height = 15): void {
  if (!logo || !/^data:image\/(png|jpe?g);base64,/i.test(logo)) return;
  try {
    const format = /^data:image\/jpe?g/i.test(logo) ? 'JPEG' : 'PNG';
    doc.addImage(logo, format, x, y, width, height, undefined, 'FAST');
  } catch (error) {
    console.warn('[PDF] Could not embed company logo:', error instanceof Error ? error.message : error);
  }
}

export function addCompanyLetterhead(
  doc: any,
  companyInfo: CompanyInfo,
  title?: string,
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 20;
  const right = pageWidth - 20;
  const logoWidth = 34;
  const logoHeight = 27;

  addCompanyLogo(doc, companyInfo.logo, right - logoWidth, 9, logoWidth, logoHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(38, 50, 56);
  doc.text(companyInfo.name || 'Your Company', left, 18);

  const contactLines = [
    companyInfo.phone,
    companyInfo.email,
    companyInfo.website,
    companyInfo.address,
  ].filter(Boolean);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 92, 102);
  if (contactLines.length) doc.text(contactLines, left, 25, { lineHeightFactor: 1.35 });

  if (title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(38, 50, 56);
    doc.text(title, left, 25 + contactLines.length * 4.5 + 3);
  }

  const lineY = Math.max(41, 25 + contactLines.length * 4.5 + (title ? 9 : 3));
  doc.setDrawColor(214, 222, 226);
  doc.setLineWidth(0.8);
  doc.line(left, lineY, right, lineY);
  return lineY + 9;
}
