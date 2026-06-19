#!/usr/bin/env node
/**
 * MEPWatch build script.
 * Produces all JS bundles using esbuild.
 * Replaces the old Gulp 3 pipeline (gulp-concat + uglify).
 */
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const DIST_JS = path.resolve(__dirname, 'dist/js');
const DIST_CSS = path.resolve(__dirname, 'dist/css');

fs.mkdirSync(DIST_JS, { recursive: true });
fs.mkdirSync(DIST_CSS, { recursive: true });

function gzip(filePath) {
  const content = fs.readFileSync(filePath);
  const compressed = zlib.gzipSync(content, { level: 9 });
  fs.writeFileSync(filePath + '.gz', compressed);
}

// dcbundle.js entry content
const dcbundleContent = `
window.crossfilter = require('crossfilter2');
window.reductio = require('reductio');
window.d3 = require('d3');
window.topojson = require('topojson');
window.d3.tip = require('d3-tip');
window.dc = require('dc');
window.d3.queue = require('d3-queue/build/d3-queue.js').queue;
window.doT = require('./node_modules/dot/doT.js');
require('country-flag-emoji-polyfill').polyfillCountryFlagEmojis();

setTimeout(() => {
  document.dispatchEvent(new CustomEvent('mepwatch.lib_ready', {
    detail: {
      crossfilter: window.crossfilter,
      reductio: window.reductio,
      d3: window.d3,
      topojson: window.topojson,
      dc: window.dc,
      dot: window.doT,
    }
  }));
}, 0);
`;

async function buildAll() {
  // 1. dcbundle.js — D3 + DC + crossfilter + topojson + etc.
  console.log('[build] dcbundle.js …');
  await esbuild.build({
    stdin: { contents: dcbundleContent, resolveDir: __dirname },
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.join(DIST_JS, 'dcbundle.js'),
    platform: 'browser',
    target: ['es2017'],
  });
  gzip(path.join(DIST_JS, 'dcbundle.js'));
  console.log('  ✓ dcbundle.js');

  // 2. main.js — Bootstrap 5 JS (self-contained, no jQuery)
  console.log('[build] main.js …');
  await esbuild.build({
    stdin: {
      contents: `window.bootstrap = require('bootstrap/dist/js/bootstrap.bundle.js');`,
      resolveDir: __dirname,
    },
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.join(DIST_JS, 'main.js'),
    platform: 'browser',
    target: ['es2017'],
  });
  gzip(path.join(DIST_JS, 'main.js'));
  console.log('  ✓ main.js');

  // 3. widget.js — iframe-resizer + custom widget code
  console.log('[build] widget.js …');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, 'src/js/widget.js')],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.join(DIST_JS, 'widget.js'),
    platform: 'browser',
    target: ['es2017'],
  });
  gzip(path.join(DIST_JS, 'widget.js'));
  console.log('  ✓ widget.js');
}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});
