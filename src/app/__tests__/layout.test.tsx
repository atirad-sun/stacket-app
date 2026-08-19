import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const layout = readFileSync(resolve(__dirname, '../layout.tsx'), 'utf8');

describe('root layout constraints', () => {
  it('declares Thai as the document language', () => {
    expect(layout).toContain('lang="th"');
  });

  it('uses min-h-dvh and never 100vh', () => {
    expect(layout).toContain('min-h-dvh');
    expect(layout).not.toContain('100vh');
  });

  it('names the product in lowercase', () => {
    expect(layout).toContain("title: 'stacket'");
  });
});
