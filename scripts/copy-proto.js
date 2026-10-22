/**
 * Copies the prototype's index.html into public/proto/ so it is served
 * statically at /proto during Vercel builds.
 *
 * The prototype directory remains the single source of truth — this script
 * just copies the file at build time. Run `npm run copy-proto` before
 * `npm run dev` for local development.
 */
const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'prototype', 'index.html');
const destDir = path.join(process.cwd(), 'public', 'proto');
const dest = path.join(destDir, 'index.html');

if (!fs.existsSync(src)) {
  console.error('prototype/index.html not found — skipping copy.');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('✓ Copied prototype/index.html -> public/proto/index.html');
