# TCGround — UI Design Specification

**Status:** Draft for founder review
**Date:** 16 August 2026
**Companion to:** `2026-08-16-tcground-v1-design.md` (product spec)
**Scope:** Every user-facing and operator-facing surface across M1–M4.

This document specifies *what the interface must do and communicate*. It is not a visual comp. Every screen listed here traces to a requirement in the product spec.

---

## 1. Design principles

Derived from the strategy, not from taste. Each one resolves a real tension in the product.

| # | Principle | Consequence |
|---|---|---|
| **P1** | **Trust is visible, always** | Verification status, price provenance and reputation appear at every decision point — never buried in a profile page. The product's entire value proposition is trust; hiding it defeats the purpose. |
| **P2** | **Never present an estimate as a fact** | Seeded and estimated prices are visually distinct from settled ones. Systematically, via one component — not ad-hoc labels. |
| **P3** | **Friction arrives with money, never before** | Browse, search, price-check and portfolio all work logged out or with a phone number. ID upload appears only when value demands it. |
| **P4** | **The meetup screen is the hardest screen** | One hand, bad mall wifi, a stranger waiting, thousands of baht at stake. It gets the largest targets, the clearest states, and the most offline tolerance in the product. |
| **P5** | **Thai first, and properly** | Not translated English. Thai line-height, Thai wrapping, Thai numerals where expected, Thai-capable type. |
| **P6** | **Density serves the trader** | An active trader scanning 40 listings needs compact rows. A casual buyer needs cards. Both exist; the user picks. |
| **P7** | **Operator screens are product** | The admin console is used daily by a founder. It gets the same design attention as the buyer flow, because queue throughput is a business constraint. |

---

## 2. Design system

### 2.1 Style direction

**Accessible & Ethical / Marketplace-Directory.** High contrast, large type, obvious focus states, WCAG AA minimum and AAA where cheap.

Explicitly avoided: playful illustration, AI-purple/pink gradients, glassmorphism, decorative motion. This product asks people to hand over 30,000฿ to a stranger; it should read like a bank that likes cards, not a game.

### 2.2 Color tokens

Semantic tokens only. No raw hex in components.

**Light**

| Token | Hex | Use |
|---|---|---|
| `--primary` | `#2563EB` | Primary actions, links, active nav |
| `--primary-hover` | `#1D4ED8` | Hover/pressed |
| `--cta` | `#F97316` | Sell / List — the supply-side action, deliberately distinct from buy |
| `--bg` | `#F8FAFC` | Page background |
| `--surface` | `#FFFFFF` | Cards, sheets, modals |
| `--surface-alt` | `#F1F5F9` | Table stripes, inset panels |
| `--text` | `#1E293B` | Body |
| `--text-muted` | `#64748B` | Secondary — must still hit 4.5:1 |
| `--border` | `#E2E8F0` | Dividers |
| `--verified` | `#059669` | Verified badge, settled price, accept |
| `--warning` | `#D97706` | Estimates, unverified data, pending |
| `--danger` | `#DC2626` | Reject, dispute, destructive |
| `--info` | `#0284C7` | Neutral system messaging |

**Dark** — required, not optional. TCG communities skew heavily to dark mode and collectors browse at night.

| Token | Hex |
|---|---|
| `--bg` | `#0F172A` |
| `--surface` | `#1E293B` |
| `--surface-alt` | `#334155` |
| `--text` | `#F1F5F9` |
| `--text-muted` | `#94A3B8` |
| `--border` | `#334155` |
| `--primary` | `#60A5FA` |
| `--cta` | `#FB923C` |
| `--verified` | `#34D399` |
| `--warning` | `#FBBF24` |
| `--danger` | `#F87171` |

Dark is **desaturated tonal variants, not inverted values.** Contrast is verified independently in both themes.

**Color is never the only signal.** Verified always pairs with a shield icon and text. Estimated prices always carry a "~" prefix and a label. Accept/reject always carry icons.

### 2.3 Typography

⚠️ **Thai coverage is a hard requirement.** Many recommended UI fonts have no Thai glyphs.

| Role | Family | Notes |
|---|---|---|
| UI + body | **IBM Plex Sans Thai** | Thai + Latin in one family, 100–700, excellent numerals |
| Headings | **IBM Plex Sans Thai** 600 | One family keeps Thai/Latin rhythm consistent |
| Numerals / prices / tables | IBM Plex Sans Thai with `font-variant-numeric: tabular-nums` | Prevents column jitter in price tables |
| Mono | **IBM Plex Mono** | Set codes, cert numbers, transaction IDs |

Fallback family: **Noto Sans Thai** (broader weight range, if Plex's Thai rendering disappoints in testing).

**Thai-specific rules — these are not optional polish:**

- **Line-height minimum 1.7 for Thai body text**, versus 1.5 for Latin. Thai stacks vowels and tone marks above and below the baseline; 1.5 causes clipping and visual collision.
- **Thai has no inter-word spaces.** Browser line-breaking for Thai is unreliable. Use `word-break: normal` with `line-break: strict`, test wrapping on real card names, and never rely on `overflow-wrap: break-word` — it will break mid-syllable and produce nonsense.
- **Never truncate Thai mid-string** without an expand affordance. A truncated Thai phrase can read as a different word.
- Body minimum **16px** on mobile — also prevents iOS auto-zoom on inputs.
- Type scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40.

### 2.4 Spacing, radius, elevation

- **4/8px scale.** Section rhythm: 16 / 24 / 32 / 48.
- Radius: `sm 4` (inputs, badges) · `md 8` (cards) · `lg 16` (sheets) · `full` (avatars, pills).
- Elevation: 4 fixed levels — `0` flat, `1` cards, `2` dropdowns/popovers, `3` modals/sheets. No arbitrary shadow values.
- Container max-width `1280px`; card grids max `1440px`.

### 2.5 Iconography

**Lucide**, 1.5px stroke, 24px default (`16 / 20 / 24 / 32` tokens). SVG only.

**No emoji as icons, anywhere** — including badges, empty states and the admin console.

Reserved icon meanings, used consistently: `shield-check` verified · `alert-triangle` unverified/estimate · `scan-line` meetup check-in · `camera` photo protocol · `trending-up/down` price movement · `gavel` dispute.

### 2.6 Motion

150–300ms, `ease-out` entering, `ease-in` exiting, exit ~65% of enter duration. `transform` and `opacity` only.

`prefers-reduced-motion` fully respected. Price chart renders its final state immediately; entrance animation is decoration and gets dropped.

**One rule specific to this product:** escrow state transitions never animate away confirmation. When funds release, the confirmation is a persistent state on screen, not a toast that vanishes in 4 seconds.

---

## 3. Information architecture

### 3.1 Navigation

**Mobile (< 768px)** — bottom nav, max 5, icon + label always:

`ค้นหา` Search · `พอร์ต` Portfolio · `ลงขาย` Sell (CTA-coloured) · `ดีล` Deals · `บัญชี` Account

**Desktop (≥ 1024px)** — top bar: logo, persistent search field, `ลงขาย` button, account menu. No sidebar on public surfaces.

Rules: current location always visually marked; back always restores scroll position and filter state; every card, listing and set is deep-linkable.

Nav items requiring an account show, prompting sign-in on tap — never hidden. Hiding them conceals what the product does.

### 3.2 URL structure

SEO is infrastructure. URLs are a design surface.

```
/                                  Home — search-first
/card/[set-code]/[number]/[slug]   Card detail (the SEO page)
/set/[set-code]                    Set browse
/search?q=&game=&set=&rarity=
/portfolio  /portfolio/[holding]
/listing/[id]
/sell  /sell/new
/user/[handle]
/deal/[id]                          Transaction
/deal/[id]/meetup                   Check-in surface
/admin/*                            noindex
```

---

## 4. Screens — M1 Catalog & Price Index

### 4.1 Home

**Purpose:** search is the CTA.

- Oversized search field, autofocus on desktop, **not** on mobile (avoids keyboard covering the page on load)
- Popular searches, trending cards, recently added sets
- Trust strip: what the platform does — verified sellers, escrow, real price data
- No listings in M1; do not fake them

**States:** default · typing (suggestions) · no results.

### 4.2 Search results

- **Two density modes, user-toggled and remembered** (P6): compact rows for traders, card grid for browsers
- Filters: game, set, rarity, language, condition, price range. Mobile → bottom sheet with a sticky "แสดงผล (N)" apply button; desktop → left rail.
- Active filters as removable chips above results
- Each result: thumbnail, Thai + English name, set + number, rarity, **price index with provenance**, listing count (M3+)
- Virtualised list beyond 50 items; skeletons, never spinners

**Zero-result state is a feature, not a dead end.** Show closest matches, then "ไม่พบการ์ดนี้? แจ้งเรา" → logs to the gaps queue. This is free demand data (§5.1 of the product spec).

### 4.3 Card detail — the most important page in the product

Server-rendered. This is the SEO surface, the price reference, and later the conversion point.

**Order on mobile:**

1. **Card image** — tappable to full-screen zoom, pinch supported
2. **Identity block** — Thai name (primary), English name, Japanese name, set, number, rarity, language, artist
3. **Price block** ← the reason the page exists
   - Headline index price, large, tabular numerals
   - **Provenance component** directly beneath (§6.1) — never separated from the number
   - Change indicator with arrow icon plus sign, never colour alone
   - Per-condition breakdown table; rows with no data show "~" estimates, visually distinct
   - Chart (§6.2)
4. **Printing switcher** — sibling printings as a horizontal chip row. Critical: users land here from Google on the wrong printing.
5. **Live listings** — empty-slot component in M1 stating listings arrive soon. Built now, populated in M3.
6. **Report a correction** — low-emphasis, always present

**Desktop:** two columns — image and identity left, price and chart right, listings full-width below.

### 4.4 Set browse

Grid of cards in a set, completion indicator if the user has a portfolio (M2+), sort by number / rarity / price.

### 4.5 Correction submission

Modal, three fields max: what's wrong (enumerated), correct value, optional photo. Anonymous. Confirmation states it goes to a human, with no SLA promised.

---

## 5. Screens — M2 Portfolio

### 5.1 Portfolio overview

- **Header stat block:** total value, total cost basis, unrealised gain/loss in ฿ and %, card count
- **Value-over-time chart** (§6.2)
- Holdings list — image, name, condition, quantity, current value, **two separate indicators**:
  - **Deal quality** — how the purchase compared to market *at the time*
  - **Appreciation** — change since purchase
- Sort: value, gain, recent, name. Filter by game and set.

**⚠️ These two numbers must never be merged into one.** A card bought 20% under market that has since fallen 30% is a good buy and a loss. Label them distinctly; a shared colour scale implies they measure the same thing.

**Empty state:** explain what a portfolio does, offer both "add your first card" and "import CSV."

### 5.2 Add holding

From a card page in one tap, pre-filled. Fields: condition (enumerated, with the same definition popover used in listing), quantity, acquired price, acquired date, notes.

Live feedback as they type the price: *"ต่ำกว่าราคาตลาดในวันนั้น 18%"* — instant value, and it teaches the index's usefulness at the moment of first contact.

Where the index had no coverage on that date, show an explicit "ไม่มีข้อมูลราคาในช่วงนั้น" state. **Never fabricate a benchmark.**

### 5.3 CSV import

Upload → **column mapping UI** → validation preview showing matched/unmatched rows → confirm. Unmatched cards are listed for manual resolution, never silently dropped.

### 5.4 Price alerts

Per-card toggle with a threshold. A single management list under Account. Email in M2.

---

## 6. Shared components — the ones that carry the strategy

### 6.1 `PriceProvenance` — the most important component in the product

Every price displayed anywhere carries one. No exceptions. This is P2 made concrete.

| Variant | Trigger | Visual |
|---|---|---|
| **Settled** | ≥3 platform-settled transactions | `shield-check`, `--verified`, "จากการซื้อขายจริง N รายการ" |
| **Thin** | 1–2 settled | `shield-check` muted, "ข้อมูลน้อย — N รายการ" |
| **Observed** | Facebook archaeology | `alert-triangle`, `--warning`, "ประมาณการจากประกาศ N รายการ" |
| **Comp** | International comparable | `alert-triangle`, `--warning`, "อ้างอิงราคาต่างประเทศ" |
| **Estimated** | Condition-normalised, no direct data | "~" prefix on the number, "ประมาณการจากสภาพอื่น" |
| **None** | No data | "ยังไม่มีข้อมูลราคา" — never show ฿0 |

Tappable → explains the methodology in plain Thai. Credibility with a sceptical community is won by showing the work.

### 6.2 `PriceChart`

**Line chart with area fill.** Not candlestick — there is no OHLC data, and the accessibility grade is poor.

- Ranges: 30d / 90d / 1y / All. Default 90d.
- **Settled and estimated data are visually separated** — solid line for settled, dashed for seeded/estimated. Line style, not colour alone.
- **Vertical marker at the date platform-settled data begins.** This makes the known basis discontinuity (product spec §4.3) legible instead of looking like a price jump.
- Tap/hover tooltip: date, price, condition, source.
- Y-axis ฿ with locale formatting; sparse ticks on mobile.
- **Data-table toggle** — required for screen readers, and traders genuinely want it.
- Empty state: "ยังไม่มีข้อมูลเพียงพอ" with an explanation. Never an empty axis frame.
- Recharts (SVG) up to 1000 points; aggregate beyond.

### 6.3 `ConditionSelector`

Enumerated, never free text. Five options (NM / LP / MP / HP / DMG), each showing its Thai definition and an example photo **at the moment of selection**, not behind a help link.

Reused identically in listing creation, portfolio add, and search filters — one component, one vocabulary.

### 6.4 `VerificationBadge`

| Tier | Display |
|---|---|
| Basic | none |
| Bank-verified | `shield` outline, "ยืนยันบัญชีธนาคาร" |
| ID-verified | `shield-check` filled, `--verified`, "ยืนยันตัวตนแล้ว" |

Appears on profile, listing card, listing detail, search results, and the meetup screen. Tappable → what the badge means and what was checked.

### 6.5 `PhotoTierBadge`

None / "รูปครบ" / "รูปครบตามมาตรฐาน". Tappable → which shots were required and provided.

### 6.6 `ReputationSummary`

Completed deals · no-shows · rejections given · dispute rate · tenure. Compact inline variant and expanded profile variant.

Counts are shown with denominators — "2 จาก 47" not "2". A raw number without context is unreadable as risk.

---

## 7. Screens — M3 Listings & Identity

### 7.1 Sign-up

Phone or email only. One field, one code. **No name, no address, no ID.** Bank details are requested later, when selling — not here (P3).

### 7.2 Verification

**Triggered by intent, never by signup.** Three entry points: crossing the 10,000฿ listing threshold, attempting to buy a "verified buyers only" listing, or voluntarily from Account.

**Design requirement:** the interstitial must state *why* verification is being asked for, *what* will be checked, *who* checks it, and *what the platform stores*. Specifically: "เราไม่เก็บภาพบัตรประชาชนของคุณ" — the platform never stores ID documents (product spec §7.1). This is both a genuine differentiator and the PDPA position; it should be stated where the user is deciding, not in a privacy policy.

**Flow:** explainer → hand-off to PSP or eKYC provider (hosted) → return → pending state → webhook resolves.

**States:** not started · in progress · pending review · verified · rejected. `pending` must be a real, honest screen — these checks are not instant, and a spinner that runs for two hours destroys trust.

Sellers hitting the threshold see a **non-blocking** prompt: the listing saves as a draft and publishes automatically on verification. Never lose their work.

### 7.3 Listing composer

Steps, with a progress indicator and back navigation at every point:

1. **Find the card** — same search component. If not found: "แจ้งเพิ่มการ์ด" → gaps queue, **listing saved as draft**. Never a dead end (product spec §7.2).
2. **Condition** — `ConditionSelector`, or graded path (company / grade / cert number, quantity locked to 1)
3. **Photos** — guided capture (§7.4)
4. **Price and quantity** — live market comparison, **net proceeds always visible**: "ลงขาย ฿540 · คุณจะได้รับ ฿497". Quantity > 1 only for raw, single-condition listings, with the batch-photo disclosure.
5. **Review and publish**

**Underpricing warning** — if far below index, an inline non-blocking warning before publish. It protects honest sellers from mistakes and signals to fraudulent ones that the platform is watching.

**Auto-save drafts throughout.** A trader listing 40 cards on mobile will be interrupted.

**Bulk mode:** shared fields (game, set, condition, photo style) entered once, then a rapid add loop. This is the trader's core workflow — it should feel like a queue, not a form repeated 40 times.

### 7.4 Guided photo capture

- One shot at a time, with an **on-screen frame overlay** showing the required angle
- A reference illustration of the target shot beside the viewfinder
- Progress dots for the required set
- Immediate retake option; no batch-review-at-the-end
- **Required shots vary by price tier** (product spec §4.6) — the UI states the tier and what earning the next badge would require
- Raking-light shot includes a plain-Thai explanation of why it matters (it reveals holo pattern and print texture, where fakes fail)

Upload is resilient: progress per photo, retry on failure, and the draft survives a dropped connection.

### 7.5 Listing detail

Photos in a swipeable gallery with zoom · card identity linking back to the card page · condition with definition · price with market comparison · **seller block** (badge, reputation, tenure) · quantity available · buy action.

For quantity > 1: an explicit "รูปเป็นตัวอย่าง — คุณจะได้รับ 1 ใน N ใบ" notice adjacent to the gallery, not in fine print.

"Verified buyers only" listings show the requirement **before** the buy action, with a route into verification — never a rejection after the fact.

### 7.6 Seller profile

Verification badge, reputation summary, tenure, active listings, completed-sale history. Rejection rate shown for buyer behaviour, deal history for seller behaviour.

---

## 8. Screens — M4 Escrow & Settlement

**P4 governs this section.** Every screen here is used one-handed, in a mall, with a stranger waiting.

### 8.1 Commit to escrow

- Order summary: card, condition, quantity, price
- **Buyer pays exactly the listed price.** No fee line, no surprise at the last step.
- Method selection: face-to-face or shipped
- Plain-Thai explanation of how escrow protects them, and **what happens if they reject**
- Expiry disclosed up front: 48h to schedule, 5 days total
- For shipped: the unboxing-video requirement is stated **here**, at commit, not discovered at dispute time

### 8.2 Deal screen — the transaction hub

One persistent URL per deal, with a **state machine made visible**: a stepper showing where the deal is, what happens next, and the deadline for the current step.

States rendered distinctly: `committed` · `scheduling` · `scheduled` · `checked_in` · `settled` · `refunded` · `expired` · `disputed`.

**Countdown timers are prominent, not decorative.** A buyer with funds committed needs to know they have 31 hours left to schedule.

### 8.3 Meetup scheduling

Propose time and place · suggested public venues (malls, card shops, tournament venues) with map links · both parties confirm · calendar export · both profiles and badges visible throughout.

### 8.4 Check-in — the highest-stakes screen

**Design constraints, all non-negotiable:**

- Works on poor connectivity. QR generation and scanning are local; only confirmation needs the network.
- **Maximum size targets.** Scan is a full-width primary action.
- Screen brightness boosted while displaying the QR
- Unambiguous state: waiting for the other party / both checked in / confirmed
- **No accidental irreversible taps.** Accept and Reject are separated spatially, not adjacent, and Reject requires a confirmation step.
- Clear "something went wrong" route to support at all times
- Both parties' names and verification badges displayed — the buyer should be able to confirm they're meeting the right person

### 8.5 Inspect — accept or reject

- Checklist prompt of what to verify, drawn from the photo protocol
- **Accept** → confirmation, then a persistent settled state. Funds release is stated plainly: "โอนให้ผู้ขายแล้ว"
- **Reject** → required structured reason code (condition mismatch / suspected counterfeit / not as described / changed mind), then confirmation
- Before the reject confirmation, disclose that the rejection is recorded on their public profile. This is the deterrent from S5 — it only works if the buyer sees it *before* deciding.

### 8.6 No-show

Reported by the present party after a grace period → auto-refund → **24h response window for the absent party** → operator decision. The UI must make clear that **no strike is recorded yet** and the other party can respond. Presumption of guilt in the interface would be a design lie about how the system works.

### 8.7 Shipped flow

Seller enters tracking · buyer sees carrier status · delivery starts a visible 48h inspection countdown · accept or auto-release · dispute requires the unboxing video, with the upload flow stated in advance.

### 8.8 Dispute (user side)

Structured evidence submission with deadlines, not a message thread. Upload photos and video against named evidence slots. Status is always visible. Outcome is explained, not just announced.

---

## 9. Admin & operator console

Used daily by a founder who does not code. Throughput is a business constraint (P7).

### 9.1 Shell

Persistent left sidebar (desktop-first — this is a laptop tool): Dashboard · Catalog · Corrections · Gaps · Disputes · Manipulation · Users.

**Queue counts as badges in the nav.** The operator's first question every morning is "what's waiting for me."

### 9.2 Catalog manager

- Table with instant search, including unpublished records
- Inline editing on the row where possible; full editor for complex changes
- **Bulk CSV import: upload → validate → dry-run diff → confirm → rollback available.** The diff view is the most important screen in the console — it must show added, changed and unchanged counts, with changed rows expandable field-by-field.
- Set and printing management
- **Alias editor** — fast keyboard-driven add. This is where a decade of market knowledge is entered; it should feel like typing a list, not filling a form.
- Image upload with drag-and-drop batch
- Audit log per record, with revert

### 9.3 Corrections queue

Submitted value beside current value, diff highlighted, submitter evidence inline. Three actions: accept / edit and accept / reject. Keyboard shortcuts. **Target: under 15 seconds per item.**

### 9.4 Gaps queue

**Ranked by zero-result search volume** — the most-demanded missing card at the top, with its search count. "Create card" pre-fills from the search term. This turns an operational chore into a demand-driven work queue.

### 9.5 Dispute console

**Single screen. Target under 10 operator-minutes per dispute** (product spec §8.2).

Layout: listing photos and evidence media left · full transaction event log centre, chronological · both parties' reputation and history right · decision bar fixed at the bottom.

Three actions: release · refund · split. Each requires a reason note. Templated Thai responses. Outcome writes to both profiles automatically.

### 9.6 Manipulation watch

Flagged patterns: circular trades, implausible price movement, repeated same-pair transactions. Lowest priority — deferred until the index has enough authority to be worth gaming.

---

## 10. Cross-cutting states

Every data surface specifies four states. A screen without them is an incomplete spec.

| State | Rule |
|---|---|
| **Loading** | Skeletons matching final layout. Spinners only for actions under 1s. Reserve space — CLS < 0.1. |
| **Empty** | Explain what belongs here and give the action that fills it. Never a bare "no data". |
| **Error** | State the cause and the recovery path. Retry always available. |
| **Offline** | Cached catalog content stays readable. Transaction actions clearly disabled with an explanation — never silently failing. |

**Destructive and irreversible actions** — reject, dispute, delete listing, cancel deal — always confirm, always use `--danger`, always sit apart from the primary action.

**Toasts** auto-dismiss in 3–5s, use `aria-live="polite"`, never steal focus, and are **never the only record of a money event.**

---

## 11. Accessibility — non-negotiable

Beyond WCAG AA baseline, the items this product gets wrong most easily:

- [ ] Contrast 4.5:1 body, 3:1 large — **verified independently in light and dark**
- [ ] Visible 3–4px focus rings; focus never removed
- [ ] Touch targets ≥ 44×44px, ≥ 8px apart
- [ ] Colour never the sole signal — verification, price movement, accept/reject, chart series all carry icon, text or line style
- [ ] Every chart has a data-table equivalent
- [ ] Form errors below the field, `role="alert"`, first invalid field auto-focused
- [ ] Icon-only buttons carry `aria-label` in Thai
- [ ] `prefers-reduced-motion` respected throughout
- [ ] Sequential heading hierarchy — also SEO-critical
- [ ] Text scales to 200% without layout breakage; **test Thai at maximum scale**, where tone marks and line-height break first

---

## 12. Responsive

Breakpoints: **375 / 768 / 1024 / 1440.** Mobile-first.

| Surface | Mobile | Desktop |
|---|---|---|
| Search filters | Bottom sheet + sticky apply | Left rail, always visible |
| Card detail | Single column, price above the fold | Two column |
| Results | Rows or 2-col grid | 3–5 col grid |
| Deal screen | Full-screen steps | Centred, max 720px |
| Check-in | Full-screen, max targets | Mobile layout retained — nobody meets with a laptop |
| Admin | Read-only fallback | Full console, desktop-first |

No horizontal scroll at any width. `min-h-dvh`, never `100vh`. Landscape supported — phones get rotated at meetups.

---

## 13. Localisation

- Thai default, English switchable, preference persisted
- Currency `฿1,234` with tabular numerals; never mix `฿` and `บาท` in one view
- Dates: Thai Buddhist era in user-facing copy, ISO in the admin console
- Card names always show both Thai and original-language names — collectors search in both, and the original name is the canonical identifier
- **All copy written in Thai first, then translated to English.** Translated-from-English Thai reads as foreign and undermines P5.

---

## 14. Handoff checklist

Before any screen is considered designed:

- [ ] All four states specified (loading / empty / error / offline)
- [ ] Renders correctly at 375px and in landscape
- [ ] Verified in both light and dark themes
- [ ] Thai copy tested at longest realistic length and at 200% text scale
- [ ] Touch targets and spacing verified
- [ ] Every price carries a `PriceProvenance`
- [ ] Every user reference carries a `VerificationBadge` where relevant
- [ ] One primary CTA per screen
- [ ] Destructive actions separated and confirmed
- [ ] Keyboard-navigable end to end
- [ ] No emoji icons

---

## 15. Open design questions

1. Default density on search results — trader-compact or browser-grid? Resolve with your partner; it signals who the product is for.
2. Whether portfolio value should be hideable — collectors may be reluctant to display totals on a phone in public.
3. Meetup venue list — curated by you, or crowd-suggested with moderation?
4. Whether rejection rate is shown as a raw count or a percentage. A percentage is fairer to high-volume buyers; a count is harder to game.
5. Onboarding for the price index — does a first-time visitor need an explainer, or does the provenance component carry it alone?
