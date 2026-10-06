import dotenv from "dotenv";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
process.chdir(appRoot);
process.env.NODE_ENV ||= "production";
dotenv.config({
	path: path.join(appRoot, process.env.NODE_ENV === "production" ? ".env.production" : ".env"),
});

const migration = spawn(process.execPath, [path.join(appRoot, "scripts", "migrate.mjs")], {
	cwd: appRoot,
	env: process.env,
	stdio: "inherit",
});

migration.once("error", (error) => {
	console.error("[STARTUP] Failed to run database migrations:", error);
	process.exitCode = 1;
});

migration.once("exit", (code) => {
	if (code !== 0) {
		console.error(`[STARTUP] Database migrations failed with exit code ${code}`);
		process.exitCode = code ?? 1;
		return;
	}

	void import("./dist/index.js").catch((error) => {
		console.error("[STARTUP] Failed to load Kiini server:", error);
		process.exitCode = 1;
	});
});
