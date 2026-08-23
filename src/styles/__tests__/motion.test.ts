import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../motion.css'), 'utf8');

function ms(name: string): number {
  const match = css.match(new RegExp(`--${name}:\\s*(\\d+)ms`));
  expect(match, `--${name} not defined`).not.toBeNull();
  return Number(match![1]);
}

// Extracts the contents of every brace-balanced block whose opening matches
// `openPattern` (which must end at the opening `{`). Unlike a lazy regex
// (`\{([\s\S]*?)\n\}`), this correctly stops at the block's own matching
// closing brace regardless of indentation, so it won't swallow sibling
// rules that happen to share the outer block's indent level.
function extractBraceBalancedBlocks(source: string, openPattern: RegExp): string[] {
  const blocks: string[] = [];
  const pattern = new RegExp(openPattern.source, openPattern.flags.includes('g') ? openPattern.flags : `${openPattern.flags}g`);
  for (const match of source.matchAll(pattern)) {
    const start = match.index! + match[0].length;
    let depth = 1;
    let i = start;
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') depth--;
      i++;
    }
    blocks.push(source.slice(start, i - 1));
  }
  return blocks;
}

describe('motion layer', () => {
  it('keeps enter duration within 150-300ms', () => {
    const enter = ms('duration-enter');
    expect(enter).toBeGreaterThanOrEqual(150);
    expect(enter).toBeLessThanOrEqual(300);
  });

  it('makes exit roughly 65% of enter', () => {
    const ratio = ms('duration-exit') / ms('duration-enter');
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.75);
  });

  it('uses ease-out entering and ease-in exiting', () => {
    expect(css).toMatch(/--ease-enter:\s*cubic-bezier\(0,\s*0,\s*0\.2,\s*1\)/);
    expect(css).toMatch(/--ease-exit:\s*cubic-bezier\(0\.4,\s*0,\s*1,\s*1\)/);
  });

  it('animates only transform and opacity via transitions', () => {
    const properties = [...css.matchAll(/transition-property:\s*([^;]+);/g)]
      .map((m) => m[1]);
    expect(properties.length).toBeGreaterThan(0);
    for (const list of properties) {
      for (const property of list.split(',').map((p) => p.trim())) {
        expect(['transform', 'opacity']).toContain(property);
      }
    }
  });

  it('animates only transform and opacity via @keyframes', () => {
    const keyframeBlocks = extractBraceBalancedBlocks(css, /@keyframes\s+[\w-]+\s*\{/g);
    expect(keyframeBlocks.length).toBeGreaterThan(0);
    const declaredProperties = keyframeBlocks.flatMap((block) =>
      [...block.matchAll(/([\w-]+)\s*:\s*[^;]+;/g)].map((m) => m[1]),
    );
    expect(declaredProperties.length).toBeGreaterThan(0);
    for (const property of declaredProperties) {
      expect(['opacity', 'transform']).toContain(property);
    }
  });

  it('disables motion under prefers-reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
