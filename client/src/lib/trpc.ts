import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

// The application still contains legacy callers that use `{}` for procedures
// whose current server input is void. Keep the client boundary compatible while
// individual screens migrate to the generated procedure signatures.
export const trpc = createTRPCReact<AppRouter>() as any;
export default trpc;
