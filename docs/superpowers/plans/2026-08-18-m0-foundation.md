# M0 Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation layer of the stacket design system — repo, token layer with a verified WCAG AA palette, Thai-first typography, theming, accessibility primitives, the four-state contract, and Storybook — so that component work in the follow-on plan has one correct place to plug into.

**Architecture:** A single Next.js 15 App Router repo in TypeScript. Colour lives once, as CSS custom properties on `[data-theme]`, and Tailwind v4 references those properties rather than duplicating them — so there is exactly one source of colour and theming ports from the mockups unchanged. Accessibility is built into the primitives here (focus management, contrast, reduced motion, target sizes) rather than retrofitted across ~40 components later. Every rule that the spec states as non-negotiable is encoded as a test, not a convention.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Vitest + React Testing Library + jsdom, vitest-axe, Storybook 8, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-17-stacket-v1-design.md` §5 (M0), with §10.5 for non-functional requirements and §2.2 N4/N6 for the brand and styling decisions.

**Scope note:** M0 in the spec covers both this foundation and the port of ~25 mockup components (§5.6). This plan covers the foundation only — it is a standalone, testable deliverable. The component port follows in `2026-08-18-m0-components.md`, written after this plan is executed, because the component tasks depend on the primitive APIs this plan produces.

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **No raw hex in components, anywhere.** Colour is referenced through tokens only. (§5.1)
- **Product name is `stacket`**, lowercase, in all copy and metadata. (§2.3)
- **Thai is the default language**, English is the fallback. All copy is written in Thai first. (§10.5)
- **Line-height minimum 1.7 for Thai body text**, versus 1.5 for Latin. (§5.2)
- **`word-break: normal` with `line-break: strict`. Never `overflow-wrap: break-word`** — it breaks mid-syllable and produces nonsense. (§5.2)
- **Never truncate Thai mid-string** without an expand affordance. (§5.2)
- **Body minimum sizes:** mobile 11–13px floor, desktop 12.5–13px floor. Headings 18–24px mobile, 26–30px desktop. (§5.2)
- **`font-variant-numeric: tabular-nums` on every price figure.** (§5.2)
- **Contrast 4.5:1 body, 3:1 large, verified independently in light and dark.** (§5.3)
- **Visible 3–4px focus rings; focus never removed.** (§5.3)
- **Touch targets ≥ 44×44px, ≥ 8px apart.** (§5.3)
- **Colour is never the sole signal.** (§5.3)
- **`prefers-reduced-motion` respected throughout.** (§5.3)
- **Motion is 150–300ms, `ease-out` entering, `ease-in` exiting, exit ~65% of enter duration, `transform` and `opacity` only.** (§5.5)
- **Toasts: 2.6s auto-dismiss, `aria-live="polite"`, never steal focus, never the only record of a money event.** (§5.5)
- **Text scales to 200% without layout breakage.** (§5.3)
- **`min-h-dvh`, never `100vh`. No horizontal scroll at any width.** (§10.5)
- **Breakpoints for review: 375 / 768 / 1440.** (§5.6)

---

## File Structure

```
package.json                          pnpm workspace root, scripts
tsconfig.json                         strict TS
next.config.ts                        Next 15 config
vitest.config.ts                       jsdom env, setup file
vitest.setup.ts                        RTL cleanup, vitest-axe matchers
.github/workflows/ci.yml               lint + test + build gate

src/app/layout.tsx                     root layout, fonts, theme bootstrap
src/app/globals.css                    token layer + Tailwind v4 @theme bridge
src/app/page.tsx                       placeholder — no product screens in M0

src/styles/tokens.css                  THE colour source of truth (light + dark)
src/styles/typography.css              Thai/Latin type rules
src/styles/motion.css                  duration/easing tokens + reduced-motion

src/lib/contrast.ts                    WCAG ratio maths (used by tests)
src/lib/parse-tokens.ts                reads tokens.css into a map (used by tests)
src/lib/cn.ts                          className merge helper

src/theme/theme-script.ts              inline no-flash theme bootstrap
src/theme/theme-provider.tsx           React context, persistence, system default
src/theme/use-theme.ts                 consumer hook

src/primitives/focus-scope.tsx         focus trap + restore
src/primitives/overlay.tsx             scrim + portal + Escape, built on FocusScope
src/primitives/visually-hidden.tsx     screen-reader-only text
src/primitives/data-boundary.tsx       the four-state contract
src/primitives/skeleton.tsx            loading block used by DataBoundary
src/primitives/toast.tsx               toast provider + hook

.storybook/main.ts                     Storybook config
.storybook/preview.tsx                 theme + viewport toolbars, a11y addon
```

**Boundary rationale.** `src/styles/` holds values with no logic. `src/lib/` holds pure functions that tests can call directly without rendering. `src/theme/` owns everything about which theme is active. `src/primitives/` holds the behavioural building blocks every later component composes — each one is the single place a cross-cutting rule (focus, motion, states) is enforced, which is what stops the rule from being re-litigated in 25 component files.

---

### Task 1: Repo scaffold and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `pnpm test`, `pnpm build`, `pnpm lint`. All later tasks assume `vitest` runs with jsdom and `@/` resolves to `src/`.

- [ ] **Step 1: Initialise the repository**

The working directory is not yet a git repo.

```bash
cd /Users/sunatrd/Documents/Code/active/TCGround
git init
printf 'node_modules\n.next\nout\ncoverage\nstorybook-static\n.env*.local\n.DS_Store\n' > .gitignore
git add .gitignore docs files design-resources
git commit -m "chore: initialise repo with existing specs and discovery docs"
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "stacket",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "vitest-axe": "^0.1.0",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts and PostCSS config**

`next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

`postcss.config.mjs`:

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
```

- [ ] **Step 5: Create vitest config and setup**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);
afterEach(() => cleanup());
```

- [ ] **Step 6: Create the minimal app shell**

`src/app/globals.css`:

```css
@import "tailwindcss";
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
export default function Page() {
  return <main>stacket design system</main>;
}
```

- [ ] **Step 7: Write the failing smoke test**

`src/lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/cn';

describe('test harness', () => {
  it('resolves the @ alias and merges class names', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
```

- [ ] **Step 8: Run the test to verify it fails**

Run: `pnpm vitest run src/lib/__tests__/smoke.test.ts`
Expected: FAIL — cannot resolve `@/lib/cn`.

- [ ] **Step 9: Create the cn helper**

`src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 10: Run tests and build**

```bash
pnpm install
pnpm test
pnpm build
```
Expected: test PASSES, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 + TypeScript + Tailwind v4 + Vitest"
```

---

### Task 2: Token layer with an enforced contrast floor

The mockup palette was audited against WCAG 2.1 and **six tokens fail at body text size**. The spec (§5.3) requires that any failing token is adjusted here, before it is codified. The resolution keeps every mockup brand colour unchanged for fills, large text and graphics, and adds a parallel `-text` ramp for anything at body size. The look is preserved; the failures are not.

Measured failures, light theme on `#FFFFFF`:

| Token | Value | Ratio | Verdict |
|---|---|---|---|
| `--primary` | `#00A98A` | 2.98 | fails 4.5:1 **and** 3:1 |
| `--accent` | `#00907A` | 3.98 | fails 4.5:1, passes 3:1 |
| `--pos` | `#059669` | 3.77 | fails 4.5:1, passes 3:1 |
| `--neg` on `--surface` | `#E11D48` | 4.30 | fails 4.5:1 |
| `--muted-3` | `#A2AAB8` | 2.34 | decorative only |

Dark theme on `#0A0E16`: `--muted` `#64748B` measures 4.06 — fails 4.5:1.

**And the one that matters most.** The mockup's primary button is `--on-primary` `#FFFFFF` on `--primary` `#00A98A` — **2.98:1**. The single most important call to action in the product fails AA, in light theme, by a wide margin.

The fix keeps the brand teal exactly as drawn and flips the *label* instead: near-black `#0B0D12` on `#00A98A` measures **6.52:1**. Darkening the fill to `#007564` would also work (5.63:1 with white) but changes the brand colour, which N4 says is verbatim. Flipping the label changes nothing visible about the brand and brings light into line with dark, which already uses a dark label on teal (`#04150F` at 6.29:1).

Separately, a `#00A98A` fill against a white page measures 2.98:1, below the 3:1 non-text floor for control boundaries (WCAG 1.4.11), so the primary button carries a 1px `--primary-border` (`#00907A`, 3.98:1).

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/lib/contrast.ts`, `src/lib/parse-tokens.ts`
- Test: `src/lib/__tests__/contrast.test.ts`, `src/styles/__tests__/tokens.contrast.test.ts`

**Interfaces:**
- Consumes: `cn` from Task 1 (not directly used here).
- Produces: `contrastRatio(hexA: string, hexB: string): number`; `relativeLuminance(hex: string): number`; `parseTokens(css: string): { light: Record<string,string>; dark: Record<string,string> }`. Produces the CSS custom property names every later task and component uses.

- [ ] **Step 1: Write the failing contrast-maths test**

`src/lib/__tests__/contrast.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contrastRatio, relativeLuminance } from '@/lib/contrast';

describe('contrast', () => {
  it('computes luminance at the extremes', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('gives 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is order independent', () => {
    expect(contrastRatio('#00A98A', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#00A98A'), 6,
    );
  });

  it('reproduces the audited value for brand teal on white', () => {
    expect(contrastRatio('#00A98A', '#FFFFFF')).toBeCloseTo(2.98, 1);
  });

  it('accepts shorthand hex', () => {
    expect(contrastRatio('#000', '#FFF')).toBeCloseTo(21, 2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/lib/__tests__/contrast.test.ts`
Expected: FAIL — cannot resolve `@/lib/contrast`.

- [ ] **Step 3: Implement contrast maths**

`src/lib/contrast.ts`:

```ts
function expand(hex: string): string {
  const h = hex.trim().replace('#', '');
  if (h.length === 3) return h.split('').map((c) => c + c).join('');
  if (h.length === 6) return h;
  throw new Error(`Unsupported hex colour: ${hex}`);
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = expand(hex);
  const r = channel(parseInt(h.slice(0, 2), 16));
  const g = channel(parseInt(h.slice(2, 4), 16));
  const b = channel(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/lib/__tests__/contrast.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing token-audit test**

This test is the enforcement mechanism. It reads the real stylesheet, so a future edit that reintroduces a failing colour breaks the build.

`src/styles/__tests__/tokens.contrast.test.ts`:

```ts
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

  it.each(NON_TEXT_BOUNDARY_TOKENS)('--%s meets the 3:1 non-text floor on --bg', (token) => {
    expect(contrastRatio(theme[token], theme.bg)).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run src/styles/__tests__/tokens.contrast.test.ts`
Expected: FAIL — cannot resolve `@/lib/parse-tokens`.

- [ ] **Step 7: Implement the token parser**

`src/lib/parse-tokens.ts`:

```ts
export type TokenMap = Record<string, string>;

function block(css: string, selector: string): string {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function declarations(body: string): TokenMap {
  const map: TokenMap = {};
  for (const line of body.split(';')) {
    const [rawName, ...rest] = line.split(':');
    if (!rawName || rest.length === 0) continue;
    const name = rawName.trim();
    if (!name.startsWith('--')) continue;
    map[name.slice(2)] = rest.join(':').trim();
  }
  return map;
}

export function parseTokens(css: string): { light: TokenMap; dark: TokenMap } {
  return {
    light: declarations(block(css, '[data-theme="light"]')),
    dark: declarations(block(css, '[data-theme="dark"]')),
  };
}
```

- [ ] **Step 8: Run to confirm the parser resolves but the audit still fails**

Run: `pnpm vitest run src/styles/__tests__/tokens.contrast.test.ts`
Expected: FAIL — `tokens.css` does not exist yet.

- [ ] **Step 9: Write the token layer**

Values are the mockup's, verbatim, plus the six corrections. `src/styles/tokens.css`:

```css
:root,
[data-theme="light"] {
  --bg: #FFFFFF;
  --surface: #F3F5F8;
  --surface-2: #E9ECF1;
  --surface-3: #DFE3EA;
  --border: #E4E7EC;
  --border-strong: #CBD2DC;
  --border-input: #8C95A5;

  --text: #0B0D12;
  --text-2: #2B3240;
  --text-soft: #59616F;
  --muted: #606A7C;
  --muted-text: #606A7C;
  --muted-3: #A2AAB8;

  --primary: #00A98A;
  --primary-border: #00907A;
  --accent: #00907A;
  --accent-text: #007564;
  /* Near-black, not white: #FFFFFF on #00A98A is 2.98:1 and fails AA. */
  --on-primary: #0B0D12;
  --primary-tint: rgba(0, 169, 138, 0.12);
  --accent-tint: rgba(0, 169, 138, 0.10);

  --pos: #059669;
  --pos-text: #047857;
  --pos-tint: rgba(5, 150, 105, 0.10);
  --neg: #E11D48;
  --neg-text: #BE123C;
  --neg-tint: rgba(225, 29, 72, 0.08);
  --warn: #B45309;
  --warn-text: #B45309;
  --warn-tint: rgba(245, 158, 11, 0.14);

  --scrim: rgba(11, 13, 18, 0.42);
  --focus-ring: #007564;
}

[data-theme="dark"] {
  --bg: #0A0E16;
  --surface: #151B26;
  --surface-2: #1C2430;
  --surface-3: #232C3A;
  --border: #232B38;
  --border-strong: #334155;
  --border-input: #5A6980;

  --text: #F1F5F9;
  --text-2: #CBD5E1;
  --text-soft: #94A3B8;
  --muted: #64748B;
  --muted-text: #8593A8;
  --muted-3: #475569;

  --primary: #00A98A;
  --primary-border: #00A98A;
  --accent: #2DD4BF;
  --accent-text: #2DD4BF;
  --on-primary: #04150F;
  --primary-tint: rgba(0, 169, 138, 0.15);
  --accent-tint: rgba(45, 212, 191, 0.12);

  --pos: #34D399;
  --pos-text: #34D399;
  --pos-tint: rgba(52, 211, 153, 0.14);
  --neg: #F87171;
  --neg-text: #F87171;
  --neg-tint: rgba(248, 113, 113, 0.12);
  --warn: #FBBF24;
  --warn-text: #FBBF24;
  --warn-tint: rgba(251, 191, 36, 0.13);

  --scrim: rgba(0, 0, 0, 0.6);
  --focus-ring: #2DD4BF;
}
```

- [ ] **Step 10: Run to verify the audit passes**

Run: `pnpm vitest run src/styles/__tests__/tokens.contrast.test.ts`
Expected: PASS. Every body-text token clears 4.5:1 in both themes; every brand token clears 3:1; `--border-input` clears the 3:1 non-text floor.

- [ ] **Step 11: Document the two-ramp rule**

Append to `src/styles/tokens.css`:

```css
/*
  Two ramps, deliberately.

  --primary / --accent / --pos / --neg / --warn  are brand colours. Use them for
  fills, borders, icons, and text at 24px+ (or 19px+ bold). They are the mockup
  values, unchanged.

  --accent-text / --pos-text / --neg-text / --warn-text / --muted-text  are the
  only colours permitted for text below 24px. In light theme several brand
  values measure under 4.5:1 on white (brand teal is 2.98:1) and would fail
  WCAG AA as body text.

  --border is decorative hairline. Any border that is the sole visual indicator
  of a control boundary (inputs, checkboxes, focus targets) uses --border-input,
  which meets the 3:1 non-text contrast floor. Filled primary buttons carry
  --primary-border for the same reason: a #00A98A fill on a white page is
  2.98:1, under the 3:1 boundary floor.

  --on-primary is near-black in BOTH themes. The mockup used white in light,
  which measures 2.98:1 on the teal fill and fails AA on the product's most
  important call to action. The brand fill is unchanged; only the label flipped.

  Enforced by src/styles/__tests__/tokens.contrast.test.ts.
*/
```

- [ ] **Step 12: Commit**

```bash
git add src/styles src/lib
git commit -m "feat: token layer with enforced WCAG AA contrast floor

Adds --accent-text, --pos-text, --neg-text, --warn-text, --muted-text,
--border-input and --primary-border to correct mockup tokens failing AA.
Flips --on-primary to near-black in light theme: white on the brand teal
measures 2.98:1 and fails AA on the primary CTA. Brand fills unchanged."
```

---

### Task 3: Bridge tokens into Tailwind v4

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/styles/__tests__/tailwind-bridge.test.ts`

**Interfaces:**
- Consumes: token names from Task 2.
- Produces: Tailwind utilities `bg-bg`, `bg-surface`, `text-text`, `text-muted-text`, `text-accent-text`, `border-border`, `border-input` and the rest, each resolving to `var(--token)`. All later components use these utilities and never a hex value.

- [ ] **Step 1: Write the failing bridge test**

Every token in `tokens.css` must be exposed to Tailwind, or a component will be tempted to inline a hex. `src/styles/__tests__/tailwind-bridge.test.ts`:

```ts
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
      (t) => !t.includes('tint') && t !== 'scrim' && t !== 'focus-ring',
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/styles/__tests__/tailwind-bridge.test.ts`
Expected: FAIL — `globals.css` contains only the Tailwind import.

- [ ] **Step 3: Write the bridge**

`src/app/globals.css`:

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@theme {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-border-input: var(--border-input);

  --color-text: var(--text);
  --color-text-2: var(--text-2);
  --color-text-soft: var(--text-soft);
  --color-muted: var(--muted);
  --color-muted-text: var(--muted-text);
  --color-muted-3: var(--muted-3);

  --color-primary: var(--primary);
  --color-primary-border: var(--primary-border);
  --color-accent: var(--accent);
  --color-accent-text: var(--accent-text);
  --color-on-primary: var(--on-primary);

  --color-pos: var(--pos);
  --color-pos-text: var(--pos-text);
  --color-neg: var(--neg);
  --color-neg-text: var(--neg-text);
  --color-warn: var(--warn);
  --color-warn-text: var(--warn-text);
}

html {
  background: var(--bg);
  color: var(--text);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/styles/__tests__/tailwind-bridge.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Verify the build compiles Tailwind**

Run: `pnpm build`
Expected: succeeds with no CSS errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/styles/__tests__
git commit -m "feat: bridge CSS custom properties into Tailwind v4 @theme"
```

---

### Task 4: Theme provider with no-flash bootstrap

Three states: explicit `light`, explicit `dark`, and `system` (the default, following `prefers-color-scheme`). The theme must be applied before first paint or the page flashes white on a dark-mode phone — which matters because collectors browse at night, and the spec names dark mode as required rather than optional.

**Files:**
- Create: `src/theme/theme-script.ts`, `src/theme/theme-provider.tsx`, `src/theme/use-theme.ts`
- Modify: `src/app/layout.tsx`
- Test: `src/theme/__tests__/theme-provider.test.tsx`

**Interfaces:**
- Consumes: `[data-theme]` selectors from Task 2.
- Produces: `<ThemeProvider>`; `useTheme(): { theme: Theme; resolved: 'light'|'dark'; setTheme(t: Theme): void }` where `type Theme = 'light' | 'dark' | 'system'`; `themeScript: string` for inline injection. Storybook (Task 9) and every themed component consume `useTheme`.

- [ ] **Step 1: Write the failing provider test**

`src/theme/__tests__/theme-provider.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme-provider';
import { useTheme } from '@/theme/use-theme';

function Probe() {
  const { theme, resolved, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('system')}>system</button>
    </div>
  );
}

function mockSystem(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('dark') ? prefersDark : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockSystem(false);
  });

  it('defaults to system', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('resolves system to dark when the OS prefers dark', () => {
    mockSystem(true);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('writes the resolved theme to the html element', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists an explicit choice and restores it', async () => {
    const { unmount } = render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    unmount();
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('clears persistence when returning to system', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    await userEvent.click(screen.getByRole('button', { name: 'system' }));
    expect(localStorage.getItem('stacket-theme')).toBeNull();
  });

  it('throws a useful error when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/theme`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement the theme script**

`src/theme/theme-script.ts`:

```ts
export const THEME_STORAGE_KEY = 'stacket-theme';

export const themeScript = `(function(){try{
var s=localStorage.getItem('${THEME_STORAGE_KEY}');
var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', s || (d?'dark':'light'));
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
```

- [ ] **Step 4: Implement the provider and hook**

`src/theme/theme-provider.tsx`:

```tsx
'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { THEME_STORAGE_KEY } from './theme-script';

export type Theme = 'light' | 'dark' | 'system';
export type Resolved = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStored(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStored);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolved: Resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

`src/theme/use-theme.ts`:

```ts
'use client';

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './theme-provider';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run src/theme`
Expected: PASS, 6 tests.

- [ ] **Step 6: Wire into the root layout**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/theme/theme-provider';
import { themeScript } from '@/theme/theme-script';
import './globals.css';

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-text">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

Note `min-h-dvh`, never `100vh` — a global constraint.

- [ ] **Step 7: Verify build and full suite**

```bash
pnpm test
pnpm build
```
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/theme src/app/layout.tsx
git commit -m "feat: theme provider with system default and no-flash bootstrap"
```

---

### Task 5: Thai-first typography layer

**Files:**
- Create: `src/styles/typography.css`
- Modify: `src/app/layout.tsx` (fonts), `src/app/globals.css` (import)
- Test: `src/styles/__tests__/typography.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS classes `.text-body`, `.text-label`, `.text-heading`, `.text-numeric`, `.text-truncate-safe`, and the `--font-sans` / `--font-mono` variables. `.text-numeric` is mandatory on every price figure.

- [ ] **Step 1: Write the failing typography test**

The Thai rules are testable as text assertions against the stylesheet, which is what stops them from being quietly dropped in a later refactor. `src/styles/__tests__/typography.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/styles/__tests__/typography.test.ts`
Expected: FAIL — `typography.css` does not exist.

- [ ] **Step 3: Write the typography layer**

`src/styles/typography.css`:

```css
:root {
  --font-sans: var(--font-anuphan), system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;
}

html {
  font-family: var(--font-sans);
  /* Thai has no inter-word spaces; strict line-breaking prevents nonsense breaks. */
  word-break: normal;
  line-break: strict;
}

.text-body {
  font-size: 16px;
  font-weight: 400;
  /* Thai stacks vowels and tone marks above and below the baseline.
     1.5 clips them; 1.7 is the floor, not a preference. */
  line-height: 1.7;
}

.text-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.7;
}

.text-heading {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .text-heading { font-size: 26px; }
}

.text-numeric {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/*
  Thai must never be truncated mid-string — a cut phrase can read as a
  different word. Clamp by line instead, which always breaks at a
  line-break opportunity the shaper chose.
*/
.text-truncate-safe {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-safe-1 { -webkit-line-clamp: 1; }
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/styles/__tests__/typography.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Load the fonts and import the layer**

Add the import to `src/app/globals.css`, directly after the tokens import:

```css
@import "../styles/typography.css";
```

Update `src/app/layout.tsx` to load both families as CSS variables:

```tsx
import type { Metadata } from 'next';
import { Anuphan, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/theme/theme-provider';
import { themeScript } from '@/theme/theme-script';
import './globals.css';

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-anuphan',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'stacket',
  description: 'ตลาดซื้อขายการ์ดสะสมสำหรับนักสะสมในประเทศไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${anuphan.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-text text-body">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `pnpm build`
Expected: succeeds, fonts resolve.

- [ ] **Step 7: Commit**

```bash
git add src/styles/typography.css src/styles/__tests__/typography.test.ts src/app
git commit -m "feat: Thai-first typography layer with 1.7 line-height floor and safe truncation"
```

---

### Task 6: Motion layer with reduced-motion support

**Files:**
- Create: `src/styles/motion.css`
- Modify: `src/app/globals.css`
- Test: `src/styles/__tests__/motion.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `--duration-enter`, `--duration-exit`, `--ease-enter`, `--ease-exit`, and classes `.motion-enter` / `.motion-exit`. Overlay (Task 8) and Toast (Task 10) consume these.

- [ ] **Step 1: Write the failing motion test**

`src/styles/__tests__/motion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../motion.css'), 'utf8');

function ms(name: string): number {
  const match = css.match(new RegExp(`--${name}:\\s*(\\d+)ms`));
  expect(match, `--${name} not defined`).not.toBeNull();
  return Number(match![1]);
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

  it('animates only transform and opacity', () => {
    const properties = [...css.matchAll(/transition-property:\s*([^;]+);/g)]
      .map((m) => m[1]);
    expect(properties.length).toBeGreaterThan(0);
    for (const list of properties) {
      for (const property of list.split(',').map((p) => p.trim())) {
        expect(['transform', 'opacity']).toContain(property);
      }
    }
  });

  it('disables motion under prefers-reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/styles/__tests__/motion.test.ts`
Expected: FAIL — `motion.css` does not exist.

- [ ] **Step 3: Write the motion layer**

`src/styles/motion.css`:

```css
:root {
  --duration-enter: 200ms;
  --duration-exit: 130ms;
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}

.motion-enter {
  transition-property: transform, opacity;
  transition-duration: var(--duration-enter);
  transition-timing-function: var(--ease-enter);
}

.motion-exit {
  transition-property: transform, opacity;
  transition-duration: var(--duration-exit);
  transition-timing-function: var(--ease-exit);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/styles/__tests__/motion.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Import into globals**

Add to `src/app/globals.css` after the typography import:

```css
@import "../styles/motion.css";
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/motion.css src/styles/__tests__/motion.test.ts src/app/globals.css
git commit -m "feat: motion tokens with reduced-motion support"
```

---

### Task 7: Focus ring and touch target utilities

**Files:**
- Create: `src/styles/interaction.css`
- Modify: `src/app/globals.css`
- Test: `src/styles/__tests__/interaction.test.ts`

**Interfaces:**
- Consumes: `--focus-ring` from Task 2.
- Produces: a global `:focus-visible` ring and the `.tap-target` class. Every interactive component in the follow-on plan applies `.tap-target`.

- [ ] **Step 1: Write the failing interaction test**

`src/styles/__tests__/interaction.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/styles/__tests__/interaction.test.ts`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Write the interaction layer**

`src/styles/interaction.css`:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 4px;
}

.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/styles/__tests__/interaction.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Import into globals**

Add to `src/app/globals.css`:

```css
@import "../styles/interaction.css";
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/interaction.css src/styles/__tests__/interaction.test.ts src/app/globals.css
git commit -m "feat: focus-visible ring and 44px tap target utilities"
```

---

### Task 8: FocusScope and Overlay primitives

Sheets, dialogs and permission modals all need the same three behaviours: trap focus while open, restore focus to the trigger on close, and close on Escape. Building it once here is what makes the ~6 overlay-based components in the follow-on plan correct by construction.

**Files:**
- Create: `src/primitives/visually-hidden.tsx`, `src/primitives/focus-scope.tsx`, `src/primitives/overlay.tsx`
- Test: `src/primitives/__tests__/focus-scope.test.tsx`, `src/primitives/__tests__/overlay.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1), motion classes (Task 6), `--scrim` (Task 2).
- Produces:
  - `<VisuallyHidden>{children}</VisuallyHidden>`
  - `<FocusScope active: boolean; onEscape?: () => void; children: React.ReactNode>`
  - `<Overlay open: boolean; onClose: () => void; labelledBy: string; children: React.ReactNode>` — renders `role="dialog" aria-modal="true"` into a portal.

- [ ] **Step 1: Write the failing FocusScope test**

`src/primitives/__tests__/focus-scope.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusScope } from '@/primitives/focus-scope';

function Fixture({ onEscape }: { onEscape?: () => void }) {
  return (
    <div>
      <button>outside</button>
      <FocusScope active onEscape={onEscape}>
        <button>first</button>
        <button>second</button>
      </FocusScope>
    </div>
  );
}

describe('FocusScope', () => {
  it('moves focus to the first focusable child on activation', () => {
    render(<Fixture />);
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus forward from the last child to the first', async () => {
    render(<Fixture />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'second' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps focus backward from the first child to the last', async () => {
    render(<Fixture />);
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'second' })).toHaveFocus();
  });

  it('calls onEscape when Escape is pressed', async () => {
    const onEscape = vi.fn();
    render(<Fixture onEscape={onEscape} />);
    await userEvent.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it('restores focus to the previously focused element on unmount', async () => {
    function Toggle() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>trigger</button>
          {open && (
            <FocusScope active onEscape={() => setOpen(false)}>
              <button>inside</button>
            </FocusScope>
          )}
        </div>
      );
    }
    render(<Toggle />);
    const trigger = screen.getByRole('button', { name: 'trigger' });
    await userEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/primitives/__tests__/focus-scope.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement VisuallyHidden and FocusScope**

`src/primitives/visually-hidden.tsx`:

```tsx
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  );
}
```

`src/primitives/focus-scope.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface FocusScopeProps {
  active: boolean;
  onEscape?: () => void;
  children: React.ReactNode;
}

export function FocusScope({ active, onEscape, children }: FocusScopeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previous.current = document.activeElement as HTMLElement | null;
    const nodes = ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    nodes?.[0]?.focus();
    return () => previous.current?.focus();
  }, [active]);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const focused = document.activeElement;

      if (event.shiftKey && focused === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && focused === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [active, onEscape]);

  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/primitives/__tests__/focus-scope.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing Overlay test**

`src/primitives/__tests__/overlay.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Overlay } from '@/primitives/overlay';

function Fixture({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="title">
      <h2 id="title">ยืนยันตัวตน</h2>
      <button>ตกลง</button>
    </Overlay>
  );
}

describe('Overlay', () => {
  it('renders nothing when closed', () => {
    render(<Fixture open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('exposes a modal dialog labelled by its heading', () => {
    render(<Fixture open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'title');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the scrim is clicked', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.click(screen.getByTestId('overlay-scrim'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when the panel itself is clicked', async () => {
    const onClose = vi.fn();
    render(<Fixture open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'ตกลง' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Fixture open onClose={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/primitives/__tests__/overlay.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement Overlay**

`src/primitives/overlay.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusScope } from './focus-scope';

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}

export function Overlay({ open, onClose, labelledBy, children }: OverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        data-testid="overlay-scrim"
        onClick={onClose}
        className="motion-enter absolute inset-0"
        style={{ background: 'var(--scrim)' }}
      />
      <FocusScope active onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className="motion-enter relative z-10 w-full max-w-[480px] rounded-t-2xl bg-bg p-6 sm:rounded-2xl"
        >
          {children}
        </div>
      </FocusScope>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/primitives/__tests__/overlay.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 9: Commit**

```bash
git add src/primitives
git commit -m "feat: FocusScope and Overlay primitives with focus trap, restore and Escape"
```

---

### Task 9: The four-state contract

Every data component must satisfy loading / empty / error / offline. Encoding it as a typed component means "a component without them is not done" is enforced by the type system rather than by review.

**Files:**
- Create: `src/primitives/skeleton.tsx`, `src/primitives/data-boundary.tsx`
- Test: `src/primitives/__tests__/data-boundary.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1).
- Produces:
  - `<Skeleton width?: string; height?: string; className?: string />`
  - `type DataState<T> = { status: 'loading' } | { status: 'empty' } | { status: 'error'; message: string; retry: () => void } | { status: 'offline' } | { status: 'ready'; data: T }`
  - `<DataBoundary<T> state: DataState<T>; skeleton: React.ReactNode; empty: React.ReactNode; offlineMessage?: string; children: (data: T) => React.ReactNode />`

- [ ] **Step 1: Write the failing test**

`src/primitives/__tests__/data-boundary.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataBoundary, type DataState } from '@/primitives/data-boundary';

function Fixture({ state }: { state: DataState<string[]> }) {
  return (
    <DataBoundary
      state={state}
      skeleton={<div data-testid="skeleton" />}
      empty={<div>ยังไม่มีการ์ดในพอร์ต</div>}
    >
      {(data) => <ul>{data.map((d) => <li key={d}>{d}</li>)}</ul>}
    </DataBoundary>
  );
}

describe('DataBoundary', () => {
  it('renders the caller-supplied skeleton while loading', () => {
    render(<Fixture state={{ status: 'loading' }} />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('announces loading to assistive technology', () => {
    render(<Fixture state={{ status: 'loading' }} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the caller-supplied empty state', () => {
    render(<Fixture state={{ status: 'empty' }} />);
    expect(screen.getByText('ยังไม่มีการ์ดในพอร์ต')).toBeInTheDocument();
  });

  it('renders the error cause and a working retry', async () => {
    const retry = vi.fn();
    render(<Fixture state={{ status: 'error', message: 'เชื่อมต่อไม่สำเร็จ', retry }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('เชื่อมต่อไม่สำเร็จ');
    await userEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('explains the offline state rather than failing silently', () => {
    render(<Fixture state={{ status: 'offline' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('ออฟไลน์');
  });

  it('renders children when ready', () => {
    render(<Fixture state={{ status: 'ready', data: ['Charizard'] }} />);
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/primitives/__tests__/data-boundary.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Skeleton and DataBoundary**

`src/primitives/skeleton.tsx`:

```tsx
import { cn } from '@/lib/cn';

export function Skeleton({
  width = '100%',
  height = '1rem',
  className,
}: { width?: string; height?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-surface-2', className)}
      style={{ width, height }}
    />
  );
}
```

`src/primitives/data-boundary.tsx`:

```tsx
export type DataState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'offline' }
  | { status: 'ready'; data: T };

export interface DataBoundaryProps<T> {
  state: DataState<T>;
  skeleton: React.ReactNode;
  empty: React.ReactNode;
  offlineMessage?: string;
  children: (data: T) => React.ReactNode;
}

export function DataBoundary<T>({
  state,
  skeleton,
  empty,
  offlineMessage = 'ออฟไลน์ — ข้อมูลที่บันทึกไว้ยังอ่านได้ แต่ทำรายการไม่ได้ตอนนี้',
  children,
}: DataBoundaryProps<T>) {
  if (state.status === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-live="polite">
        {skeleton}
      </div>
    );
  }

  if (state.status === 'empty') return <>{empty}</>;

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-body text-text-2">{state.message}</p>
        <button
          onClick={state.retry}
          className="tap-target rounded-lg bg-primary px-4 text-label text-on-primary"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (state.status === 'offline') {
    return (
      <div role="status" aria-live="polite" className="text-body text-muted-text">
        {offlineMessage}
      </div>
    );
  }

  return <>{children(state.data)}</>;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/primitives/__tests__/data-boundary.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/primitives/skeleton.tsx src/primitives/data-boundary.tsx src/primitives/__tests__/data-boundary.test.tsx
git commit -m "feat: four-state contract as a typed DataBoundary primitive"
```

---

### Task 10: Toast system

**Files:**
- Create: `src/primitives/toast.tsx`
- Test: `src/primitives/__tests__/toast.test.tsx`

**Interfaces:**
- Consumes: motion classes (Task 6).
- Produces: `<ToastProvider>`; `useToast(): { showToast: (message: string) => void }`. Matches the mockups' 2.6s auto-dismiss, bottom-centre on mobile and bottom-right on desktop.

- [ ] **Step 1: Write the failing test**

`src/primitives/__tests__/toast.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/primitives/toast';

function Fixture() {
  const { showToast } = useToast();
  return <button onClick={() => showToast('ยอมรับข้อเสนอแล้ว')}>fire</button>;
}

function renderWithProvider() {
  return render(<ToastProvider><Fixture /></ToastProvider>);
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('shows a message when fired', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'fire' }));
    expect(screen.getByText('ยอมรับข้อเสนอแล้ว')).toBeInTheDocument();
  });

  it('uses a polite live region so it never steals focus', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    const trigger = screen.getByRole('button', { name: 'fire' });
    await user.click(trigger);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(trigger).toHaveFocus();
  });

  it('auto-dismisses after 2.6 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider();
    await user.click(screen.getByRole('button', { name: 'fire' }));
    act(() => { vi.advanceTimersByTime(2500); });
    expect(screen.queryByText('ยอมรับข้อเสนอแล้ว')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText('ยอมรับข้อเสนอแล้ว')).toBeNull();
  });

  it('throws when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Fixture />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/primitives/__tests__/toast.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the toast system**

`src/primitives/toast.tsx`:

```tsx
'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const TOAST_DURATION_MS = 2600;

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"
      >
        {message && (
          <div className="motion-enter rounded-lg bg-surface-3 px-4 py-3 text-label text-text">
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/primitives/__tests__/toast.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add the money-event rule as a code comment**

Append to `src/primitives/toast.tsx`:

```tsx
/*
  A toast is never the only record of a money event. Escrow state transitions
  render a persistent state on screen; the toast is an additional signal, never
  the sole one. See spec 2026-08-17-stacket-v1-design.md §5.5.
*/
```

- [ ] **Step 6: Commit**

```bash
git add src/primitives/toast.tsx src/primitives/__tests__/toast.test.tsx
git commit -m "feat: toast system with 2.6s auto-dismiss and polite live region"
```

---

### Task 11: Storybook with theme and viewport toolbars

The deliverable named by the spec is "Storybook with every component in both themes at 375 / 768 / 1440." This task builds the harness; the follow-on plan fills it.

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`
- Create: `src/primitives/data-boundary.stories.tsx`
- Modify: `package.json` (devDependencies)

**Interfaces:**
- Consumes: `ThemeProvider` (Task 4), `ToastProvider` (Task 10), `DataBoundary` (Task 9), `globals.css` (Task 3).
- Produces: a running Storybook with a theme switcher and the three required viewports. Every component story in the follow-on plan is authored against this preview.

- [ ] **Step 1: Add Storybook dependencies**

```bash
pnpm add -D storybook@^8.4.0 @storybook/nextjs@^8.4.0 @storybook/react@^8.4.0 @storybook/addon-essentials@^8.4.0 @storybook/addon-a11y@^8.4.0
```

- [ ] **Step 2: Create Storybook config**

`.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs', options: {} },
};

export default config;
```

- [ ] **Step 3: Create the preview with theme and viewport toolbars**

`.storybook/preview.tsx`:

```tsx
import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
import { ThemeProvider } from '../src/theme/theme-provider';
import { ToastProvider } from '../src/primitives/toast';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' } },
      },
      defaultViewport: 'mobile',
    },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  globalTypes: {
    theme: {
      description: 'Colour theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as 'light' | 'dark';
      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
      return (
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-dvh bg-bg p-4 text-body text-text">
              <Story />
            </div>
          </ToastProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
```

- [ ] **Step 4: Write a reference story proving all four states render**

`src/primitives/data-boundary.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DataBoundary } from './data-boundary';
import { Skeleton } from './skeleton';

const meta: Meta<typeof DataBoundary<string[]>> = {
  title: 'Primitives/DataBoundary',
  component: DataBoundary,
};

export default meta;
type Story = StoryObj<typeof DataBoundary<string[]>>;

const shared = {
  skeleton: <Skeleton height="3rem" />,
  empty: <p>ยังไม่มีการ์ดในพอร์ต — เพิ่มใบแรกของคุณ</p>,
  children: (data: string[]) => <ul>{data.map((d) => <li key={d}>{d}</li>)}</ul>,
};

export const Loading: Story = { args: { ...shared, state: { status: 'loading' } } };
export const Empty: Story = { args: { ...shared, state: { status: 'empty' } } };
export const Error: Story = {
  args: {
    ...shared,
    state: { status: 'error', message: 'เชื่อมต่อไม่สำเร็จ', retry: () => {} },
  },
};
export const Offline: Story = { args: { ...shared, state: { status: 'offline' } } };
export const Ready: Story = {
  args: { ...shared, state: { status: 'ready', data: ['Charizard VMAX', 'Umbreon VMAX'] } },
};
```

- [ ] **Step 5: Verify Storybook builds and renders**

```bash
pnpm build-storybook
```
Expected: builds without error. Then run `pnpm storybook`, open http://localhost:6006, and confirm by inspection: the theme toolbar switches all five DataBoundary stories between light and dark, and the viewport toolbar offers 375 / 768 / 1440.

- [ ] **Step 6: Commit**

```bash
git add .storybook src/primitives/data-boundary.stories.tsx package.json pnpm-lock.yaml
git commit -m "feat: Storybook harness with theme and 375/768/1440 viewport toolbars"
```

---

### Task 12: CI gate

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `src/app/__tests__/layout.test.tsx`

**Interfaces:**
- Consumes: every script from Task 1.
- Produces: a CI run that fails on lint, type, test, contrast, or build regressions.

- [ ] **Step 1: Write a failing guard test for the global constraints**

This catches the two constraints most likely to be violated silently in later work. `src/app/__tests__/layout.test.tsx`:

```ts
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
```

- [ ] **Step 2: Run to verify it passes**

Run: `pnpm vitest run src/app/__tests__/layout.test.tsx`
Expected: PASS, 3 tests. (This one is green on arrival — the layout already satisfies it from Task 5. It exists to keep it that way.)

- [ ] **Step 3: Create the CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm test
      - run: pnpm build
      - run: pnpm build-storybook
```

- [ ] **Step 4: Run the full gate locally**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm build-storybook
```
Expected: all five succeed. The full Vitest suite should report roughly 45 passing tests across 10 files.

- [ ] **Step 5: Commit**

```bash
git add .github src/app/__tests__
git commit -m "ci: gate on lint, types, tests, build and storybook"
```

---

## Definition of done

M0 Foundation is complete when all of the following hold:

- [ ] `pnpm test` passes, including the token contrast audit in both themes
- [ ] `pnpm build` and `pnpm build-storybook` both succeed
- [ ] Storybook renders the DataBoundary stories in light and dark at 375 / 768 / 1440
- [ ] No hex value appears anywhere outside `src/styles/tokens.css`
- [ ] Escape closes an Overlay and focus returns to the element that opened it
- [ ] The page does not flash the wrong theme on load with the OS set to dark

## What this plan deliberately excludes

- **The ~25 component ports** (§5.6). They follow in `2026-08-18-m0-components.md`, written once these primitive APIs exist and are stable.
- **The strategy-critical components** — `PriceProvenance`, `VerificationBadge`, `PhotoTierBadge`, `ConditionSelector`, `ReputationSummary` (§7). These are new design work, not ports, and belong with the component plan.
- **The 200% text-scale and Thai-at-longest-length checks** (§5.2, §5.3). They need real components with real Thai copy to be meaningful; they become acceptance criteria in the component plan.
- **Four §5.3 accessibility items that have no surface to attach to yet** — colour never being the sole signal, the data-table equivalent for every chart, form errors below the field with `role="alert"`, Thai `aria-label` on icon-only buttons, and sequential heading hierarchy. Each is a per-component obligation. The component plan carries them as a checklist every component must satisfy before its story is accepted; the axe run configured in Task 11 catches a subset automatically.
- **Anything from M1 onward** — no database, no search, no product screens.
