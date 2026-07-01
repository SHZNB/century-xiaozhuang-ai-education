const major = Number.parseInt(process.versions.node.split(".")[0], 10);

if (!Number.isFinite(major) || major < 24) {
  console.error(`Node.js 24 or newer is required. Current version: ${process.version}`);
  process.exit(1);
}

try {
  await import("node:sqlite");
} catch (error) {
  console.error("node:sqlite is not available in this runtime.");
  console.error(error?.message || error);
  process.exit(1);
}

console.log(`Runtime OK: ${process.version} with node:sqlite`);
