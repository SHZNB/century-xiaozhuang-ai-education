import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "pages-dist");

const copyEntries = [
  "index.html",
  "config.js",
  "config.example.js",
  "styles.css",
  "app.js",
  "assets",
  ".nojekyll"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of copyEntries) {
  await cp(path.join(root, entry), path.join(outDir, entry), { recursive: true });
}

await writeFile(
  path.join(outDir, "DEPLOYMENT-NOTE.txt"),
  [
    "This GitHub Pages artifact is the static front-end preview for 百年晓庄智慧教育平台.",
    "Full login, model routing, alumni quota, uploads, workflows and audit logs require the Node service.",
    "Deploy the Node service from this repository to a school server or cloud host for production use.",
    ""
  ].join("\n"),
  "utf8"
);

console.log(`GitHub Pages static artifact written to ${outDir}`);
