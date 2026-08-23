import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';

const SRC_ROOT = resolve(__dirname, '..');

// The sanctioned source of truth for colour values. Everything else
// references colour through tokens only.
const EXCLUDED_FILES = new Set([join(SRC_ROOT, 'styles', 'tokens.css')]);

function isExcluded(path: string): boolean {
  if (EXCLUDED_FILES.has(path)) return true;
  // Test files (and any __tests__ directory) legitimately reference hex
  // values as fixtures/expectations, e.g. contrast.test.ts, tokens.contrast.test.ts.
  if (path.split(sep).includes('__tests__')) return true;
  if (/\.test\.(ts|tsx)$/.test(path)) return true;
  return false;
}

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true, recursive: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;
    // entry.parentPath is available on modern Node; fall back to `path` for older typings.
    const parentPath = (entry as unknown as { parentPath?: string; path?: string }).parentPath
      ?? (entry as unknown as { path: string }).path;
    files.push(join(parentPath, entry.name));
  }
  return files;
}

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

describe('no raw hex outside tokens.css', () => {
  const files = collectSourceFiles(SRC_ROOT).filter((f) => !isExcluded(f));

  it('scans at least one source file', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has no raw hex colour value', (file) => {
    const contents = readFileSync(file, 'utf8');
    const match = contents.match(HEX_PATTERN);
    expect(match, `found raw hex "${match?.[0]}" in ${file}`).toBeNull();
  });
});
