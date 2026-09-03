# M0 Components: Primitives — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the ~17 reusable layout, navigation, overlay, and form primitives from the stacket mockups (spec §5.6) onto the M0 Foundation layer, so the follow-on commerce-critical plan (`PriceProvenance`, `PriceChart`, `ConditionSelector`, `VerificationBadge`, `PhotoTierBadge`, `ReputationSummary`, checkout/deal flow) and eventual product screens have a complete, tested component layer to compose from.

**Architecture:** Every component composes M0's existing primitives — `Overlay`/`FocusScope` for anything that opens, `DataBoundary`/`Skeleton` for anything that loads, tokens/typography/motion for everything — rather than reinventing them. `BottomSheet` and `Dialog` are two names for the *same* underlying `Overlay` (it already renders bottom-sheet-on-mobile / centered-dialog-on-desktop via `items-end sm:items-center` + `rounded-t-2xl sm:rounded-2xl`); this plan adds the chrome (title, close button, drag handle) on top, not a second overlay mechanism. Every component ships a Storybook story per the spec's M0 deliverable ("Storybook with every component in both themes at 375/768/1440").

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Vitest + React Testing Library + jsdom, vitest-axe, Storybook 8, pnpm — same as M0 Foundation, built directly on top of it.

**Spec:** `docs/superpowers/specs/2026-08-17-stacket-v1-design.md` §5.6 (component inventory), with the mockup files as pixel source of truth: `TCGround Mobile.dc.html` (402×874 phone reference), `TCGround Web.dc.html` (768–1440px fluid reference), `TCGround Handoff.dc.html` (design tokens, screen inventory, interaction patterns — read this first, it's short). All three live inside `TCGround responsive webapp mockups.zip` at the repo root; unzip it locally to inspect exact values a task doesn't spell out — the Handoff doc says outright "inspect them directly for exact values," and this plan follows that same rule for anything not already given as a literal Thai string or measurement below.

## Global Constraints

Carried forward from M0 Foundation (still binding on every task here) — copied verbatim:

- **No raw hex in components, anywhere.** Colour is referenced through tokens only. (§5.1) — enforced repo-wide by `src/__tests__/no-raw-hex.test.ts`.
- **Product name is `stacket`**, lowercase, in all copy and metadata.
- **Thai is the default language**, English is the fallback. All copy is written in Thai first.
- **Line-height minimum 1.7 for Thai body text.** Use the `.text-body` class; never override line-height locally.
- **`word-break: normal` with `line-break: strict`. Never `overflow-wrap: break-word`.**
- **Never truncate Thai mid-string** without an expand affordance — use `.text-truncate-safe` (line-clamp), never `text-overflow: ellipsis`.
- **`font-variant-numeric: tabular-nums` on every price figure.** Use the `.text-numeric` class on every rendered price (฿ amounts) and every countdown/timer figure.
- **Contrast 4.5:1 body, 3:1 large**, already enforced by the token layer — use token classes (`text-text`, `text-muted-text`, `bg-surface`, etc.), never inline colour.
- **Visible 3–4px focus rings; focus never removed.** Comes free from `src/styles/interaction.css`'s global `:focus-visible` rule — never add `outline-none` to an interactive element.
- **Touch targets ≥ 44×44px, ≥ 8px apart.** Apply `.tap-target` to every tappable icon-only control.
- **Colour is never the sole signal.** Every status pill / delta / badge in this plan pairs colour with an icon or text label — tasks below specify both.
- **`prefers-reduced-motion` respected throughout** — comes free from `.motion-enter`/`.motion-exit`; never add a custom CSS transition/animation outside those classes without also gating it behind the existing reduced-motion media query.
- **Toasts: 2.6s auto-dismiss, never steal focus** — already built (`src/primitives/toast.tsx`); call `useToast().showToast(thaiMessage)`, never build a second notification mechanism.
- **`min-h-dvh`, never `100vh`. No horizontal scroll at any width.**
- **Breakpoints for review: 375 / 768 / 1440** — every Storybook story is authored against the M0 Storybook harness's three named viewports.

New constraints specific to this plan:

- **Every component gets a Storybook story** covering its states named in that task, using the theme/viewport toolbars already wired up in M0 Task 11 — no exceptions, since the M0 spec deliverable is explicitly "every component in both themes at 375/768/1440."
- **Money and deal-state indicators carry a lock icon when funds are held in escrow** — the mockups show `🔒 เงินถูกเก็บไว้อย่างปลอดภัย ฿N` on every in-flight deal row; this is a trust signal, not decoration, and every task touching deal/escrow state must include it.
- **Relative-time and countdown strings are supplied by the caller, not computed inside presentational components** — components take a pre-formatted string prop (e.g. `updatedLabel: string`) rather than a `Date`, keeping these components pure and testable without faking the clock. Time-formatting logic is out of this plan's scope.

---

## File Structure

```
src/styles/tokens.css                        + 5 decorative tokens (Task 1)
src/app/globals.css                           + 5 @theme bridges (Task 1)

src/components/nav/app-shell.tsx              bottom tab bar / topbar / drawer / sidebar (Task 2)
src/components/nav/switch.tsx                 toggle switch (used by the drawer's settings rows) (Task 2)
src/components/nav/tabs.tsx                   generic segmented tab control (Task 3)

src/components/forms/search-field.tsx         (Task 4)
src/components/forms/filter-sheet.tsx         mobile filter sheet (Task 5)
src/components/forms/filter-rail.tsx          desktop persistent filter sidebar (Task 5)
src/components/forms/filter-chip.tsx          removable filter pill (Task 5)
src/components/forms/amount-stepper.tsx       (Task 11)
src/components/forms/otp-input.tsx            (Task 16)
src/components/forms/keypad.tsx               (Task 16)
src/components/forms/carrier-picker.tsx       (Task 17)

src/components/cards/card-tile.tsx            grid tile, browse pages (Task 6)
src/components/cards/card-row.tsx             list row, search/listing results (Task 6)
src/components/cards/density-toggle.tsx       list/grid view switch (Task 7)
src/components/cards/set-banner.tsx           (Task 8)
src/components/cards/stat-cards.tsx           (Task 8)
src/components/cards/listing-row.tsx          (Task 9)
src/components/cards/deal-row.tsx             (Task 9)

src/components/progress/stepper.tsx           horizontal step progress (Task 10)
src/components/progress/timeline.tsx          vertical deal-status timeline (Task 10)

src/components/overlays/bottom-sheet.tsx      (Task 12)
src/components/overlays/dialog.tsx            (Task 12)
src/components/overlays/permission-modal.tsx  (Task 13)
src/components/overlays/offline-banner.tsx    (Task 14)

src/components/skeletons/skeleton-row.tsx     (Task 15)
src/components/skeletons/skeleton-card.tsx    (Task 15)
src/components/skeletons/skeleton-stat-row.tsx (Task 15)
```

**Boundary rationale.** `src/components/` is new in this plan — M0's `src/primitives/` stays reserved for the cross-cutting behavioural primitives every component composes (`Overlay`, `FocusScope`, `DataBoundary`, `Skeleton`, `Toast`, `VisuallyHidden`); `src/components/` holds the product-shaped pieces built *from* those primitives, organised by the domain they serve (`nav/`, `forms/`, `cards/`, `progress/`, `overlays/`, `skeletons/`) rather than by technical layer, so a reviewer working on "everything filter-related" finds it in one directory.

---

### Task 1: Token layer extension for component needs

The mockups use five colour tokens the M0 token layer doesn't have yet, all decorative (never used for text, so none need a contrast-audit entry — same treatment as `--scrim`): a drop shadow for slide-out surfaces, a toggle-switch knob colour, a neutral hover/press tint, and two "veil" gradients for text-over-image legibility on hero banners.

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/__tests__/tailwind-bridge.test.ts` (only the exclusion filter — no new bridge entries)

**Interfaces:**
- Consumes: nothing new.
- Produces: `--drawer-shadow`, `--knob`, `--neutral-tint`, `--veil-strong`, `--veil-soft` as CSS custom properties in `tokens.css`, consumed directly via `var(--token-name)` in component `style` props — none of the five get a Tailwind `@theme` bridge (same treatment as `--scrim`/`--focus-ring`). Task 2 uses `--drawer-shadow` as `boxShadow: '-8px 0 24px var(--drawer-shadow)'` and `--knob` as `background: var(--knob)` on the `Switch` thumb.

- [ ] **Step 1: Write the failing bridge-completeness test**

The existing `tailwind-bridge.test.ts` already asserts every non-tint/scrim/focus-ring token is bridged — it will fail automatically once Step 2 adds tokens without Step 3 bridging them. Confirm this by running the suite after Step 2 alone, before Step 3:

Run: `pnpm vitest run src/styles/__tests__/tailwind-bridge.test.ts`
Expected (after Step 2, before Step 3): FAIL — `--color-knob not bridged` (and the other three colour tokens).

- [ ] **Step 2: Add the five tokens to `tokens.css`**

Append to both the light and dark blocks in `src/styles/tokens.css`, immediately before each block's closing `}`:

Light block, add:
```css
  --drawer-shadow: rgba(11, 13, 18, 0.16);
  --knob: #FFFFFF;
  --neutral-tint: rgba(11, 13, 18, 0.06);
  --veil-strong: rgba(255, 255, 255, 0.96);
  --veil-soft: rgba(255, 255, 255, 0.05);
```

Dark block, add:
```css
  --drawer-shadow: rgba(0, 0, 0, 0.4);
  --knob: #F1F5F9;
  --neutral-tint: rgba(148, 163, 184, 0.15);
  --veil-strong: rgba(10, 14, 22, 0.97);
  --veil-soft: rgba(10, 14, 22, 0.06);
```

These are the exact values from `TCGround Mobile.dc.html`'s root token block (light: `--drawer-shadow:rgba(11,13,18,.16)`, `--knob:#FFFFFF`, `--neutral-tint:rgba(11,13,18,.06)`, `--veil-strong:rgba(255,255,255,.96)`, `--veil-soft:rgba(255,255,255,.05)`; dark: `--drawer-shadow:rgba(0,0,0,.4)`, `--knob:#F1F5F9`, `--neutral-tint:rgba(148,163,184,.15)`, `--veil-strong:rgba(10,14,22,.97)`, `--veil-soft:rgba(10,14,22,.06)`).

- [ ] **Step 3: Run to verify the bridge test fails as predicted**

Run: `pnpm vitest run src/styles/__tests__/tailwind-bridge.test.ts`
Expected: FAIL — the completeness test now reports 4 missing bridges (`knob`, `neutral-tint`, `veil-strong`, `veil-soft`; `neutral-tint` is filtered out by the existing `.includes('tint')` check, so only `knob`/`veil-strong`/`veil-soft` actually show as missing — `drawer-shadow` doesn't match `.includes('tint')` either and will also show as missing).

- [ ] **Step 4: Update the exclusion filter — none of the five new tokens get a `@theme` bridge**

All five new tokens are consumed as raw CSS custom properties inside component `style` props (a shadow value, a switch-knob circle colour, a translucent tint, two gradient veils) — never as a Tailwind `bg-*`/`text-*` utility class. This is exactly the same treatment `--scrim` and `--focus-ring` already get. Don't add any of them to `globals.css`'s `@theme` block.

Instead, widen the exclusion filter in `src/styles/__tests__/tailwind-bridge.test.ts`'s `colourTokens` line from:
```ts
(t) => !t.includes('tint') && t !== 'scrim' && t !== 'focus-ring',
```
to:
```ts
(t) =>
  !t.includes('tint') &&
  t !== 'scrim' &&
  t !== 'focus-ring' &&
  t !== 'drawer-shadow' &&
  t !== 'knob' &&
  t !== 'veil-strong' &&
  t !== 'veil-soft',
```
(`neutral-tint` needs no new entry — it already matches `.includes('tint')`.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run src/styles/__tests__/tailwind-bridge.test.ts`
Expected: PASS, 4 tests. `globals.css`'s `@theme` block is unchanged from Task 1's starting point — only the test file changed.

- [ ] **Step 6: Verify the full suite and build still pass**

```bash
pnpm test
pnpm build
```
Expected: all pass. `src/__tests__/no-raw-hex.test.ts` should still find zero violations (the new tokens are hex/rgba values inside `tokens.css`, the sanctioned exception file).

- [ ] **Step 7: Commit**

```bash
git add src/styles/tokens.css src/styles/__tests__/tailwind-bridge.test.ts
git commit -m "feat: add decorative tokens for drawer shadow, switch knob, and image veils"
```

---

### Task 2: AppShell — bottom tab bar, topbar, nav drawer, desktop sidebar

The single most-used piece of chrome: every screen in the product renders inside this. Mobile uses a persistent bottom tab bar for the five primary destinations plus a topbar (logo, search-adjacent icons, cart badge, avatar, hamburger) that opens a slide-out drawer holding the full nav list plus dev/settings rows (theme toggle, offline simulation — both already wired to real `useTheme`/`navigator.onLine` here, not the mockup's manual toggles). Desktop replaces the bottom tab bar with a persistent left sidebar and keeps the topbar.

**Files:**
- Create: `src/components/nav/switch.tsx`
- Create: `src/components/nav/app-shell.tsx`
- Create: `src/components/nav/__tests__/switch.test.tsx`
- Create: `src/components/nav/__tests__/app-shell.test.tsx`
- Create: `src/components/nav/app-shell.stories.tsx`

**Interfaces:**
- Consumes: `Overlay`/`FocusScope` (`@/primitives/overlay`) for the drawer, `useTheme` (`@/theme/use-theme`) for the theme row, `cn` (`@/lib/cn`).
- Produces:
  - `<Switch checked: boolean; onChange: (next: boolean) => void; label: string />` — the toggle-switch atom, reused by nothing else in this plan but kept as its own tested unit since AppShell's drawer renders two of them.
  - `type NavItem = { key: string; label: string; href: string; icon: React.ReactNode; badge?: number }`
  - `<AppShell navItems: NavItem[]; activeKey: string; cartCount?: number; userInitials?: string; offlineSimulated: boolean; onToggleOfflineSimulated: (next: boolean) => void; children: React.ReactNode />` — renders the full chrome and `children` as the page content area. Every later screen-level component in the follow-on plans renders inside `<AppShell>`.

- [ ] **Step 1: Write the failing Switch test**

`src/components/nav/__tests__/switch.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/nav/switch';

describe('Switch', () => {
  it('renders the label and reflects the checked state via aria-checked', () => {
    render(<Switch checked={false} onChange={vi.fn()} label="โหมดสว่าง" />);
    const el = screen.getByRole('switch', { name: 'โหมดสว่าง' });
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the inverted value on click', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="จำลองสถานะออฟไลน์" />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is a real 44px tap target', () => {
    render(<Switch checked={true} onChange={vi.fn()} label="x" />);
    expect(screen.getByRole('switch')).toHaveClass('tap-target');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/nav/__tests__/switch.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Switch**

`src/components/nav/switch.tsx`:
```tsx
'use client';

import { cn } from '@/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'tap-target relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-surface-3',
      )}
    >
      <span
        aria-hidden="true"
        style={{ background: 'var(--knob)' }}
        className={cn(
          'inline-block h-5 w-5 transform rounded-full transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/nav/__tests__/switch.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing AppShell test**

`src/components/nav/__tests__/app-shell.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme/theme-provider';
import { AppShell, type NavItem } from '@/components/nav/app-shell';

const navItems: NavItem[] = [
  { key: 'search', label: 'ค้นหา', href: '/search', icon: <span data-testid="icon-search" /> },
  { key: 'portfolio', label: 'พอร์ต', href: '/portfolio', icon: <span data-testid="icon-portfolio" /> },
  { key: 'sell', label: 'ลงขาย', href: '/sell', icon: <span data-testid="icon-sell" /> },
  { key: 'deals', label: 'ดีล', href: '/deals', icon: <span data-testid="icon-deals" />, badge: 2 },
  { key: 'account', label: 'บัญชี', href: '/account', icon: <span data-testid="icon-account" /> },
];

function renderShell(props: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return render(
    <ThemeProvider>
      <AppShell
        navItems={navItems}
        activeKey="search"
        offlineSimulated={false}
        onToggleOfflineSimulated={vi.fn()}
        {...props}
      >
        <div>page content</div>
      </AppShell>
    </ThemeProvider>,
  );
}

describe('AppShell', () => {
  it('renders every nav item label and marks the active one', () => {
    renderShell();
    const activeLink = screen.getByRole('link', { name: /ค้นหา/ });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /พอร์ต/ })).not.toHaveAttribute('aria-current');
  });

  it('shows the unread badge count on the deals item', () => {
    renderShell();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders page content', () => {
    renderShell();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('opens the drawer on hamburger click and traps focus inside it', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer on Escape and returns focus to the hamburger button', async () => {
    renderShell();
    const trigger = screen.getByRole('button', { name: 'เปิดเมนู' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('drawer includes a working offline-simulation switch wired to the caller', async () => {
    const onToggleOfflineSimulated = vi.fn();
    renderShell({ onToggleOfflineSimulated });
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    await userEvent.click(screen.getByRole('switch', { name: 'จำลองสถานะออฟไลน์' }));
    expect(onToggleOfflineSimulated).toHaveBeenCalledWith(true);
  });

  it('drawer theme switch reflects and drives the real ThemeProvider', async () => {
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: 'เปิดเมนู' }));
    const themeSwitch = screen.getByRole('switch', { name: 'โหมดสว่าง' });
    expect(themeSwitch).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(themeSwitch);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('cart icon shows the count badge when provided', () => {
    renderShell({ cartCount: 2 });
    expect(screen.getByRole('link', { name: /ตะกร้า.*2/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/nav/__tests__/app-shell.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement AppShell**

`src/components/nav/app-shell.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Overlay } from '@/primitives/overlay';
import { useTheme } from '@/theme/use-theme';
import { Switch } from './switch';
import { cn } from '@/lib/cn';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface AppShellProps {
  navItems: NavItem[];
  activeKey: string;
  cartCount?: number;
  userInitials?: string;
  offlineSimulated: boolean;
  onToggleOfflineSimulated: (next: boolean) => void;
  children: React.ReactNode;
}

const PRIMARY_TAB_KEYS = ['search', 'portfolio', 'sell', 'deals', 'account'];

export function AppShell({
  navItems,
  activeKey,
  cartCount,
  userInitials,
  offlineSimulated,
  onToggleOfflineSimulated,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const primaryTabs = navItems.filter((item) => PRIMARY_TAB_KEYS.includes(item.key));

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-heading">stacket</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/cart"
            aria-label={cartCount ? `ตะกร้า ${cartCount} รายการ` : 'ตะกร้า'}
            className="tap-target relative flex items-center justify-center rounded-full"
          >
            <span aria-hidden="true">🛒</span>
            {cartCount ? (
              <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 text-[11px] text-on-primary text-numeric">
                {cartCount}
              </span>
            ) : null}
          </a>
          {userInitials ? (
            <span className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-label text-text-2">
              {userInitials}
            </span>
          ) : null}
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setDrawerOpen(true)}
            className="tap-target flex items-center justify-center rounded-full"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>

      <div className="flex">
        <nav
          aria-label="เมนูหลัก"
          className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border p-4 sm:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              aria-current={item.key === activeKey ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-label',
                item.key === activeKey ? 'bg-primary-tint text-accent-text' : 'text-text-2',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
        </nav>

        <main className="min-h-dvh flex-1 pb-16 sm:pb-0">{children}</main>
      </div>

      <nav
        aria-label="เมนูหลัก"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-bg sm:hidden"
      >
        {primaryTabs.map((item) => (
          <a
            key={item.key}
            href={item.href}
            aria-current={item.key === activeKey ? 'page' : undefined}
            className={cn(
              'tap-target relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]',
              item.key === activeKey ? 'text-accent-text' : 'text-muted-text',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge ? (
              <span className="absolute top-1 right-1/4 rounded-full bg-pos px-1.5 text-[10px] text-on-primary text-numeric">
                {item.badge}
              </span>
            ) : null}
          </a>
        ))}
      </nav>

      <Overlay open={drawerOpen} onClose={() => setDrawerOpen(false)} labelledBy="app-shell-drawer-title">
        <div style={{ boxShadow: '-8px 0 24px var(--drawer-shadow)' }} className="flex flex-col gap-1">
          <h2 id="app-shell-drawer-title" className="text-heading mb-3">
            stacket
          </h2>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-label text-text"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-label text-text">จำลองสถานะออฟไลน์</span>
              <Switch checked={offlineSimulated} onChange={onToggleOfflineSimulated} label="จำลองสถานะออฟไลน์" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-label text-text">โหมดสว่าง</span>
              <Switch
                checked={theme === 'light'}
                onChange={(next) => setTheme(next ? 'light' : 'dark')}
                label="โหมดสว่าง"
              />
            </div>
          </div>
        </div>
      </Overlay>
    </div>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/nav/__tests__/app-shell.test.tsx`
Expected: PASS, 8 tests.

Note on Step 5's test 6 (theme switch): `useTheme()`'s default is `'system'`, which under the jsdom test environment (no `matchMedia` mock configured in this test, unlike M0's `theme-provider.test.tsx` which explicitly mocks it) resolves to `resolved: 'light'` per `theme-provider.tsx`'s `systemPrefersDark()` fallback (`typeof window === 'undefined' || !window.matchMedia` returns `false`, i.e. not dark, when `matchMedia` is present but real jsdom `matchMedia` may not exist at all — if this test fails because `window.matchMedia` is undefined in jsdom, add `vi.stubGlobal('matchMedia', ...)` in a `beforeEach` the same way `theme-provider.test.tsx` does, mocking `prefersDark: false`, before asserting `aria-checked="false"`). Confirm which case applies by running the test; fix the test setup rather than the component if this surfaces.

- [ ] **Step 9: Write the Storybook story**

`src/components/nav/app-shell.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, type NavItem } from './app-shell';

const navItems: NavItem[] = [
  { key: 'search', label: 'ค้นหา', href: '#', icon: <span>🔍</span> },
  { key: 'portfolio', label: 'พอร์ต', href: '#', icon: <span>💼</span> },
  { key: 'sell', label: 'ลงขาย', href: '#', icon: <span>➕</span> },
  { key: 'deals', label: 'ดีล', href: '#', icon: <span>💬</span>, badge: 2 },
  { key: 'account', label: 'บัญชี', href: '#', icon: <span>👤</span> },
];

const meta: Meta<typeof AppShell> = {
  title: 'Nav/AppShell',
  component: AppShell,
};
export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {
  args: {
    navItems,
    activeKey: 'search',
    cartCount: 2,
    userInitials: 'SZ',
    offlineSimulated: false,
    onToggleOfflineSimulated: () => {},
    children: <div className="p-4">page content</div>,
  },
};
```

- [ ] **Step 10: Run full suite and build**

```bash
pnpm test
pnpm build
```
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add src/components/nav/switch.tsx src/components/nav/app-shell.tsx src/components/nav/__tests__ src/components/nav/app-shell.stories.tsx
git commit -m "feat: AppShell with bottom tab bar, topbar, nav drawer, and desktop sidebar"
```

---

### Task 3: Tabs — generic segmented tab control

Reused across the product: the search results "การ์ด / เซ็ต" toggle, the states-swatch "ว่าง / กำลังโหลด / ผิดพลาด" tabs, and Card Detail's four-tab row ("ภาพรวม / ราคาตามสภาพ / คุณสมบัติ / รายการขาย").

**Files:**
- Create: `src/components/nav/tabs.tsx`
- Create: `src/components/nav/__tests__/tabs.test.tsx`
- Create: `src/components/nav/tabs.stories.tsx`

**Interfaces:**
- Consumes: `cn` (`@/lib/cn`).
- Produces: `type Tab = { key: string; label: string }`; `<Tabs tabs: Tab[]; activeKey: string; onChange: (key: string) => void />`. Later tasks (CardTile browse toggle, states-swatch stories, Card Detail composition in a future plan) render `<Tabs>` directly.

- [ ] **Step 1: Write the failing test**

`src/components/nav/__tests__/tabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/nav/tabs';

const tabs = [
  { key: 'cards', label: 'การ์ด' },
  { key: 'sets', label: 'เซ็ต' },
];

describe('Tabs', () => {
  it('renders each tab as a tab role with the active one marked selected', () => {
    render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'การ์ด' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'เซ็ต' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the clicked tab key', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeKey="cards" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'เซ็ต' }));
    expect(onChange).toHaveBeenCalledWith('sets');
  });

  it('wraps the tabs in a tablist', () => {
    render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { axe } = await import('vitest-axe');
    const { container } = render(<Tabs tabs={tabs} activeKey="cards" onChange={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/nav/__tests__/tabs.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Tabs**

`src/components/nav/tabs.tsx`:
```tsx
'use client';

import { cn } from '@/lib/cn';

export interface Tab {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 rounded-xl bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
          className={cn(
            'tap-target flex-1 rounded-lg px-3 text-label',
            tab.key === activeKey ? 'bg-bg text-text shadow-sm' : 'text-muted-text',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/nav/__tests__/tabs.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Storybook story**

`src/components/nav/tabs.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = { title: 'Nav/Tabs', component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

const tabs = [
  { key: 'overview', label: 'ภาพรวม' },
  { key: 'condition', label: 'ราคาตามสภาพ' },
  { key: 'attributes', label: 'คุณสมบัติ' },
  { key: 'listings', label: 'รายการขาย' },
];

export const CardDetailTabs: Story = {
  render: () => {
    const [active, setActive] = useState('overview');
    return <Tabs tabs={tabs} activeKey={active} onChange={setActive} />;
  },
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/nav/tabs.tsx src/components/nav/__tests__/tabs.test.tsx src/components/nav/tabs.stories.tsx
git commit -m "feat: generic Tabs segmented control"
```

---

### Task 4: SearchField

The search input seen on Home ("ค้นหาการ์ด, เซ็ต, หรือผู้เล่น") and reused identically in the Sell flow's card picker, styled with a focus ring on the whole pill (not just an inner input outline) matching the mockup's green-bordered active state.

**Files:**
- Create: `src/components/forms/search-field.tsx`
- Create: `src/components/forms/__tests__/search-field.test.tsx`
- Create: `src/components/forms/search-field.stories.tsx`

**Interfaces:**
- Consumes: `cn` (`@/lib/cn`).
- Produces: `<SearchField value: string; onChange: (value: string) => void; placeholder: string; onSubmit?: () => void />`.

- [ ] **Step 1: Write the failing test**

`src/components/forms/__tests__/search-field.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from '@/components/forms/search-field';

describe('SearchField', () => {
  it('renders the placeholder and current value', () => {
    render(<SearchField value="Charizard" onChange={vi.fn()} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />);
    expect(screen.getByRole('searchbox')).toHaveValue('Charizard');
    expect(screen.getByPlaceholderText('ค้นหาการ์ด, เซ็ต, หรือผู้เล่น')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const onChange = vi.fn();
    render(<SearchField value="" onChange={onChange} placeholder="p" />);
    await userEvent.type(screen.getByRole('searchbox'), 'C');
    expect(onChange).toHaveBeenCalledWith('C');
  });

  it('shows a clear button only when there is a value, and clearing empties it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchField value="" onChange={onChange} placeholder="p" />);
    expect(screen.queryByRole('button', { name: 'ล้างการค้นหา' })).toBeNull();
    rerender(<SearchField value="Charizard" onChange={onChange} placeholder="p" />);
    await userEvent.click(screen.getByRole('button', { name: 'ล้างการค้นหา' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onSubmit on Enter', async () => {
    const onSubmit = vi.fn();
    render(<SearchField value="Charizard" onChange={vi.fn()} placeholder="p" onSubmit={onSubmit} />);
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/search-field.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement SearchField**

`src/components/forms/search-field.tsx`:
```tsx
'use client';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}

export function SearchField({ value, onChange, placeholder, onSubmit }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 focus-within:border-primary">
      <span aria-hidden="true" className="text-muted-text">
        🔍
      </span>
      <input
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.();
        }}
        className="text-body flex-1 bg-transparent text-text outline-none placeholder:text-muted-text"
      />
      {value ? (
        <button
          type="button"
          aria-label="ล้างการค้นหา"
          onClick={() => onChange('')}
          className="tap-target flex items-center justify-center rounded-full text-muted-text"
        >
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/search-field.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Storybook story**

`src/components/forms/search-field.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchField } from './search-field';

const meta: Meta<typeof SearchField> = { title: 'Forms/SearchField', component: SearchField };
export default meta;
type Story = StoryObj<typeof SearchField>;

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return <SearchField value={value} onChange={setValue} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('Charizard');
    return <SearchField value={value} onChange={setValue} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />;
  },
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/forms/search-field.tsx src/components/forms/__tests__/search-field.test.tsx src/components/forms/search-field.stories.tsx
git commit -m "feat: SearchField with clear button and submit-on-Enter"
```

---

### Task 5: FilterSheet, FilterRail, FilterChip

Mobile puts filters in a bottom sheet (built on `Overlay`); desktop uses a persistent left rail — same filter *content*, different *container*. `FilterChip` is the small removable pill shown above search results ("โปเกมอน ✕", "หายาก ✕").

**Files:**
- Create: `src/components/forms/filter-chip.tsx`
- Create: `src/components/forms/filter-sheet.tsx`
- Create: `src/components/forms/filter-rail.tsx`
- Create: `src/components/forms/__tests__/filter-chip.test.tsx`
- Create: `src/components/forms/__tests__/filter-sheet.test.tsx`
- Create: `src/components/forms/__tests__/filter-rail.test.tsx`
- Create: `src/components/forms/filter.stories.tsx`

**Interfaces:**
- Consumes: `Overlay` (`@/primitives/overlay`), `cn`.
- Produces:
  - `<FilterChip label: string; onRemove: () => void />`
  - `type FilterGroup = { key: string; label: string; children: React.ReactNode }`
  - `<FilterSheet open: boolean; onClose: () => void; groups: FilterGroup[]; onApply: () => void; onReset: () => void />`
  - `<FilterRail groups: FilterGroup[]; onApply: () => void; onReset: () => void />` — same `groups`/`onApply`/`onReset` contract as `FilterSheet` so callers pass one `groups` array to both and pick the container by breakpoint.

- [ ] **Step 1: Write the failing FilterChip test**

`src/components/forms/__tests__/filter-chip.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from '@/components/forms/filter-chip';

describe('FilterChip', () => {
  it('renders the label', () => {
    render(<FilterChip label="โปเกมอน" onRemove={vi.fn()} />);
    expect(screen.getByText('โปเกมอน')).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<FilterChip label="หายาก" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลบตัวกรอง หายาก' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/filter-chip.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement FilterChip**

`src/components/forms/filter-chip.tsx`:
```tsx
export interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1.5 text-label text-accent-text">
      {label}
      <button
        type="button"
        aria-label={`ลบตัวกรอง ${label}`}
        onClick={onRemove}
        className="tap-target -my-2.5 -mr-1 flex h-6 w-6 items-center justify-center rounded-full"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </span>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/filter-chip.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Write the failing FilterSheet test**

`src/components/forms/__tests__/filter-sheet.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSheet } from '@/components/forms/filter-sheet';

const groups = [
  { key: 'game', label: 'เกม', children: <div>game options</div> },
  { key: 'condition', label: 'สภาพ', children: <div>condition options</div> },
];

describe('FilterSheet', () => {
  it('renders nothing when closed', () => {
    render(<FilterSheet open={false} onClose={vi.fn()} groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders every group label and its content when open', () => {
    render(<FilterSheet open onClose={vi.fn()} groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('เกม')).toBeInTheDocument();
    expect(screen.getByText('game options')).toBeInTheDocument();
    expect(screen.getByText('สภาพ')).toBeInTheDocument();
  });

  it('calls onApply and onReset from their buttons', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<FilterSheet open onClose={vi.fn()} groups={groups} onApply={onApply} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'ใช้ตัวกรอง' }));
    expect(onApply).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/filter-sheet.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement FilterSheet**

`src/components/forms/filter-sheet.tsx`:
```tsx
'use client';

import { Overlay } from '@/primitives/overlay';

export interface FilterGroup {
  key: string;
  label: string;
  children: React.ReactNode;
}

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  onApply: () => void;
  onReset: () => void;
}

export function FilterSheet({ open, onClose, groups, onApply, onReset }: FilterSheetProps) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="filter-sheet-title">
      <h2 id="filter-sheet-title" className="text-heading mb-4">
        ตัวกรอง
      </h2>
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-label mb-2 text-text-2">{group.label}</h3>
            {group.children}
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="tap-target flex-1 rounded-full border border-border-input px-4 text-label text-text"
        >
          ล้างทั้งหมด
        </button>
        <button
          type="button"
          onClick={onApply}
          className="tap-target flex-1 rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          ใช้ตัวกรอง
        </button>
      </div>
    </Overlay>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/filter-sheet.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 9: Write the failing FilterRail test**

`src/components/forms/__tests__/filter-rail.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterRail } from '@/components/forms/filter-rail';

const groups = [{ key: 'game', label: 'เกม', children: <div>game options</div> }];

describe('FilterRail', () => {
  it('renders every group label and content (no open/close state — always visible)', () => {
    render(<FilterRail groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('เกม')).toBeInTheDocument();
    expect(screen.getByText('game options')).toBeInTheDocument();
  });

  it('calls onApply and onReset', async () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<FilterRail groups={groups} onApply={onApply} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'ใช้ตัวกรอง' }));
    expect(onApply).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('renders as a labelled complementary region, not a dialog', () => {
    render(<FilterRail groups={groups} onApply={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole('complementary', { name: 'ตัวกรอง' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

- [ ] **Step 10: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/filter-rail.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 11: Implement FilterRail**

`src/components/forms/filter-rail.tsx`:
```tsx
import type { FilterGroup } from './filter-sheet';

export interface FilterRailProps {
  groups: FilterGroup[];
  onApply: () => void;
  onReset: () => void;
}

export function FilterRail({ groups, onApply, onReset }: FilterRailProps) {
  return (
    <aside aria-label="ตัวกรอง" className="sticky top-4 flex w-64 shrink-0 flex-col gap-5 p-4">
      <h2 className="text-heading">ตัวกรอง</h2>
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="text-label mb-2 text-text-2">{group.label}</h3>
          {group.children}
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReset}
          className="tap-target flex-1 rounded-full border border-border-input px-4 text-label text-text"
        >
          ล้างทั้งหมด
        </button>
        <button
          type="button"
          onClick={onApply}
          className="tap-target flex-1 rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          ใช้ตัวกรอง
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 12: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/filter-rail.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 13: Storybook story covering both containers plus the chip**

`src/components/forms/filter.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FilterChip } from './filter-chip';
import { FilterSheet } from './filter-sheet';
import { FilterRail } from './filter-rail';

const groups = [
  { key: 'game', label: 'เกม', children: <div className="text-body text-text-2">Pokémon, One Piece, Yu-Gi-Oh!</div> },
  { key: 'condition', label: 'สภาพ', children: <div className="text-body text-text-2">NM, LP, MP, HP, DMG</div> },
];

const meta: Meta = { title: 'Forms/Filter' };
export default meta;

export const Chip: StoryObj = { render: () => <FilterChip label="โปเกมอน" onRemove={() => {}} /> };
export const Sheet: StoryObj = {
  render: () => <FilterSheet open groups={groups} onClose={() => {}} onApply={() => {}} onReset={() => {}} />,
};
export const Rail: StoryObj = {
  render: () => <FilterRail groups={groups} onApply={() => {}} onReset={() => {}} />,
};
```

- [ ] **Step 14: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/forms/filter-chip.tsx src/components/forms/filter-sheet.tsx src/components/forms/filter-rail.tsx src/components/forms/__tests__/filter-chip.test.tsx src/components/forms/__tests__/filter-sheet.test.tsx src/components/forms/__tests__/filter-rail.test.tsx src/components/forms/filter.stories.tsx
git commit -m "feat: FilterChip, FilterSheet (mobile), and FilterRail (desktop)"
```

---

### Task 6: CardTile and CardRow

The two shapes a card/listing renders in: a grid tile (browse pages) and a list row (search results, sell-flow picker). Deliberately generic — no `PriceProvenance`/`VerificationBadge` logic baked in (those are Plan B primitives); both accept a `badge` and `provenance` slot so Plan B can drop its components in without CardTile/CardRow depending on them.

**Files:**
- Create: `src/components/cards/card-tile.tsx`
- Create: `src/components/cards/card-row.tsx`
- Create: `src/components/cards/__tests__/card-tile.test.tsx`
- Create: `src/components/cards/__tests__/card-row.test.tsx`
- Create: `src/components/cards/card.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `<CardTile imageAlt: string; name: string; subtitle: string; price: string; badge?: React.ReactNode; onClick?: () => void />`
  - `<CardRow imageAlt: string; name: string; subtitle: string; price: string; deltaLabel?: string; deltaDirection?: 'up' | 'down'; badge?: React.ReactNode; provenance?: React.ReactNode; conditionLabel?: string; onClick?: () => void />` — `provenance` is a slot Plan B's `<PriceProvenance>` renders into; this task only reserves the layout position and tests that arbitrary children render there.

- [ ] **Step 1: Write the failing CardTile test**

`src/components/cards/__tests__/card-tile.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardTile } from '@/components/cards/card-tile';

describe('CardTile', () => {
  it('renders name, subtitle, and price', () => {
    render(<CardTile imageAlt="Charizard VMAX" name="Charizard VMAX" subtitle="Champion's Path" price="฿42,000" />);
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText("Champion's Path")).toBeInTheDocument();
    expect(screen.getByText('฿42,000')).toBeInTheDocument();
  });

  it('renders the price with tabular-nums via the numeric text class', () => {
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿42,000" />);
    expect(screen.getByText('฿42,000')).toHaveClass('text-numeric');
  });

  it('calls onClick when tapped, and is keyboard-activatable', async () => {
    const onClick = vi.fn();
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿0" onClick={onClick} />);
    const tile = screen.getByRole('button');
    await userEvent.click(tile);
    expect(onClick).toHaveBeenCalledOnce();
    tile.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders a caller-supplied badge slot', () => {
    render(<CardTile imageAlt="x" name="x" subtitle="x" price="฿0" badge={<span data-testid="badge">✓</span>} />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/card-tile.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement CardTile**

`src/components/cards/card-tile.tsx`:
```tsx
export interface CardTileProps {
  imageAlt: string;
  name: string;
  subtitle: string;
  price: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export function CardTile({ imageAlt, name, subtitle, price, badge, onClick }: CardTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-3 text-left"
    >
      <div role="img" aria-label={imageAlt} className="aspect-[3/4] rounded-lg bg-surface-2" />
      <div className="flex items-start justify-between gap-1">
        <span className="text-label text-text">{name}</span>
        {badge}
      </div>
      <span className="text-body text-muted-text">{subtitle}</span>
      <span className="text-label text-numeric text-text">{price}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/card-tile.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Write the failing CardRow test**

`src/components/cards/__tests__/card-row.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardRow } from '@/components/cards/card-row';

describe('CardRow', () => {
  it('renders name, subtitle, price, condition, and the provenance slot', () => {
    render(
      <CardRow
        imageAlt="Charizard VMAX"
        name="Charizard VMAX (Rainbow Rare)"
        subtitle="Champion's Path · No.074/073"
        price="฿42,000"
        conditionLabel="PSA 10"
        provenance={<span>ยืนยัน · จากการซื้อขายจริง 15 รายการ</span>}
      />,
    );
    expect(screen.getByText('Charizard VMAX (Rainbow Rare)')).toBeInTheDocument();
    expect(screen.getByText("Champion's Path · No.074/073")).toBeInTheDocument();
    expect(screen.getByText('฿42,000')).toBeInTheDocument();
    expect(screen.getByText('PSA 10')).toBeInTheDocument();
    expect(screen.getByText('ยืนยัน · จากการซื้อขายจริง 15 รายการ')).toBeInTheDocument();
  });

  it('renders an up delta with a non-colour-only up marker', () => {
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" deltaLabel="8.2%" deltaDirection="up" />);
    expect(screen.getByText('▲ 8.2%')).toBeInTheDocument();
  });

  it('renders a down delta with a non-colour-only down marker', () => {
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" deltaLabel="3.1%" deltaDirection="down" />);
    expect(screen.getByText('▼ 3.1%')).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(<CardRow imageAlt="x" name="x" subtitle="x" price="฿0" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/card-row.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement CardRow**

`src/components/cards/card-row.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface CardRowProps {
  imageAlt: string;
  name: string;
  subtitle: string;
  price: string;
  deltaLabel?: string;
  deltaDirection?: 'up' | 'down';
  badge?: React.ReactNode;
  provenance?: React.ReactNode;
  conditionLabel?: string;
  onClick?: () => void;
}

export function CardRow({
  imageAlt,
  name,
  subtitle,
  price,
  deltaLabel,
  deltaDirection,
  badge,
  provenance,
  conditionLabel,
  onClick,
}: CardRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left"
    >
      <div role="img" aria-label={imageAlt} className="h-16 w-16 shrink-0 rounded-lg bg-surface-2" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-label text-text">{name}</span>
          {badge}
        </div>
        <span className="text-body text-muted-text">{subtitle}</span>
        {provenance ? <div className="text-body mt-0.5">{provenance}</div> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {conditionLabel ? (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-body text-text-2">{conditionLabel}</span>
        ) : null}
        <span className="text-label text-numeric text-text">{price}</span>
        {deltaLabel ? (
          <span
            className={cn(
              'text-body text-numeric',
              deltaDirection === 'up' ? 'text-pos-text' : 'text-neg-text',
            )}
          >
            {deltaDirection === 'up' ? '▲' : '▼'} {deltaLabel}
          </span>
        ) : null}
      </div>
    </button>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/card-row.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 9: Storybook story**

`src/components/cards/card.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CardTile } from './card-tile';
import { CardRow } from './card-row';

const meta: Meta = { title: 'Cards/CardTile+CardRow' };
export default meta;

export const Tile: StoryObj = {
  render: () => (
    <div className="w-40">
      <CardTile imageAlt="Charizard VMAX" name="Charizard VMAX" subtitle="Champion's Path" price="฿42,000" />
    </div>
  ),
};

export const Row: StoryObj = {
  render: () => (
    <CardRow
      imageAlt="Charizard VMAX"
      name="Charizard VMAX (Rainbow Rare)"
      subtitle="Champion's Path · No.074/073"
      price="฿42,000"
      conditionLabel="PSA 10"
      deltaLabel="8.2%"
      deltaDirection="up"
    />
  ),
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/cards/card-tile.tsx src/components/cards/card-row.tsx src/components/cards/__tests__/card-tile.test.tsx src/components/cards/__tests__/card-row.test.tsx src/components/cards/card.stories.tsx
git commit -m "feat: CardTile and CardRow with badge/provenance slots"
```

---

### Task 7: DensityToggle

The list/grid view-mode switch seen top-right of search results.

**Files:**
- Create: `src/components/cards/density-toggle.tsx`
- Create: `src/components/cards/__tests__/density-toggle.test.tsx`
- Create: `src/components/cards/density-toggle.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces: `<DensityToggle value: 'list' | 'grid'; onChange: (value: 'list' | 'grid') => void />`.

- [ ] **Step 1: Write the failing test**

`src/components/cards/__tests__/density-toggle.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DensityToggle } from '@/components/cards/density-toggle';

describe('DensityToggle', () => {
  it('marks the active mode pressed', () => {
    render(<DensityToggle value="list" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'มุมมองรายการ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'มุมมองตาราง' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the clicked mode', async () => {
    const onChange = vi.fn();
    render(<DensityToggle value="list" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'มุมมองตาราง' }));
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/density-toggle.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement DensityToggle**

`src/components/cards/density-toggle.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface DensityToggleProps {
  value: 'list' | 'grid';
  onChange: (value: 'list' | 'grid') => void;
}

export function DensityToggle({ value, onChange }: DensityToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border">
      <button
        type="button"
        aria-label="มุมมองรายการ"
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={cn('tap-target rounded-l-lg px-2', value === 'list' ? 'bg-surface-2' : 'bg-bg')}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <button
        type="button"
        aria-label="มุมมองตาราง"
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
        className={cn('tap-target rounded-r-lg px-2', value === 'grid' ? 'bg-surface-2' : 'bg-bg')}
      >
        <span aria-hidden="true">▦</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/density-toggle.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Storybook story**

`src/components/cards/density-toggle.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DensityToggle } from './density-toggle';

const meta: Meta<typeof DensityToggle> = { title: 'Cards/DensityToggle', component: DensityToggle };
export default meta;
type Story = StoryObj<typeof DensityToggle>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<'list' | 'grid'>('list');
    return <DensityToggle value={value} onChange={setValue} />;
  },
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/cards/density-toggle.tsx src/components/cards/__tests__/density-toggle.test.tsx src/components/cards/density-toggle.stories.tsx
git commit -m "feat: DensityToggle list/grid view switch"
```

---

### Task 8: SetBannerCard and StatCards

The Set Detail / Home hero banner (card set name, publisher, verified badge, diagonal-striped placeholder art) and its three-stat row (lowest price, card count, total value).

**Files:**
- Create: `src/components/cards/set-banner.tsx`
- Create: `src/components/cards/stat-cards.tsx`
- Create: `src/components/cards/__tests__/set-banner.test.tsx`
- Create: `src/components/cards/__tests__/stat-cards.test.tsx`
- Create: `src/components/cards/set-banner.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `<SetBannerCard name: string; publisher: string; verified?: boolean; imageAlt: string />`
  - `type Stat = { label: string; value: string }`; `<StatCards stats: Stat[] />` — always renders `value` with `.text-numeric`.

- [ ] **Step 1: Write the failing SetBannerCard test**

`src/components/cards/__tests__/set-banner.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SetBannerCard } from '@/components/cards/set-banner';

describe('SetBannerCard', () => {
  it('renders the set name and publisher', () => {
    render(<SetBannerCard name="Champion's Path" publisher="The Pokémon Company" imageAlt="Champion's Path" verified />);
    expect(screen.getByText("Champion's Path")).toBeInTheDocument();
    expect(screen.getByText('โดย The Pokémon Company')).toBeInTheDocument();
  });

  it('shows a verified marker (icon + accessible text, not colour alone) when verified', () => {
    render(<SetBannerCard name="x" publisher="x" imageAlt="x" verified />);
    expect(screen.getByRole('img', { name: 'ยืนยันแล้ว' })).toBeInTheDocument();
  });

  it('omits the verified marker when not verified', () => {
    render(<SetBannerCard name="x" publisher="x" imageAlt="x" verified={false} />);
    expect(screen.queryByRole('img', { name: 'ยืนยันแล้ว' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/set-banner.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement SetBannerCard**

`src/components/cards/set-banner.tsx`:
```tsx
export interface SetBannerCardProps {
  name: string;
  publisher: string;
  verified?: boolean;
  imageAlt: string;
}

export function SetBannerCard({ name, publisher, verified, imageAlt }: SetBannerCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div
        role="img"
        aria-label={imageAlt}
        className="h-32 w-full"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--surface-2), var(--surface-2) 10px, var(--surface) 10px, var(--surface) 20px)',
        }}
      />
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-heading">{name}</h2>
          {verified ? (
            <span role="img" aria-label="ยืนยันแล้ว" className="text-pos-text">
              ✓
            </span>
          ) : null}
        </div>
        <p className="text-body text-muted-text">โดย {publisher}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/set-banner.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing StatCards test**

`src/components/cards/__tests__/stat-cards.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '@/components/cards/stat-cards';

const stats = [
  { label: 'ราคาต่ำสุด', value: '฿1,200' },
  { label: 'จำนวนการ์ด', value: '73 ใบ' },
  { label: 'มูลค่ารวม', value: '฿2.4M' },
];

describe('StatCards', () => {
  it('renders every stat label and value', () => {
    render(<StatCards stats={stats} />);
    for (const stat of stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    }
  });

  it('renders every value with tabular-nums', () => {
    render(<StatCards stats={stats} />);
    for (const stat of stats) {
      expect(screen.getByText(stat.value)).toHaveClass('text-numeric');
    }
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/stat-cards.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement StatCards**

`src/components/cards/stat-cards.tsx`:
```tsx
export interface Stat {
  label: string;
  value: string;
}

export interface StatCardsProps {
  stats: Stat[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-surface p-3">
          <p className="text-body text-muted-text">{stat.label}</p>
          <p className="text-label text-numeric text-text">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/stat-cards.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 9: Storybook story**

`src/components/cards/set-banner.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SetBannerCard } from './set-banner';
import { StatCards } from './stat-cards';

const meta: Meta = { title: 'Cards/SetBannerCard+StatCards' };
export default meta;

export const Banner: StoryObj = {
  render: () => (
    <SetBannerCard name="Champion's Path" publisher="The Pokémon Company" imageAlt="Champion's Path" verified />
  ),
};

export const Stats: StoryObj = {
  render: () => (
    <StatCards
      stats={[
        { label: 'ราคาต่ำสุด', value: '฿1,200' },
        { label: 'จำนวนการ์ด', value: '73 ใบ' },
        { label: 'มูลค่ารวม', value: '฿2.4M' },
      ]}
    />
  ),
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/cards/set-banner.tsx src/components/cards/stat-cards.tsx src/components/cards/__tests__/set-banner.test.tsx src/components/cards/__tests__/stat-cards.test.tsx src/components/cards/set-banner.stories.tsx
git commit -m "feat: SetBannerCard and StatCards"
```

---

### Task 9: ListingRow and DealRow

`ListingRow` is a marketplace listing (seller's card for sale). `DealRow` is an in-progress deal — the richest row in the product: deal ID, status pill (colour + text, never colour alone), thumbnail, counterparty role/name, price, relative time, unread badge, and an escrow footer line with a lock icon whenever money is held (per this plan's Global Constraints).

**Files:**
- Create: `src/components/cards/listing-row.tsx`
- Create: `src/components/cards/deal-row.tsx`
- Create: `src/components/cards/__tests__/listing-row.test.tsx`
- Create: `src/components/cards/__tests__/deal-row.test.tsx`
- Create: `src/components/cards/deal-row.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `<ListingRow imageAlt: string; name: string; sellerName: string; price: string; verified?: boolean; onClick?: () => void />`
  - `type DealStatus = { label: string; tone: 'warn' | 'pos' | 'neutral' }`; `<DealRow dealId: string; imageAlt: string; cardName: string; role: 'buyer' | 'seller'; counterpartyName: string; price: string; relativeTimeLabel: string; status: DealStatus; unreadCount?: number; escrowLabel?: string; onClick?: () => void />` — `escrowLabel` is the pre-formatted Thai string (e.g. `"เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548"`); when present, the row renders it with a lock icon per the Global Constraint.

- [ ] **Step 1: Write the failing ListingRow test**

`src/components/cards/__tests__/listing-row.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingRow } from '@/components/cards/listing-row';

describe('ListingRow', () => {
  it('renders card name, seller, and price', () => {
    render(<ListingRow imageAlt="x" name="Charizard VMAX" sellerName="KanaCards" price="฿39,500" />);
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText('KanaCards')).toBeInTheDocument();
    expect(screen.getByText('฿39,500')).toBeInTheDocument();
  });

  it('shows a verified marker next to the seller name when verified', () => {
    render(<ListingRow imageAlt="x" name="x" sellerName="KanaCards" price="฿0" verified />);
    expect(screen.getByRole('img', { name: 'ผู้ขายยืนยันแล้ว' })).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(<ListingRow imageAlt="x" name="x" sellerName="x" price="฿0" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/listing-row.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement ListingRow**

`src/components/cards/listing-row.tsx`:
```tsx
export interface ListingRowProps {
  imageAlt: string;
  name: string;
  sellerName: string;
  price: string;
  verified?: boolean;
  onClick?: () => void;
}

export function ListingRow({ imageAlt, name, sellerName, price, verified, onClick }: ListingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left"
    >
      <div role="img" aria-label={imageAlt} className="h-16 w-16 shrink-0 rounded-lg bg-surface-2" />
      <div className="min-w-0 flex-1">
        <span className="text-label block text-text">{name}</span>
        <span className="flex items-center gap-1 text-body text-muted-text">
          {sellerName}
          {verified ? (
            <span role="img" aria-label="ผู้ขายยืนยันแล้ว" className="text-pos-text">
              ✓
            </span>
          ) : null}
        </span>
      </div>
      <span className="text-label shrink-0 text-numeric text-text">{price}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/listing-row.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing DealRow test**

`src/components/cards/__tests__/deal-row.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DealRow } from '@/components/cards/deal-row';

describe('DealRow', () => {
  it('renders the deal id, card name, counterparty role/name, price, and relative time', () => {
    render(
      <DealRow
        dealId="#ST-24902"
        imageAlt="x"
        cardName="Mewtwo GX (Rainbow Rare)"
        role="seller"
        counterpartyName="cardhunter_99"
        price="฿18,500"
        relativeTimeLabel="5 นาที"
        status={{ label: 'ข้อเสนอใหม่', tone: 'warn' }}
      />,
    );
    expect(screen.getByText('#ST-24902')).toBeInTheDocument();
    expect(screen.getByText('Mewtwo GX (Rainbow Rare)')).toBeInTheDocument();
    expect(screen.getByText('คุณเป็นผู้ขาย · cardhunter_99')).toBeInTheDocument();
    expect(screen.getByText('฿18,500')).toBeInTheDocument();
    expect(screen.getByText('5 นาที')).toBeInTheDocument();
  });

  it('renders the status pill with both text and a tone (never colour alone)', () => {
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'รอผู้ขายตอบรับ', tone: 'pos' }}
      />,
    );
    const pill = screen.getByText('รอผู้ขายตอบรับ');
    expect(pill).toHaveClass('bg-pos-tint');
  });

  it('renders the unread badge when unreadCount is set', () => {
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        unreadCount={2}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders the escrow line with a lock icon when escrowLabel is set, and omits it otherwise', () => {
    const { rerender } = render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
      />,
    );
    expect(screen.queryByRole('img', { name: 'เงินถูกเก็บไว้ในระบบ escrow' })).toBeNull();
    rerender(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        escrowLabel="เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548"
      />,
    );
    expect(screen.getByRole('img', { name: 'เงินถูกเก็บไว้ในระบบ escrow' })).toBeInTheDocument();
    expect(screen.getByText('เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548')).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const onClick = vi.fn();
    render(
      <DealRow
        dealId="x"
        imageAlt="x"
        cardName="x"
        role="buyer"
        counterpartyName="x"
        price="฿0"
        relativeTimeLabel="x"
        status={{ label: 'x', tone: 'neutral' }}
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/cards/__tests__/deal-row.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement DealRow**

`src/components/cards/deal-row.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface DealStatus {
  label: string;
  tone: 'warn' | 'pos' | 'neutral';
}

export interface DealRowProps {
  dealId: string;
  imageAlt: string;
  cardName: string;
  role: 'buyer' | 'seller';
  counterpartyName: string;
  price: string;
  relativeTimeLabel: string;
  status: DealStatus;
  unreadCount?: number;
  escrowLabel?: string;
  onClick?: () => void;
}

const TONE_CLASSES: Record<DealStatus['tone'], string> = {
  warn: 'bg-warn-tint text-warn-text',
  pos: 'bg-pos-tint text-pos-text',
  neutral: 'bg-surface-2 text-text-2',
};

export function DealRow({
  dealId,
  imageAlt,
  cardName,
  role,
  counterpartyName,
  price,
  relativeTimeLabel,
  status,
  unreadCount,
  escrowLabel,
  onClick,
}: DealRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-bg p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="text-body text-numeric text-muted-text">{dealId}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-body', TONE_CLASSES[status.tone])}>{status.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div role="img" aria-label={imageAlt} className="h-14 w-14 shrink-0 rounded-lg bg-surface-2" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-label text-text">{cardName}</span>
            <span className="text-body text-numeric shrink-0 text-muted-text">{relativeTimeLabel}</span>
          </div>
          <span className="text-body text-muted-text">
            {role === 'buyer' ? 'คุณเป็นผู้ซื้อ' : 'คุณเป็นผู้ขาย'} · {counterpartyName}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-label text-numeric text-text">{price}</span>
            {unreadCount ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pos px-1.5 text-[11px] text-on-primary text-numeric">
                {unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {escrowLabel ? (
        <div className="flex items-center gap-1.5 text-body text-pos-text">
          <span role="img" aria-label="เงินถูกเก็บไว้ในระบบ escrow">
            🔒
          </span>
          <span>{escrowLabel}</span>
        </div>
      ) : null}
    </button>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/cards/__tests__/deal-row.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 9: Storybook story**

`src/components/cards/deal-row.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DealRow } from './deal-row';
import { ListingRow } from './listing-row';

const meta: Meta = { title: 'Cards/DealRow+ListingRow' };
export default meta;

export const AwaitingResponse: StoryObj = {
  render: () => (
    <DealRow
      dealId="#ST-24902"
      imageAlt="Mewtwo GX"
      cardName="Mewtwo GX (Rainbow Rare)"
      role="seller"
      counterpartyName="cardhunter_99"
      price="฿18,500"
      relativeTimeLabel="5 นาที"
      status={{ label: 'ข้อเสนอใหม่', tone: 'warn' }}
      unreadCount={1}
    />
  ),
};

export const EscrowHeld: StoryObj = {
  render: () => (
    <DealRow
      dealId="#ST-24815"
      imageAlt="Charizard VMAX"
      cardName="Charizard VMAX (Rainbow Rare)"
      role="buyer"
      counterpartyName="KanaCards"
      price="฿39,500"
      relativeTimeLabel="2 นาที"
      status={{ label: 'รอผู้ขายตอบรับ', tone: 'pos' }}
      escrowLabel="เงินถูกเก็บไว้อย่างปลอดภัย ฿40,548"
    />
  ),
};

export const Listing: StoryObj = {
  render: () => <ListingRow imageAlt="Charizard VMAX" name="Charizard VMAX" sellerName="KanaCards" price="฿39,500" verified />,
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/cards/listing-row.tsx src/components/cards/deal-row.tsx src/components/cards/__tests__/listing-row.test.tsx src/components/cards/__tests__/deal-row.test.tsx src/components/cards/deal-row.stories.tsx
git commit -m "feat: ListingRow and DealRow with status pill, unread badge, and escrow line"
```

---

### Task 10: Stepper and Timeline

`Stepper` is the horizontal segmented progress bar from the Sell flow ("1/3"). `Timeline` is the vertical step tracker for seller deal management (`pending → shipping → shipped → paid`).

**Files:**
- Create: `src/components/progress/stepper.tsx`
- Create: `src/components/progress/timeline.tsx`
- Create: `src/components/progress/__tests__/stepper.test.tsx`
- Create: `src/components/progress/__tests__/timeline.test.tsx`
- Create: `src/components/progress/progress.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `<Stepper totalSteps: number; currentStep: number />` (1-indexed; `currentStep=1` of `totalSteps=3` renders "1/3").
  - `type TimelineStep = { label: string; status: 'done' | 'current' | 'upcoming' }`; `<Timeline steps: TimelineStep[] />`.

- [ ] **Step 1: Write the failing Stepper test**

`src/components/progress/__tests__/stepper.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from '@/components/progress/stepper';

describe('Stepper', () => {
  it('renders the step count as text', () => {
    render(<Stepper totalSteps={3} currentStep={1} />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('renders one segment per step and marks the completed ones', () => {
    render(<Stepper totalSteps={3} currentStep={2} />);
    const segments = screen.getAllByRole('presentation');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toHaveClass('bg-primary');
    expect(segments[1]).toHaveClass('bg-primary');
    expect(segments[2]).not.toHaveClass('bg-primary');
  });

  it('exposes progress to assistive technology via a progressbar role', () => {
    render(<Stepper totalSteps={3} currentStep={2} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/progress/__tests__/stepper.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Stepper**

`src/components/progress/stepper.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface StepperProps {
  totalSteps: number;
  currentStep: number;
}

export function Stepper({ totalSteps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="flex flex-1 gap-1.5"
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            role="presentation"
            className={cn('h-1 flex-1 rounded-full', i < currentStep ? 'bg-primary' : 'bg-surface-3')}
          />
        ))}
      </div>
      <span className="text-body text-numeric shrink-0 text-muted-text">
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/progress/__tests__/stepper.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing Timeline test**

`src/components/progress/__tests__/timeline.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '@/components/progress/timeline';

const steps = [
  { label: 'ยอมรับข้อเสนอ', status: 'done' as const },
  { label: 'จัดส่ง', status: 'current' as const },
  { label: 'ชำระเงิน', status: 'upcoming' as const },
];

describe('Timeline', () => {
  it('renders every step label', () => {
    render(<Timeline steps={steps} />);
    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it('marks the current step distinctly from done and upcoming (text, not colour alone)', () => {
    render(<Timeline steps={steps} />);
    expect(screen.getByText('ยอมรับข้อเสนอ').closest('li')).toHaveTextContent('เสร็จสิ้น');
    expect(screen.getByText('จัดส่ง').closest('li')).toHaveTextContent('กำลังดำเนินการ');
    expect(screen.getByText('ชำระเงิน').closest('li')).not.toHaveTextContent(/เสร็จสิ้น|กำลังดำเนินการ/);
  });

  it('renders as an ordered list for assistive tech', () => {
    render(<Timeline steps={steps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/progress/__tests__/timeline.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement Timeline**

`src/components/progress/timeline.tsx`:
```tsx
import { VisuallyHidden } from '@/primitives/visually-hidden';
import { cn } from '@/lib/cn';

export interface TimelineStep {
  label: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]',
              step.status === 'done' && 'bg-primary text-on-primary',
              step.status === 'current' && 'bg-primary-tint text-accent-text',
              step.status === 'upcoming' && 'bg-surface-2 text-muted-text',
            )}
          >
            {step.status === 'done' ? '✓' : i + 1}
          </span>
          <span className={cn('text-label', step.status === 'upcoming' ? 'text-muted-text' : 'text-text')}>
            {step.label}
          </span>
          {step.status === 'done' ? <VisuallyHidden>เสร็จสิ้น</VisuallyHidden> : null}
          {step.status === 'current' ? <VisuallyHidden>กำลังดำเนินการ</VisuallyHidden> : null}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/progress/__tests__/timeline.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 9: Storybook story**

`src/components/progress/progress.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './stepper';
import { Timeline } from './timeline';

const meta: Meta = { title: 'Progress/Stepper+Timeline' };
export default meta;

export const SellFlowStep1: StoryObj = { render: () => <Stepper totalSteps={3} currentStep={1} /> };

export const DealTimeline: StoryObj = {
  render: () => (
    <Timeline
      steps={[
        { label: 'ยอมรับข้อเสนอ', status: 'done' },
        { label: 'จัดส่ง', status: 'current' },
        { label: 'ชำระเงิน', status: 'upcoming' },
      ]}
    />
  ),
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/progress/stepper.tsx src/components/progress/timeline.tsx src/components/progress/__tests__/stepper.test.tsx src/components/progress/__tests__/timeline.test.tsx src/components/progress/progress.stories.tsx
git commit -m "feat: Stepper (horizontal progress) and Timeline (vertical deal status)"
```

---

### Task 11: AmountStepper

The `+`/`-` amount input used for offers and counter-offers.

**Files:**
- Create: `src/components/forms/amount-stepper.tsx`
- Create: `src/components/forms/__tests__/amount-stepper.test.tsx`
- Create: `src/components/forms/amount-stepper.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces: `<AmountStepper value: number; onChange: (value: number) => void; step: number; min?: number; formatLabel: (value: number) => string />` — `formatLabel` lets the caller supply the ฿-formatted display string (keeps currency formatting out of this component, consistent with the "callers supply pre-formatted strings" constraint).

- [ ] **Step 1: Write the failing test**

`src/components/forms/__tests__/amount-stepper.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountStepper } from '@/components/forms/amount-stepper';

const formatLabel = (v: number) => `฿${v.toLocaleString('en-US')}`;

describe('AmountStepper', () => {
  it('renders the formatted current value', () => {
    render(<AmountStepper value={1000} onChange={vi.fn()} step={100} formatLabel={formatLabel} />);
    expect(screen.getByText('฿1,000')).toBeInTheDocument();
  });

  it('increments by step on the plus button', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={1000} onChange={onChange} step={100} formatLabel={formatLabel} />);
    await userEvent.click(screen.getByRole('button', { name: 'เพิ่ม' }));
    expect(onChange).toHaveBeenCalledWith(1100);
  });

  it('decrements by step on the minus button', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={1000} onChange={onChange} step={100} formatLabel={formatLabel} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลด' }));
    expect(onChange).toHaveBeenCalledWith(900);
  });

  it('does not decrement below min, and disables the minus button there', async () => {
    const onChange = vi.fn();
    render(<AmountStepper value={100} onChange={onChange} step={100} min={100} formatLabel={formatLabel} />);
    const minusButton = screen.getByRole('button', { name: 'ลด' });
    expect(minusButton).toBeDisabled();
    await userEvent.click(minusButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the value with tabular-nums', () => {
    render(<AmountStepper value={1000} onChange={vi.fn()} step={100} formatLabel={formatLabel} />);
    expect(screen.getByText('฿1,000')).toHaveClass('text-numeric');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/amount-stepper.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement AmountStepper**

`src/components/forms/amount-stepper.tsx`:
```tsx
export interface AmountStepperProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  formatLabel: (value: number) => string;
}

export function AmountStepper({ value, onChange, step, min, formatLabel }: AmountStepperProps) {
  const atMin = min !== undefined && value <= min;
  return (
    <div className="flex items-center justify-between gap-4 rounded-full border border-border-input px-2 py-2">
      <button
        type="button"
        aria-label="ลด"
        disabled={atMin}
        onClick={() => onChange(Math.max(value - step, min ?? -Infinity))}
        className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-text disabled:opacity-40"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span className="text-heading text-numeric">{formatLabel(value)}</span>
      <button
        type="button"
        aria-label="เพิ่ม"
        onClick={() => onChange(value + step)}
        className="tap-target flex items-center justify-center rounded-full bg-surface-2 text-text"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/amount-stepper.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Storybook story**

`src/components/forms/amount-stepper.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AmountStepper } from './amount-stepper';

const meta: Meta<typeof AmountStepper> = { title: 'Forms/AmountStepper', component: AmountStepper };
export default meta;
type Story = StoryObj<typeof AmountStepper>;

export const OfferAmount: Story = {
  render: () => {
    const [value, setValue] = useState(35000);
    return (
      <AmountStepper
        value={value}
        onChange={setValue}
        step={500}
        min={0}
        formatLabel={(v) => `฿${v.toLocaleString('en-US')}`}
      />
    );
  },
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/forms/amount-stepper.tsx src/components/forms/__tests__/amount-stepper.test.tsx src/components/forms/amount-stepper.stories.tsx
git commit -m "feat: AmountStepper for offers and counter-offers"
```

---

### Task 12: BottomSheet and Dialog

Two thin, named wrappers around M0's `Overlay` — same underlying mechanism (`Overlay` already renders bottom-sheet-on-mobile / centered-dialog-on-desktop), this task adds the shared chrome every sheet/dialog in the product needs: a title, an optional description, and a close button, so no future component hand-rolls that header again.

**Files:**
- Create: `src/components/overlays/bottom-sheet.tsx`
- Create: `src/components/overlays/dialog.tsx`
- Create: `src/components/overlays/__tests__/bottom-sheet.test.tsx`
- Create: `src/components/overlays/__tests__/dialog.test.tsx`
- Create: `src/components/overlays/overlays.stories.tsx`

**Interfaces:**
- Consumes: `Overlay` (`@/primitives/overlay`).
- Produces: `<BottomSheet open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode />` and `<Dialog open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode />` — identical props; both exist as separate exports so call sites read intent-first (`<Dialog>` for a confirmation, `<BottomSheet>` for a form), even though they render the same underlying `Overlay`.

- [ ] **Step 1: Write the failing BottomSheet test**

`src/components/overlays/__tests__/bottom-sheet.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from '@/components/overlays/bottom-sheet';

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()} title="ยืนยันการเสนอราคา">
        <p>content</p>
      </BottomSheet>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the title, description, and children when open', () => {
    render(
      <BottomSheet open onClose={vi.fn()} title="ยืนยันการเสนอราคา" description="ตรวจสอบก่อนส่ง">
        <p>content</p>
      </BottomSheet>,
    );
    expect(screen.getByRole('heading', { name: 'ยืนยันการเสนอราคา' })).toBeInTheDocument();
    expect(screen.getByText('ตรวจสอบก่อนส่ง')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="x">
        <p>content</p>
      </BottomSheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ปิด' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/overlays/__tests__/bottom-sheet.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement BottomSheet**

`src/components/overlays/bottom-sheet.tsx`:
```tsx
import { Overlay } from '@/primitives/overlay';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, description, children }: BottomSheetProps) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="bottom-sheet-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="bottom-sheet-title" className="text-heading">
            {title}
          </h2>
          {description ? <p className="text-body mt-1 text-muted-text">{description}</p> : null}
        </div>
        <button
          type="button"
          aria-label="ปิด"
          onClick={onClose}
          className="tap-target flex shrink-0 items-center justify-center rounded-full text-text-2"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      {children}
    </Overlay>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/overlays/__tests__/bottom-sheet.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing Dialog test (same contract, separate export)**

`src/components/overlays/__tests__/dialog.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog } from '@/components/overlays/dialog';

describe('Dialog', () => {
  it('renders the title and children when open', () => {
    render(
      <Dialog open onClose={vi.fn()} title="ยกเลิกข้อเสนอ?">
        <p>content</p>
      </Dialog>,
    );
    expect(screen.getByRole('heading', { name: 'ยกเลิกข้อเสนอ?' })).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="x">
        <p>content</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/overlays/__tests__/dialog.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement Dialog**

`src/components/overlays/dialog.tsx`:
```tsx
import { Overlay } from '@/primitives/overlay';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  return (
    <Overlay open={open} onClose={onClose} labelledBy="dialog-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="dialog-title" className="text-heading">
            {title}
          </h2>
          {description ? <p className="text-body mt-1 text-muted-text">{description}</p> : null}
        </div>
        <button
          type="button"
          aria-label="ปิด"
          onClick={onClose}
          className="tap-target flex shrink-0 items-center justify-center rounded-full text-text-2"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      {children}
    </Overlay>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/overlays/__tests__/dialog.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 9: Storybook story**

`src/components/overlays/overlays.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './bottom-sheet';
import { Dialog } from './dialog';

const meta: Meta = { title: 'Overlays/BottomSheet+Dialog' };
export default meta;

export const Sheet: StoryObj = {
  render: () => (
    <BottomSheet open onClose={() => {}} title="ยืนยันการเสนอราคา" description="ตรวจสอบก่อนส่ง">
      <p className="text-body text-text-2">form content</p>
    </BottomSheet>
  ),
};

export const CenteredDialog: StoryObj = {
  render: () => (
    <Dialog open onClose={() => {}} title="ยกเลิกข้อเสนอ?" description="การกระทำนี้ไม่สามารถย้อนกลับได้">
      <p className="text-body text-text-2">confirmation content</p>
    </Dialog>
  ),
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/overlays/bottom-sheet.tsx src/components/overlays/dialog.tsx src/components/overlays/__tests__/bottom-sheet.test.tsx src/components/overlays/__tests__/dialog.test.tsx src/components/overlays/overlays.stories.tsx
git commit -m "feat: BottomSheet and Dialog chrome around the shared Overlay primitive"
```

---

### Task 13: PermissionModal

Camera-permission (Sell flow's scan-card affordance) and notification-permission (Alerts) prompts. Built on `Dialog`/`BottomSheet` — this task adds the icon + two-button (allow/deny) composition, not a new overlay.

**Files:**
- Create: `src/components/overlays/permission-modal.tsx`
- Create: `src/components/overlays/__tests__/permission-modal.test.tsx`
- (story added to `overlays.stories.tsx` from Task 12)

**Interfaces:**
- Consumes: `Dialog` (`@/components/overlays/dialog`).
- Produces: `<PermissionModal open: boolean; onClose: () => void; icon: React.ReactNode; title: string; description: string; onAllow: () => void; onDeny: () => void; allowLabel?: string; denyLabel?: string />` — `allowLabel`/`denyLabel` default to `"อนุญาต"`/`"ไม่อนุญาต"`.

- [ ] **Step 1: Write the failing test**

`src/components/overlays/__tests__/permission-modal.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionModal } from '@/components/overlays/permission-modal';

describe('PermissionModal', () => {
  it('renders the icon, title, and description', () => {
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span data-testid="cam-icon" />}
        title="อนุญาตให้ใช้กล้อง"
        description="เพื่อสแกนการ์ดของคุณ"
        onAllow={vi.fn()}
        onDeny={vi.fn()}
      />,
    );
    expect(screen.getByTestId('cam-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'อนุญาตให้ใช้กล้อง' })).toBeInTheDocument();
    expect(screen.getByText('เพื่อสแกนการ์ดของคุณ')).toBeInTheDocument();
  });

  it('calls onAllow and onDeny from their default-labelled buttons', async () => {
    const onAllow = vi.fn();
    const onDeny = vi.fn();
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span />}
        title="x"
        description="x"
        onAllow={onAllow}
        onDeny={onDeny}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'อนุญาต' }));
    expect(onAllow).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'ไม่อนุญาต' }));
    expect(onDeny).toHaveBeenCalledOnce();
  });

  it('accepts custom button labels', () => {
    render(
      <PermissionModal
        open
        onClose={vi.fn()}
        icon={<span />}
        title="x"
        description="x"
        onAllow={vi.fn()}
        onDeny={vi.fn()}
        allowLabel="เปิดใช้งาน"
        denyLabel="ภายหลัง"
      />,
    );
    expect(screen.getByRole('button', { name: 'เปิดใช้งาน' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ภายหลัง' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/overlays/__tests__/permission-modal.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement PermissionModal**

`src/components/overlays/permission-modal.tsx`:
```tsx
import { Dialog } from './dialog';

export interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  onAllow: () => void;
  onDeny: () => void;
  allowLabel?: string;
  denyLabel?: string;
}

export function PermissionModal({
  open,
  onClose,
  icon,
  title,
  description,
  onAllow,
  onDeny,
  allowLabel = 'อนุญาต',
  denyLabel = 'ไม่อนุญาต',
}: PermissionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="mb-6 flex justify-center">{icon}</div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAllow}
          className="tap-target rounded-full border border-primary-border bg-primary px-4 text-label text-on-primary"
        >
          {allowLabel}
        </button>
        <button type="button" onClick={onDeny} className="tap-target rounded-full px-4 text-label text-muted-text">
          {denyLabel}
        </button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/overlays/__tests__/permission-modal.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Add the story to `overlays.stories.tsx`**

Append to `src/components/overlays/overlays.stories.tsx`:
```tsx
import { PermissionModal } from './permission-modal';

export const CameraPermission: StoryObj = {
  render: () => (
    <PermissionModal
      open
      onClose={() => {}}
      icon={<span style={{ fontSize: 40 }}>📷</span>}
      title="อนุญาตให้ใช้กล้อง"
      description="เพื่อสแกนการ์ดของคุณ"
      onAllow={() => {}}
      onDeny={() => {}}
    />
  ),
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/overlays/permission-modal.tsx src/components/overlays/__tests__/permission-modal.test.tsx src/components/overlays/overlays.stories.tsx
git commit -m "feat: PermissionModal built on Dialog"
```

---

### Task 14: OfflineBanner

A persistent banner wired to real connectivity — the mockup's manual toggle (already implemented in Task 2's `AppShell` drawer, for QA/demo purposes) drives this banner's *simulated* input, but the real production wiring is `navigator.onLine` plus an `online`/`offline` listener, per this plan's file-structure note and the M0 Handoff doc's explicit instruction ("wire the real implementation to `navigator.onLine` / a connectivity listener instead of a manual toggle").

**Files:**
- Create: `src/components/overlays/offline-banner.tsx`
- Create: `src/components/overlays/__tests__/offline-banner.test.tsx`
- (story added to `overlays.stories.tsx`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `<OfflineBanner offline: boolean />` — a controlled presentational component (the caller decides `offline`, typically from a small `useOnlineStatus()` hook a later plan can add; this task keeps `OfflineBanner` itself pure and testable without mocking `navigator.onLine`).

- [ ] **Step 1: Write the failing test**

`src/components/overlays/__tests__/offline-banner.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from '@/components/overlays/offline-banner';

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    render(<OfflineBanner offline={false} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders an offline message via a polite live region when offline', () => {
    render(<OfflineBanner offline />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveTextContent('ออฟไลน์');
  });

  it('pairs the offline message with an icon, not colour alone', () => {
    render(<OfflineBanner offline />);
    expect(screen.getByRole('img', { name: 'ออฟไลน์' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/overlays/__tests__/offline-banner.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement OfflineBanner**

`src/components/overlays/offline-banner.tsx`:
```tsx
export interface OfflineBannerProps {
  offline: boolean;
}

export function OfflineBanner({ offline }: OfflineBannerProps) {
  if (!offline) return null;
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 bg-warn-tint px-4 py-2 text-body text-warn-text">
      <span role="img" aria-label="ออฟไลน์">
        ⚠️
      </span>
      <span>ออฟไลน์ — ข้อมูลที่บันทึกไว้ยังอ่านได้ แต่ทำรายการไม่ได้ตอนนี้</span>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/overlays/__tests__/offline-banner.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Add the story**

Append to `src/components/overlays/overlays.stories.tsx`:
```tsx
import { OfflineBanner } from './offline-banner';

export const Offline: StoryObj = { render: () => <OfflineBanner offline /> };
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/overlays/offline-banner.tsx src/components/overlays/__tests__/offline-banner.test.tsx src/components/overlays/overlays.stories.tsx
git commit -m "feat: OfflineBanner, controlled by caller connectivity state"
```

---

### Task 15: SkeletonSet — SkeletonRow, SkeletonCard, SkeletonStatRow

The exact loading composition observed on the mockups' States swatch: a title-bar skeleton, a hero-block skeleton, a three-column stat-row skeleton, and repeated list-row skeletons (thumbnail + two text lines + trailing price). All three compose M0's `Skeleton` primitive (`width`/`height`/`className` props) — this task adds the *shapes*, not a new skeleton mechanism.

**Files:**
- Create: `src/components/skeletons/skeleton-row.tsx`
- Create: `src/components/skeletons/skeleton-card.tsx`
- Create: `src/components/skeletons/skeleton-stat-row.tsx`
- Create: `src/components/skeletons/__tests__/skeleton-row.test.tsx`
- Create: `src/components/skeletons/__tests__/skeleton-card.test.tsx`
- Create: `src/components/skeletons/__tests__/skeleton-stat-row.test.tsx`
- Create: `src/components/skeletons/skeletons.stories.tsx`

**Interfaces:**
- Consumes: `Skeleton` (`@/primitives/skeleton`).
- Produces: `<SkeletonRow />` (thumbnail + 2 lines + trailing price shape, matches `CardRow`/`ListingRow`/`DealRow`'s layout), `<SkeletonCard />` (hero-block shape, matches `SetBannerCard`), `<SkeletonStatRow />` (3-column shape, matches `StatCards`). None take props — they're fixed decorative shapes; a caller renders N of them in a loop for a list, or passes one as the `skeleton` prop to M0's `<DataBoundary>`.

- [ ] **Step 1: Write the failing tests**

`src/components/skeletons/__tests__/skeleton-row.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonRow } from '@/components/skeletons/skeleton-row';

describe('SkeletonRow', () => {
  it('renders a thumbnail block and at least two text-line blocks, all aria-hidden', () => {
    const { container } = render(<SkeletonRow />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks.length).toBeGreaterThanOrEqual(3);
  });
});
```

`src/components/skeletons/__tests__/skeleton-card.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonCard } from '@/components/skeletons/skeleton-card';

describe('SkeletonCard', () => {
  it('renders a hero block, all aria-hidden', () => {
    const { container } = render(<SkeletonCard />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks.length).toBeGreaterThanOrEqual(1);
  });
});
```

`src/components/skeletons/__tests__/skeleton-stat-row.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkeletonStatRow } from '@/components/skeletons/skeleton-stat-row';

describe('SkeletonStatRow', () => {
  it('renders exactly three stat blocks, all aria-hidden', () => {
    const { container } = render(<SkeletonStatRow />);
    const blocks = container.querySelectorAll('[aria-hidden="true"]');
    expect(blocks).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run to verify all three fail**

Run: `pnpm vitest run src/components/skeletons`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement all three**

`src/components/skeletons/skeleton-row.tsx`:
```tsx
import { Skeleton } from '@/primitives/skeleton';

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3">
      <Skeleton width="4rem" height="4rem" className="shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <Skeleton width="3rem" height="1rem" />
    </div>
  );
}
```

`src/components/skeletons/skeleton-card.tsx`:
```tsx
import { Skeleton } from '@/primitives/skeleton';

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <Skeleton width="100%" height="8rem" className="rounded-xl" />
      <Skeleton width="60%" height="1.25rem" />
      <Skeleton width="40%" height="0.875rem" />
    </div>
  );
}
```

`src/components/skeletons/skeleton-stat-row.tsx`:
```tsx
import { Skeleton } from '@/primitives/skeleton';

export function SkeletonStatRow() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
      <Skeleton width="100%" height="3.5rem" className="rounded-xl" />
    </div>
  );
}
```

- [ ] **Step 4: Run to verify all three pass**

Run: `pnpm vitest run src/components/skeletons`
Expected: PASS, 3 tests.

- [ ] **Step 5: Storybook story, composed with `DataBoundary` to prove the integration**

`src/components/skeletons/skeletons.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DataBoundary } from '@/primitives/data-boundary';
import { SkeletonRow } from './skeleton-row';
import { SkeletonCard } from './skeleton-card';
import { SkeletonStatRow } from './skeleton-stat-row';

const meta: Meta = { title: 'Skeletons/SkeletonSet' };
export default meta;

export const ListLoading: StoryObj = {
  render: () => (
    <DataBoundary
      state={{ status: 'loading' }}
      skeleton={
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonStatRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      }
      empty={<p>empty</p>}
    >
      {() => null}
    </DataBoundary>
  ),
};
```

- [ ] **Step 6: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/skeletons/skeleton-row.tsx src/components/skeletons/skeleton-card.tsx src/components/skeletons/skeleton-stat-row.tsx src/components/skeletons/__tests__ src/components/skeletons/skeletons.stories.tsx
git commit -m "feat: SkeletonRow, SkeletonCard, SkeletonStatRow composed from the Skeleton primitive"
```

---

### Task 16: OTPInput and Keypad

Auth-flow numeric entry: a 6-cell OTP display and its companion numeric keypad (used together in the login/verify flow's mobile step).

**Files:**
- Create: `src/components/forms/otp-input.tsx`
- Create: `src/components/forms/keypad.tsx`
- Create: `src/components/forms/__tests__/otp-input.test.tsx`
- Create: `src/components/forms/__tests__/keypad.test.tsx`
- Create: `src/components/forms/otp.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `<OTPInput value: string; length: number />` — presentational only (the mockups drive OTP entry via the on-screen `Keypad`, not a native text input, so `OTPInput` has no `onChange`; it just renders `value`'s digits into `length` cells with the next-empty cell focused-looking).
  - `<Keypad onDigit: (digit: string) => void; onBackspace: () => void />` — 0-9 plus a backspace key, standard 3-column numeric layout.

- [ ] **Step 1: Write the failing OTPInput test**

`src/components/forms/__tests__/otp-input.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OTPInput } from '@/components/forms/otp-input';

describe('OTPInput', () => {
  it('renders `length` cells', () => {
    render(<OTPInput value="12" length={6} />);
    expect(screen.getAllByRole('presentation')).toHaveLength(6);
  });

  it('shows entered digits in the filled cells with tabular-nums, blanks the rest', () => {
    render(<OTPInput value="12" length={6} />);
    const cells = screen.getAllByRole('presentation');
    expect(cells[0]).toHaveTextContent('1');
    expect(cells[0]).toHaveClass('text-numeric');
    expect(cells[1]).toHaveTextContent('2');
    expect(cells[2]).toHaveTextContent('');
  });

  it('exposes the current entry to assistive tech as a single accessible value', () => {
    render(<OTPInput value="12" length={6} />);
    expect(screen.getByLabelText('รหัส OTP ที่กรอกแล้ว 1 2')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/otp-input.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement OTPInput**

`src/components/forms/otp-input.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface OTPInputProps {
  value: string;
  length: number;
}

export function OTPInput({ value, length }: OTPInputProps) {
  const digits = value.split('');
  return (
    <div
      role="group"
      aria-label={`รหัส OTP ที่กรอกแล้ว ${digits.join(' ')}`}
      className="flex gap-2"
    >
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          role="presentation"
          className={cn(
            'flex h-12 w-9 items-center justify-center rounded-lg border text-heading text-numeric',
            i === digits.length ? 'border-primary' : 'border-border',
          )}
        >
          {digits[i] ?? ''}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/otp-input.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing Keypad test**

`src/components/forms/__tests__/keypad.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Keypad } from '@/components/forms/keypad';

describe('Keypad', () => {
  it('renders digits 0-9', () => {
    render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('calls onDigit with the pressed digit', async () => {
    const onDigit = vi.fn();
    render(<Keypad onDigit={onDigit} onBackspace={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '7' }));
    expect(onDigit).toHaveBeenCalledWith('7');
  });

  it('calls onBackspace from the backspace key', async () => {
    const onBackspace = vi.fn();
    render(<Keypad onDigit={vi.fn()} onBackspace={onBackspace} />);
    await userEvent.click(screen.getByRole('button', { name: 'ลบ' }));
    expect(onBackspace).toHaveBeenCalledOnce();
  });

  it('every key is a real 44px tap target', () => {
    render(<Keypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    expect(screen.getByRole('button', { name: '5' })).toHaveClass('tap-target');
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/keypad.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement Keypad**

`src/components/forms/keypad.tsx`:
```tsx
export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function Keypad({ onDigit, onBackspace }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="tap-target rounded-xl bg-surface text-heading text-numeric text-text"
        >
          {digit}
        </button>
      ))}
      <span aria-hidden="true" />
      <button
        type="button"
        onClick={() => onDigit('0')}
        className="tap-target rounded-xl bg-surface text-heading text-numeric text-text"
      >
        0
      </button>
      <button
        type="button"
        aria-label="ลบ"
        onClick={onBackspace}
        className="tap-target rounded-xl bg-surface text-text-2"
      >
        <span aria-hidden="true">⌫</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/keypad.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 9: Storybook story**

`src/components/forms/otp.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { OTPInput } from './otp-input';
import { Keypad } from './keypad';

const meta: Meta = { title: 'Forms/OTP' };
export default meta;

export const Composed: StoryObj = {
  render: () => {
    const [value, setValue] = useState('12');
    return (
      <div className="flex flex-col items-center gap-6">
        <OTPInput value={value} length={6} />
        <Keypad
          onDigit={(d) => setValue((v) => (v.length < 6 ? v + d : v))}
          onBackspace={() => setValue((v) => v.slice(0, -1))}
        />
      </div>
    );
  },
};
```

- [ ] **Step 10: Full suite, build, commit**

```bash
pnpm test && pnpm build
git add src/components/forms/otp-input.tsx src/components/forms/keypad.tsx src/components/forms/__tests__/otp-input.test.tsx src/components/forms/__tests__/keypad.test.tsx src/components/forms/otp.stories.tsx
git commit -m "feat: OTPInput and Keypad for auth verification"
```

---

### Task 17: CarrierPicker

Shipping-carrier selection, checkout flow.

**Files:**
- Create: `src/components/forms/carrier-picker.tsx`
- Create: `src/components/forms/__tests__/carrier-picker.test.tsx`
- Create: `src/components/forms/carrier-picker.stories.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces: `type Carrier = { key: string; name: string; etaLabel: string; priceLabel: string }`; `<CarrierPicker carriers: Carrier[]; selectedKey: string; onChange: (key: string) => void />`.

- [ ] **Step 1: Write the failing test**

`src/components/forms/__tests__/carrier-picker.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarrierPicker } from '@/components/forms/carrier-picker';

const carriers = [
  { key: 'kerry', name: 'Kerry Express', etaLabel: '1-2 วัน', priceLabel: '฿40' },
  { key: 'thaipost', name: 'ไปรษณีย์ไทย', etaLabel: '3-5 วัน', priceLabel: '฿30' },
];

describe('CarrierPicker', () => {
  it('renders every carrier with its eta and price', () => {
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={vi.fn()} />);
    expect(screen.getByText('Kerry Express')).toBeInTheDocument();
    expect(screen.getByText('1-2 วัน')).toBeInTheDocument();
    expect(screen.getByText('฿40')).toBeInTheDocument();
  });

  it('marks the selected carrier as checked via radio semantics', () => {
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /Kerry Express/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /ไปรษณีย์ไทย/ })).not.toBeChecked();
  });

  it('calls onChange with the clicked carrier key', async () => {
    const onChange = vi.fn();
    render(<CarrierPicker carriers={carriers} selectedKey="kerry" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: /ไปรษณีย์ไทย/ }));
    expect(onChange).toHaveBeenCalledWith('thaipost');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run src/components/forms/__tests__/carrier-picker.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement CarrierPicker**

`src/components/forms/carrier-picker.tsx`:
```tsx
import { cn } from '@/lib/cn';

export interface Carrier {
  key: string;
  name: string;
  etaLabel: string;
  priceLabel: string;
}

export interface CarrierPickerProps {
  carriers: Carrier[];
  selectedKey: string;
  onChange: (key: string) => void;
}

export function CarrierPicker({ carriers, selectedKey, onChange }: CarrierPickerProps) {
  return (
    <div role="radiogroup" aria-label="ผู้ให้บริการขนส่ง" className="flex flex-col gap-2">
      {carriers.map((carrier) => (
        <label
          key={carrier.key}
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-xl border p-3',
            carrier.key === selectedKey ? 'border-primary bg-primary-tint' : 'border-border',
          )}
        >
          <span className="flex items-center gap-3">
            <input
              type="radio"
              name="carrier"
              checked={carrier.key === selectedKey}
              onChange={() => onChange(carrier.key)}
              aria-label={`${carrier.name} ${carrier.etaLabel} ${carrier.priceLabel}`}
              className="h-5 w-5 accent-primary"
            />
            <span>
              <span className="text-label block text-text">{carrier.name}</span>
              <span className="text-body text-muted-text">{carrier.etaLabel}</span>
            </span>
          </span>
          <span className="text-label text-numeric text-text">{carrier.priceLabel}</span>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run src/components/forms/__tests__/carrier-picker.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Storybook story**

`src/components/forms/carrier-picker.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CarrierPicker } from './carrier-picker';

const carriers = [
  { key: 'kerry', name: 'Kerry Express', etaLabel: '1-2 วัน', priceLabel: '฿40' },
  { key: 'thaipost', name: 'ไปรษณีย์ไทย', etaLabel: '3-5 วัน', priceLabel: '฿30' },
  { key: 'flash', name: 'Flash Express', etaLabel: '1 วัน', priceLabel: '฿45' },
];

const meta: Meta<typeof CarrierPicker> = { title: 'Forms/CarrierPicker', component: CarrierPicker };
export default meta;
type Story = StoryObj<typeof CarrierPicker>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState('kerry');
    return <CarrierPicker carriers={carriers} selectedKey={selected} onChange={setSelected} />;
  },
};
```

- [ ] **Step 6: Full suite, build, and final CI-equivalent gate**

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm build-storybook
```
Expected: all five succeed.

- [ ] **Step 7: Commit**

```bash
git add src/components/forms/carrier-picker.tsx src/components/forms/__tests__/carrier-picker.test.tsx src/components/forms/carrier-picker.stories.tsx
git commit -m "feat: CarrierPicker for checkout shipping selection"
```

---

## Definition of done

M0 Components: Primitives is complete when all of the following hold:

- [ ] `pnpm test` passes, including every new component's test file
- [ ] `pnpm build` and `pnpm build-storybook` both succeed
- [ ] Every component in this plan has a Storybook story, viewable in both themes at 375/768/1440 via the M0 harness's toolbars
- [ ] No hex value appears anywhere outside `src/styles/tokens.css` (enforced by `src/__tests__/no-raw-hex.test.ts`)
- [ ] Every tappable icon-only control carries `.tap-target`
- [ ] Every price/countdown figure carries `.text-numeric`
- [ ] Every status/delta/badge pairs colour with text or an icon, never colour alone

## What this plan deliberately excludes

- **The 5 strategy-critical components** (`PriceProvenance`, `PriceChart`, `ConditionSelector`, `VerificationBadge`, `PhotoTierBadge`, `ReputationSummary`) and the checkout/cart/offer/deal-chat *domain* composition — these depend on real pricing, verification, and deal-state logic the spec describes in §7 and §6, and belong in a separate follow-on plan (`2026-08-23-m0-components-commerce.md`) written after this plan lands, so its tasks can compose `CardRow`'s `provenance`/`badge` slots and `DealRow`'s escrow/status contract rather than guessing at them.
- **Real navigation/routing** — `AppShell`'s `href`s are plain anchor hrefs; wiring them to Next.js `<Link>` and real routes is product-screen work, not component-library work.
- **The auth screens' full flow** (email/phone entry, split-screen desktop layout) — only the `OTPInput`/`Keypad` primitives used inside it.
- **Real connectivity detection** (`navigator.onLine` listener hook) — `OfflineBanner` takes `offline` as a prop; wiring a real hook is left to whichever plan first mounts it in the app shell.
- **Any M1+ backend, data-fetching, or persistence** — every component in this plan is presentational, driven entirely by props.
- **A real icon set.** Every icon in this plan's code (search, hamburger, cart, close, checkmark, lock, warning, chevrons, plus/minus, backspace, list/grid) is a plain Unicode/emoji character (`🔍`, `☰`, `🛒`, `✕`, `✓`, `🔒`, `⚠️`, `−`/`+`, `⌫`, `▦`) standing in for the mockups' actual stroke-based SVG line icons (visible directly in `TCGround Mobile.dc.html`, e.g. the search icon at `<svg ... stroke-width="1.8" ...><circle cx="11" cy="11" r="7"/><line .../></svg>`). This is a real, functioning choice — every test asserts on the icon's accessible name/role, not its glyph, so swapping emoji for real SVGs later doesn't touch a single test — but it is not the final visual language. A follow-up task (in this plan or the commerce plan) should extract the mockups' actual icon set into `src/components/icons/` and replace every emoji `<span aria-hidden="true">` in this plan's components with the matching SVG, one icon at a time, verified against the mockup file.
