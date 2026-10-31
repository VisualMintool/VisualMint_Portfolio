#!/usr/bin/env node
/* ==========================================
   Portfolio manifest generator
   assets/portfolio/<category>/ ke andar ki images scan karke
   assets/portfolio/manifest.json bana deta hai.
   Koi package install nahi karna: sirf Node.js chahiye.
   ========================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'assets', 'portfolio');
const OUT = path.join(BASE, 'manifest.json');

// Folder ka naam hi category hai
const CATEGORIES = ['thumbnails', 'logos', 'social-media', 'other'];
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// "All" mein categories is tarteeb se dikhengi (sab se upar pehli).
// Tarteeb badalni ho to bas in naamon ki jagah badal dein.
const DISPLAY_ORDER = ['thumbnails', 'social-media', 'logos', 'other'];

/* ---------- Image size (header se, bina kisi library ke) ---------- */
function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function webpSize(b) {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const type = b.toString('ascii', 12, 16);
  if (type === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (type === 'VP8L') {
    const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    };
  }
  if (type === 'VP8X') {
    return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  }
  return null;
}

// Extension par bharosa nahi: file ke andar ka asli format dekhte hain
// (jaise poster.webp.jpg ya png data wali .jpg file bhi sahi chalti hai)
function getSize(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return pngSize(buf);
    if (buf[0] === 0x52 && buf[1] === 0x49) return webpSize(buf);
    return jpegSize(buf);
  } catch (e) {
    return null;
  }
}

/* ---------- Image kab upload hui (naya pehle dikhane ke liye) ---------- */
function addedTime(abs) {
  try {
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    const out = execFileSync('git', ['log', '--diff-filter=A', '--format=%ct', '-1', '--', rel], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    if (out) return parseInt(out, 10);
  } catch (e) { /* git na ho to neeche wala fallback */ }
  return Math.floor(fs.statSync(abs).mtimeMs / 1000);
}

const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

/* ---------- Main ---------- */
const items = [];
const seen = new Map();
let duplicates = 0;

for (const category of CATEGORIES) {
  const dir = path.join(BASE, category);
  fs.mkdirSync(dir, { recursive: true });

  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && !d.name.startsWith('.') && EXTENSIONS.has(path.extname(d.name).toLowerCase()))
    .map(d => d.name)
    .sort(natural);

  for (const file of files) {
    const abs = path.join(dir, file);
    const buf = fs.readFileSync(abs);
    if (!buf.length) continue;

    const src = `assets/portfolio/${category}/${file}`;
    const hash = crypto.createHash('sha1').update(buf).digest('hex');

    // Same image dobara (kisi bhi folder mein) ho to sirf pehli rakho
    if (seen.has(hash)) {
      duplicates++;
      console.log(`::warning::Duplicate skipped: ${src} (same as ${seen.get(hash)})`);
      continue;
    }
    seen.set(hash, src);

    const size = getSize(buf) || {};
    const item = { src, category };
    if (size.width && size.height) { item.width = size.width; item.height = size.height; }
    item.added = addedTime(abs);
    items.push(item);
  }
}

// Pehle category ki tarteeb (DISPLAY_ORDER), phir us ke andar naye upload pehle, phir naam
const rank = c => DISPLAY_ORDER.indexOf(c);
items.sort((a, b) =>
  (rank(a.category) - rank(b.category)) ||
  (b.added - a.added) ||
  natural(a.src, b.src)
);

const manifest = { version: 1, count: items.length, items };
const json = JSON.stringify(manifest, null, 2) + '\n';

const old = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (old !== json) {
  fs.writeFileSync(OUT, json);
  console.log(`manifest.json updated: ${items.length} images (${duplicates} duplicates skipped)`);
} else {
  console.log(`manifest.json already up to date: ${items.length} images`);
}
