import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../typography.css'), 'utf8');

describe('typography layer', () => {
  it('sets Thai body line-height to at least 1.7', () => {
    const match = css.match(/\.text-body\s*\{[^}]*line-height:\s*([\d.]+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(1.7);
  });

  it('uses line-break: strict with word-break: normal', () => {
    expect(css).toContain('line-break: strict');
    expect(css).toContain('word-break: normal');
  });

  it('never uses overflow-wrap: break-word, which breaks Thai mid-syllable', () => {
    expect(css).not.toContain('break-word');
  });

  it('applies tabular numerals to the numeric class', () => {
    const match = css.match(/\.text-numeric\s*\{[^}]*font-variant-numeric:\s*tabular-nums/);
    expect(match).not.toBeNull();
  });

  it('holds a 16px body floor on mobile to prevent iOS input auto-zoom', () => {
    const match = css.match(/\.text-body\s*\{[^}]*font-size:\s*(\d+)px/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(16);
  });

  it('provides a truncation class that is line-based, never mid-string', () => {
    expect(css).toContain('.text-truncate-safe');
    expect(css).toContain('-webkit-line-clamp');
    expect(css).not.toContain('text-overflow: ellipsis');
  });
});
