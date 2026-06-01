// Minimal production server for the TanStack Start build.
//
// `vite build` emits a web-standard fetch handler at dist/server/server.js and
// hashed static assets at dist/client. `vite preview` is explicitly not a
// production server (and host-checks behind a proxy), so we serve the build
// directly: static files from dist/client first, everything else through the
// SSR handler. No framework runtime, only Node built-ins.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import ssr from "./dist/server/server.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const CLIENT_DIR = fileURLToPath(new URL("./dist/client", import.meta.url));

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".wasm": "application/wasm",
};

/** Resolve a request path to a real file inside dist/client, or null. */
async function resolveStatic(pathname) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\]|\.\.[/\\])+/, "");
  const filePath = join(CLIENT_DIR, rel);
  if (filePath !== CLIENT_DIR && !filePath.startsWith(CLIENT_DIR + "/")) return null;
  try {
    const s = await stat(filePath);
    if (s.isFile()) return { filePath, size: s.size };
  } catch {
    /* not a static file */
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const url = `http://${req.headers.host ?? "localhost"}${req.url}`;
    const { pathname } = new URL(url);

    if ((req.method === "GET" || req.method === "HEAD") && pathname !== "/") {
      const file = await resolveStatic(pathname);
      if (file) {
        const immutable = pathname.startsWith("/assets/");
        res.writeHead(200, {
          "content-type": MIME[extname(file.filePath)] ?? "application/octet-stream",
          "content-length": file.size,
          "cache-control": immutable
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
        });
        if (req.method === "HEAD") return void res.end();
        return void createReadStream(file.filePath).pipe(res);
      }
    }

    // Dynamic / SSR: bridge the Node request to a web Request.
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
      else if (value != null) headers.set(key, value);
    }
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const request = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? "half" : undefined,
    });

    const response = await ssr.fetch(request);
    const outHeaders = {};
    response.headers.forEach((v, k) => {
      outHeaders[k] = v;
    });
    res.writeHead(response.status, outHeaders);
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end(await response.text());
  } catch (err) {
    console.error("[web] request failed:", err);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`browserscape web listening on http://${HOST}:${PORT}`);
});
