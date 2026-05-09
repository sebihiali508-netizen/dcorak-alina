import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const handler = (await import(resolve(__dirname, "./dist/server/index.js"))).default;
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
  });
  handler
    .fetch(request, {}, {})
    .then((response) => {
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      response.body ? response.body.pipeTo(new WritableStream({ write: (chunk) => res.write(chunk), close: () => res.end() })) : res.end();
    })
    .catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
});

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
