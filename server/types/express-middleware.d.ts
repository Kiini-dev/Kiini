declare module "cookie-parser" {
  import { RequestHandler } from "express";
  const cookieParser: (secret?: string | string[], options?: Record<string, unknown>) => RequestHandler;
  export default cookieParser;
}

declare module "csurf" {
  import { RequestHandler } from "express";
  interface CsrfOptions {
    cookie?: boolean | Record<string, unknown>;
    value?: (request: Express.Request) => string;
  }
  const csrf: (options?: CsrfOptions) => RequestHandler;
  export default csrf;
}

declare global {
  namespace Express {
  interface Request {
    csrfToken?: () => string;
    rateLimit?: {
      resetTime?: Date | number;
    };
    session?: {
      user?: {
        organizationId?: string;
        [key: string]: any;
      };
      lastActivity?: number;
      [key: string]: any;
    };
  }
  }
}

export {};
