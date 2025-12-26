const fs = require("fs");
const path = require("path");

const clientPath = path.resolve(__dirname, "../src/instrumentation-client.ts");
const serverPath = path.resolve(__dirname, "../src/instrumentation-server.ts");

function fail(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}

if (!fs.existsSync(clientPath)) fail(`Missing ${clientPath}`);
if (!fs.existsSync(serverPath)) fail(`Missing ${serverPath}`);

const clientContent = fs.readFileSync(clientPath, "utf-8");
const serverContent = fs.readFileSync(serverPath, "utf-8");

if (!/export\s+const\s+onRouterTransitionStart/.test(clientContent)) {
  fail("instrumentation-client.ts must export onRouterTransitionStart");
}

if (!/export\s+function\s+register/.test(clientContent)) {
  fail("instrumentation-client.ts must export register");
}

if (!/export\s+function\s+register/.test(serverContent)) {
  fail("instrumentation-server.ts must export register");
}

console.log("Instrumentation checks passed");
process.exit(0);
