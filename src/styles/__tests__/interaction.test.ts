import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../interaction.css'), 'utf8');

describe('interaction layer', () => {
  it('defines a focus-visible ring of at least 3px', () => {
    const match = css.match(/outline:\s*(\d+)px/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(3);
  });

  it('never removes focus outlines', () => {
    expect(css).not.toMatch(/outline:\s*(none|0)\b/);
  });

  it('enforces a 44px minimum tap target', () => {
    const block = css.match(/\.tap-target\s*\{([^}]+)\}/);
    expect(block).not.toBeNull();
    expect(block![1]).toMatch(/min-width:\s*44px/);
    expect(block![1]).toMatch(/min-height:\s*44px/);
  });

  it('uses the focus-ring token rather than a hex value', () => {
    expect(css).toContain('var(--focus-ring)');
    expect(css).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });
});
