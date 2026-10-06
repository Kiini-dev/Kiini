import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
// Schema doesn't export a `User` type; use a compat alias while types are iterated.
type User = any;
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext & { csrfToken?: string }> {
  // authenticateRequest now returns null instead of throwing, so no try-catch needed
  const user = await sdk.authenticateRequest(opts.req);

  const ctx: TrpcContext & { csrfToken?: string } = {
    req: opts.req,
    res: opts.res,
    user,
  };

  // attach CSRF token if available
  if (typeof opts.req.csrfToken === 'function') {
    try {
      ctx.csrfToken = opts.req.csrfToken();
    } catch {
      // ignore if unavailable
    }
  }

  return ctx;
}
