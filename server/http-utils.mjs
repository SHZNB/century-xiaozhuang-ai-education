import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

export function json(response, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    ...headers
  });
  response.end(payload);
}

export function text(response, status, body, headers = {}) {
  const payload = String(body);
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    ...headers
  });
  response.end(payload);
}

export async function readJson(request, limit = 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("请求内容过大");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON 格式不正确");
    error.status = 400;
    throw error;
  }
}

export async function readBuffer(request, limit = 10 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("上传文件超过 10MB");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function requestPath(request) {
  return new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname;
}

export async function serveStatic(response, root, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const resolvedRoot = path.resolve(root);
  const filePath = path.resolve(root, `.${decodeURIComponent(requested)}`);
  if (!filePath.startsWith(`${resolvedRoot}${path.sep}`) && filePath !== resolvedRoot) return false;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return false;
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": requested === "/index.html" ? "no-cache" : "public, max-age=3600"
    });
    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false;
  }
}

export function safeId(value) {
  return /^[a-zA-Z0-9_-]+$/.test(value || "");
}
