/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error("INSTRUMENTATION CHECK FAILED:", msg);
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, "..");
const clientPath = path.join(repoRoot, "src", "instrumentation-client.ts");
const serverPath = path.join(repoRoot, "src", "instrumentation-server.ts");

if (!fs.existsSync(clientPath)) fail(`Missing file: ${clientPath}`);
if (!fs.existsSync(serverPath)) fail(`Missing file: ${serverPath}`);

const clientContent = fs.existsSync(clientPath)
  ? fs.readFileSync(clientPath, "utf-8")
  : "";
const serverContent = fs.existsSync(serverPath)
  ? fs.readFileSync(serverPath, "utf-8")
  : "";

// Accept either a direct export in src/ or a re-export to the root instrumentation files
const rootClientPath = path.join(repoRoot, "instrumentation-client.ts");
const rootServerPath = path.join(repoRoot, "instrumentation-server.ts");
const rootClientContent = fs.existsSync(rootClientPath)
  ? fs.readFileSync(rootClientPath, "utf-8")
  : "";
const rootServerContent = fs.existsSync(rootServerPath)
  ? fs.readFileSync(rootServerPath, "utf-8")
  : "";

const clientHasRegister =
  /export\s+function\s+register\s*\(/.test(clientContent) ||
  /export\s+function\s+register\s*\(/.test(rootClientContent);
const serverHasRegister =
  /export\s+function\s+register\s*\(/.test(serverContent) ||
  /export\s+function\s+register\s*\(/.test(rootServerContent);

if (!clientHasRegister) {
  fail(
    "client instrumentation missing `export function register()` in src/ or root instrumentation file"
  );
}
if (!serverHasRegister) {
  fail(
    "server instrumentation missing `export function register()` in src/ or root instrumentation file"
  );
}

const clientHasRouterHook =
  /onRouterTransitionStart/.test(clientContent) ||
  /onRouterTransitionStart/.test(rootClientContent);
if (!clientHasRouterHook) {
  console.warn(
    "Warning: client instrumentation does not export `onRouterTransitionStart`"
  );
}

console.log("Instrumentation check passed");
process.exit(0);
