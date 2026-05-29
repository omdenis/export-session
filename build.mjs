#!/usr/bin/env node
// Build AI Export Session into dist/ and produce an installable zip.
// Cross-platform. Requires Node 18+. Zero npm dependencies.
// Usage:  node build.mjs

import { rm, mkdir, cp, readdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src  = join(root, 'src');
const out  = join(root, 'dist');
const pkg  = join(out, 'AI Export Session');
const zip  = join(out, 'ai-export-session.zip');

try { await access(src); } catch { throw new Error('Missing src/ folder'); }

// clean previous build
await rm(out, { recursive: true, force: true });
await mkdir(pkg, { recursive: true });

// copy entire source tree into the package
await cp(src, pkg, { recursive: true });

// zip the package contents (Chrome loads the inner folder; zip is for sharing/store)
const isWin = process.platform === 'win32';
const zipResult = isWin
  ? spawnSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
       `Compress-Archive -Path '${pkg.replace(/'/g, "''")}\\*' ` +
       `-DestinationPath '${zip.replace(/'/g, "''")}' -Force`],
      { stdio: 'inherit' })
  : spawnSync('zip', ['-r', '-q', zip, '.'], { cwd: pkg, stdio: 'inherit' });

if (zipResult.error || zipResult.status !== 0) {
  console.error('Zip step failed. Unpacked folder still available at', pkg);
  if (!isWin) console.error('Install `zip` (e.g. `apt install zip`, `brew install zip`).');
  process.exit(1);
}

async function countFiles(dir) {
  let n = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? await countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}

console.log(`Built ${await countFiles(pkg)} files -> ${pkg}`);
console.log(`Zip -> ${zip}`);
