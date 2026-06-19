#!/usr/bin/env node
/**
 * Build main.css by concatenating CSS files in order.
 * Simple fs-based concat (replaces old Gulp concat pipeline).
 */
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const DIST_CSS = path.resolve(__dirname, 'dist/css');
fs.mkdirSync(DIST_CSS, { recursive: true });

const sources = [
  'node_modules/bootstrap/dist/css/bootstrap.min.css',
  'css/dc.css',
  'src/dcfix.css',
  'src/main.css',
];

let combined = '';
for (const src of sources) {
  const filePath = path.resolve(__dirname, src);
  if (!fs.existsSync(filePath)) {
    console.error(`[build-css] WARNING: ${src} not found, skipping`);
    continue;
  }
  combined += fs.readFileSync(filePath, 'utf-8') + '\n';
}

const outPath = path.join(DIST_CSS, 'main.css');
fs.writeFileSync(outPath, combined);

// Gzip
const gzPath = path.join(DIST_CSS, 'main.css.gz');
fs.writeFileSync(gzPath, zlib.gzipSync(combined, { level: 9 }));

console.log(`[build-css] main.css (${sources.length} files concatenated, ${(combined.length / 1024).toFixed(0)} KB)`);
console.log(`  ✓ main.css + main.css.gz`);
