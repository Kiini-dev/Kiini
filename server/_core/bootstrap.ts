import dotenv from "dotenv";
import path from "node:path";

const environmentFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), environmentFile) });

await import("./index");