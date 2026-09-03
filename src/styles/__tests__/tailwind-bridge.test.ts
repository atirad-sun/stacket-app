import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseTokens } from '@/lib/parse-tokens';

const tokensCss = readFileSync(resolve(__dirname, '../tokens.css'), 'utf8');
const globalsCss = readFileSync(resolve(__dirname, '../../app/globals.css'), 'utf8');

describe('tailwind bridge', () => {
  it('imports the token layer', () => {
    expect(globalsCss).toContain('@import "../styles/tokens.css"');
  });

  it('opens an @theme block', () => {
    expect(globalsCss).toContain('@theme');
  });

  it('maps every colour token into @theme via var()', () => {
    const { light } = parseTokens(tokensCss);
    const colourTokens = Object.keys(light).filter(
      (t) =>
        !t.includes('tint') &&
        t !== 'scrim' &&
        t !== 'focus-ring' &&
        t !== 'drawer-shadow' &&
        t !== 'knob' &&
        t !== 'veil-strong' &&
        t !== 'veil-soft',
    );
    for (const token of colourTokens) {
      expect(globalsCss, `--color-${token} not bridged`).toContain(
        `--color-${token}: var(--${token});`,
      );
    }
  });

  it('never hard-codes a hex value outside the token layer', () => {
    expect(globalsCss).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });
});
