// Stamps a unique build id into dist/sw.js so each deploy gets a fresh
// service worker cache name, forcing old cached assets to be cleared.
import { readFileSync, writeFileSync } from 'node:fs';

const swPath = new URL('../dist/sw.js', import.meta.url);
const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || String(Date.now());

const contents = readFileSync(swPath, 'utf8');
writeFileSync(swPath, contents.replaceAll('__BUILD_ID__', buildId));

console.log(`sw.js stamped with build id: ${buildId}`);
