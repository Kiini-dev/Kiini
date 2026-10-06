export type ERPConnectorProvider = "etims" | "bank_feed" | "edi" | "ecommerce" | "payroll" | "mpesa";

export interface ERPConnectorConfig {
  provider: ERPConnectorProvider;
  baseUrl?: string;
  apiKey?: string;
  consumerKey?: string;
  consumerSecret?: string;
  accountId?: string;
  environment?: "sandbox" | "production";
}

export interface ERPConnectorRequest {
  provider: ERPConnectorProvider;
  eventType: string;
  path: string;
  method: "GET" | "POST";
  payload: Record<string, unknown>;
  headers: Record<string, string>;
}

const REQUIRED_FIELDS: Record<ERPConnectorProvider, string[]> = {
  etims: ["baseUrl", "apiKey"],
  bank_feed: ["baseUrl", "apiKey"],
  edi: ["baseUrl", "apiKey"],
  ecommerce: ["baseUrl", "apiKey"],
  payroll: ["baseUrl", "apiKey"],
  mpesa: ["consumerKey", "consumerSecret"],
};

export function validateERPConnector(config: ERPConnectorConfig): string[] {
  return (REQUIRED_FIELDS[config.provider] || []).filter((field) => !config[field as keyof ERPConnectorConfig]);
}

export function buildERPConnectorRequest(config: ERPConnectorConfig, eventType: string, payload: Record<string, unknown>): ERPConnectorRequest {
  const missing = validateERPConnector(config);
  if (missing.length) throw new Error(`Missing ${config.provider} connector fields: ${missing.join(", ")}`);
  const paths: Record<ERPConnectorProvider, string> = {
    etims: "/invoices/fiscalize",
    bank_feed: "/transactions/import",
    edi: "/documents",
    ecommerce: "/orders/sync",
    payroll: "/payroll/sync",
    mpesa: "/payments/status",
  };
  return {
    provider: config.provider,
    eventType,
    path: paths[config.provider],
    method: "POST",
    payload: { eventType, environment: config.environment || "production", ...payload },
    headers: { "content-type": "application/json", "x-connector-provider": config.provider, ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}) },
  };
}

export async function probeERPConnector(config: ERPConnectorConfig): Promise<{ ok: boolean; status: number; message: string }> {
  const missing = validateERPConnector(config);
  if (missing.length) return { ok: false, status: 0, message: `Missing connector fields: ${missing.join(", ")}` };
  if (!config.baseUrl) return { ok: true, status: 0, message: "Credentials validated; no base URL configured" };
  try {
    const response = await fetch(config.baseUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return { ok: response.ok, status: response.status, message: response.ok ? "Connector endpoint reachable" : `Connector returned ${response.status}` };
  } catch (error) {
    return { ok: false, status: 0, message: error instanceof Error ? error.message : "Connector probe failed" };
  }
}
