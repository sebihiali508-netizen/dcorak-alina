import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

let server;

async function getServer() {
  if (!server) {
    process.chdir(root);
    const mod = await import("../dist/server/server.js");
    server = mod.default;
  }
  return server;
}

export default async function handler(req, res) {
  const srv = await getServer();
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => r(d)); })
    : undefined;
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body,
  });
  try {
    const response = await srv.fetch(request, {}, {});
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
  } catch (err) {
    console.error("SSR Error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
