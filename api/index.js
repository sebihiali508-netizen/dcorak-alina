import handler from "../dist/server/server.js";

export default async function (req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await new Promise((resolve) => { let d = ""; req.on("data", (c) => d += c); req.on("end", () => resolve(d)); })
    : undefined;
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body,
  });
  try {
    const response = await handler.fetch(request, {}, {});
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
