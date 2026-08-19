import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { contrastRatio } from '@/lib/contrast';
import { parseTokens } from '@/lib/parse-tokens';

const css = readFileSync(resolve(__dirname, '../tokens.css'), 'utf8');
const { light, dark } = parseTokens(css);

// Colours permitted for text below 24px. Must clear 4.5:1 on both surfaces.
const BODY_TEXT_TOKENS = [
  'text', 'text-2', 'text-soft', 'muted-text',
  'accent-text', 'pos-text', 'neg-text', 'warn-text',
];

// Colours used for icons and text at 24px+. Must clear 3:1 on --bg.
// --primary is deliberately absent: it is a fill, never a foreground.
const LARGE_OR_GRAPHIC_TOKENS = ['accent', 'pos', 'neg', 'warn'];

// [fill, label] pairs. The label must clear 4.5:1 against the fill.
const FILL_LABEL_PAIRS: Array<[string, string]> = [['primary', 'on-primary']];

// Boundaries that are the sole visual indicator of a control.
const NON_TEXT_BOUNDARY_TOKENS = ['border-input', 'primary-border'];

const ALL = [
  ...BODY_TEXT_TOKENS, ...LARGE_OR_GRAPHIC_TOKENS, ...NON_TEXT_BOUNDARY_TOKENS,
  'primary', 'on-primary', 'bg', 'surface',
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme', (_name, theme) => {
  it('defines every token both themes need', () => {
    for (const t of ALL) {
      expect(theme[t], `missing token --${t}`).toBeDefined();
    }
  });

  it.each(BODY_TEXT_TOKENS)('--%s meets 4.5:1 on --bg and --surface', (token) => {
    expect(contrastRatio(theme[token], theme.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme[token], theme.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LARGE_OR_GRAPHIC_TOKENS)('--%s meets 3:1 on --bg', (token) => {
    expect(contrastRatio(theme[token], theme.bg)).toBeGreaterThanOrEqual(3);
  });

  it.each(FILL_LABEL_PAIRS)('--%s carries a label (--%s) at 4.5:1', (fill, label) => {
    expect(contrastRatio(theme[label], theme[fill])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT_BOUNDARY_TOKENS)('--%s meets the 3:1 non-text floor on --bg and --surface', (token) => {
    expect(contrastRatio(theme[token], theme.bg)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(theme[token], theme.surface)).toBeGreaterThanOrEqual(3);
  });
});
