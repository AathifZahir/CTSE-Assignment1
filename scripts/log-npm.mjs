/**
 * Runs npm run _dev or npm run _build from the service directory, teeing
 * stdout/stderr to logs/<service>-npm-<mode>.log at repo root.
 */
import { spawn } from "node:child_process";
import { mkdirSync, createWriteStream } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const mode = process.argv[2];
if (mode !== "dev" && mode !== "build") {
  console.error("Usage: node scripts/log-npm.mjs <dev|build>");
  process.exit(1);
}

const serviceName = basename(process.cwd());
const logsDir = join(repoRoot, "logs");
mkdirSync(logsDir, { recursive: true });

const logPath = join(logsDir, `${serviceName}-npm-${mode}.log`);
const innerScript = mode === "dev" ? "_dev" : "_build";

const banner = `[${new Date().toISOString()}] ${serviceName} npm run ${mode} (cwd: ${process.cwd()})\n`;
const logStream = createWriteStream(logPath, { flags: "w" });
logStream.write(banner);

const child = spawn("npm", ["run", innerScript], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  logStream.write(chunk);
});
child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  logStream.write(chunk);
});

function finish(code, signal) {
  const footer = `\n[${new Date().toISOString()}] exit code: ${code}${signal ? ` signal: ${signal}` : ""}\n`;
  logStream.write(footer);
  logStream.end(() => process.exit(code ?? 1));
}

child.on("close", finish);
child.on("error", (err) => {
  const msg = `${err}\n`;
  process.stderr.write(msg);
  logStream.write(msg);
  logStream.end(() => process.exit(1));
});
