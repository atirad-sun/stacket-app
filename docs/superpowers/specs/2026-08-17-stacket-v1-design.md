# stacket v1 — Design Specification

**Status:** Draft for founder review
**Date:** 17 August 2026
**Supersedes:** `2026-08-16-tcground-v1-design.md` and `2026-08-16-tcground-ui-design-spec.md`. Both stay on disk as history.
**Extends:** `files/01`–`files/04`, which remain accurate except where §2 records a change.
**Companion:** `docs/2026-08-17-understanding-and-reconciliation.md` — the source reconciliation this document is built on.
**Scope:** All of v1, delivered as five milestones.

---

## 1. Context

stacket is a trust-layer marketplace for trading-card collectors in Thailand, replacing buy/sell/escrow activity currently running through Facebook groups.

The market's growth is capped by trust, not demand. Listings are unstructured free text, so cards are not searchable. There is no shared price reference, so pricing is inconsistent. Sellers are unverified, so every purchase carries counterparty and counterfeit risk. Above 10,000฿, a group admin acts as manual escrow — a single human bottleneck and a single point of fraud.

The answer is structured peer-to-peer: a real card catalog with settled-price history, verified identity, standardised condition and photo evidence, and escrow via a licensed payment provider — with the buyer inspecting the card in person or in a delivery window, so the platform never takes custody of cards or money.

**Deliberate premise:** cards are non-fungible and condition variance *is* the market. Per-item listings with rich condition evidence, never an interchangeable-SKU order book.

**Team.** Two founders. One owns catalog data, market knowledge and operations — ten years in the industry, does not code. One owns engineering, working with AI assistance. Phase gates are the only clock.

---

## 2. Decisions

### 2.1 Carried forward from 16 August

| # | Decision |
|---|---|
| S1 | Portfolio pulled forward — it is the cheapest retention surface and doubles as listing inventory |
| S2 | Catalog built by import + manual gap-fill |
| S3 | Seller-side commission, 5–8%, split at settlement |
| S4 | Price index records the price the buyer paid — gross basis |
| S5 | Rejection costed by reason code + public rejection rate. Social cost, no money movement, no operator queue |
| S6 | No-show: mutual scan + 24h grace, then operator. No automatic strikes |
| S7 | Escrow expiry: 48h to schedule, 5d hard, both configurable — **amended by N11 to 4d hard** |
| S8 | Next.js + Postgres, one repo, Thai-first |
| S9 | Value-tiered photo requirements replace the flat 6-shot gate |
| S10 | Bulk lots — `quantity > 1` for identical raw cards |
| S11 | Admin tool ships *with* the catalog, not after |
| S12 | Three verification tiers, applied to both sides of the market |
| S13 | Verified-to-verified required above 10,000฿ |

### 2.2 New, 17 August

| # | Decision | Rationale |
|---|---|---|
| **N1** | **Both settlement lanes.** Shipped built first, face-to-face added on top | The mockups design the shipped lane completely; face-to-face is the cheapest possible authentication mechanism — a motivated expert inspecting their own purchase at zero operational cost — and the market trades same-day |
| **N2** | **Non-custodial.** The PSP holds funds; the platform never does | Holding funds triggers Thai payment-services and escrow licensing. Mockup escrow copy is rewritten to name the PSP |
| **N3** | **Full v1 planned, M0–M4** | Founder's call. M4 is planned behind the payment adapter; the legal track runs parallel from week 1 |
| **N4** | **stacket brand and mockup token set, verbatim** | Newest artifact, pixel-complete. The old UI spec's colour and type sections are superseded; its principles, component contracts and accessibility requirements survive |
| **N5** | **Offers, deal-scoped chat and cart all kept** | Reinstated from PRD non-goals, each scoped narrowly — see §6 |
| **N6** | **Tailwind reading the mockup's CSS custom properties.** Own component library, no shadcn | One source of colour. The mockups are already a complete visual system |
| **N7** | **Five games in the UI, two populated** | Keeps the mockup's home screen honest without committing the partner to 4× the data entry before A1 is tested |
| **N8** | **Design system is its own milestone (M0)** | Mockup components are reused ~40× across four milestones. Porting once, with accessibility built in, beats extracting under pressure in M3 |
| **N9** | **Buyer pays listed price + shipping. No payment-fee line** | Shipping is a real physical cost; hiding it invites underpriced-listing-plus-inflated-postage gaming. The platform's payment cost belongs in the seller-side commission. **The price index records the item price only, never postage** |
| **N10** | **Escrow is card-only. PromptPay cannot be escrowed** | PromptPay is a real-time credit push — there is nothing to hold and no authorisation to capture. Delayed capture, the mechanic the entire non-custodial position rests on, does not exist for it. See §8.5 |
| **N11** | **Hard escrow expiry drops from 5 days to 4** | Visa's merchant-initiated authorisation window is 4 days 18 hours, and Stripe classifies MIT vs CIT from cardholder-participation signals rather than API parameters. A 5-day rule can outlive the authorisation it depends on. Amends S7 |

### 2.3 Changes required to existing documents

| Doc | Change |
|---|---|
| `04` §1 | Evidence quality is n=2, one with ten years' industry experience. A6 is weaker than stated |
| `02` §5.5 | Offer-based selling reinstated explicitly (it was already permitted; the mockups make it concrete) |
| `02` §5.6 | Deal-scoped chat reinstated, narrowly — see §6.2 |
| `02` §8.4 | Flat six-shot gate → value-tiered requirements |
| `02` §8.5 | Two tiers → three, applied to both sides |
| `02` §8.7 | Add explicit index basis (gross) and the provenance model |
| `02` §13 | Phasing → the five milestones in §3 |
| `03` §2 | Three open settlement decisions resolved (S5, S6, S7) |
| `01`, `02` | Add PDPA as a compliance requirement |
| All | Product name is **stacket** |

---

## 3. Milestones

Development is continuous. M0 is internal; users see four public releases. No milestone is throwaway.

| # | Milestone | Contains | Gate to proceed |
|---|---|---|---|
| **M0** | Design system | Token layer, component library, accessibility baseline, Thai typography, four-state contract, Storybook | Every component renders in both themes at 375/768/1440 and passes AA |
| **M1** | Catalog & price index | Card database, search, filters, card pages, seeded prices, admin console | **A1** — returning weekly users |
| **M2** | Portfolio | Holdings, valuation, deal quality, alerts | Weekly returning users with a portfolio |
| **M3** | Listings & identity | Accounts, three-tier verification, listings, photo tiers, condition standard, reputation | **A2 + A4** |
| **M4** | Offers, deals & settlement | Offers, cart, chat, PSP integration, both settlement lanes, disputes, operator console | **Legal clearance — blocking** |

M1 and M2 require no accounts holding money, no legal clearance, and no other users. They are useful with a single visitor.

**M3 ships listings without on-platform settlement.** Listings are published, searchable and attached to card pages, but there is no way to buy through the product until M4 clears legal. Deals discovered on stacket close off-platform in the interim, exactly as they do on Facebook today — the product is still doing its job (making cards findable, priced and attributable to a verified identity) while the settlement layer waits on the lawyer. Listing fields that only matter once money moves — `accepts_offers`, `verified_buyers_only` — are captured in M3 and take effect in M4.

### 3.1 Parallel tracks

- **Data track** (partner) — week 1 to indefinitely. Import, gap-fill, price seeding, then the corrections and gaps queues.
- **Build track** (engineer) — M0 → M1 → M2 → M3 → M4.
- **Legal track** (both) — **starts week 1.** PSP selection *first*, because the lawyer cannot opine in the abstract; then escrow structure, eKYC vendor, PDPA. Longest lead time in the project. Gates M4 entirely.

---

## 4. Domain model

### 4.1 Core hierarchy

```
Game            Pokémon, One Piece, Yu-Gi-Oh!, Magic, Lorcana
  └─ Set        language, set_code, release_date, region
       └─ Card  collector_number, name_th, name_en, name_ja, rarity, artist
            └─ Printing   normal | holo | reverse_holo | 1st_edition |
                          unlimited | promo_stamp | ...
```

**Language belongs to `Set`, not `Card`.** Japanese sets are not translations of English sets — different codes, numbering, cadence and contents. There is no meaningful cross-language card link for most of the catalog, and no cross-language price merging, ever. This falls out of the model for free.

**`Printing` is the tradeable unit.** Listings, holdings, offers and price points attach to `Printing`, never to `Card`. A reverse-holo and a normal printing are different objects with different prices. Getting this wrong makes the index worthless with no cheap migration.

**Game population state.** Each `Game` carries a `status` — `populated` | `coming_soon`. Coming-soon games appear in navigation and on the home screen with an explicit state, never as an empty result set (N7).

### 4.2 Price index

**Storage:** every price point at `(printing, condition)`.

**Computation:** headline index at `printing` level, condition-normalised via a multiplier table (NM / LP / MP / HP / DMG). Per-condition breakdown displayed only where real data exists; elsewhere the normalised estimate, labelled as an estimate.

The reason for normalising rather than showing five series: G2 targets ≥3 settled points per top-500 card in 90 days. Split five ways that is effectively ≥15, in a market with explicitly low transaction frequency. Most buckets will be empty.

**Graded cards are a separate index**, keyed `(printing, grading_company, grade)`. A PSA 10 does not belong in the same series as a raw NM.

**Basis: gross — the price the buyer paid for the item.** Commission is deducted from the seller's proceeds and is not subtracted from the recorded price. **Shipping is excluded** (N9) — an index that moves with postage rates is not a card price index. This matches TCGplayer, Cardmarket and StockX, which are the seed comps.

Every transaction stores `item_price`, `shipping`, `commission`, `net_to_seller`. A net-basis series can be computed later without re-auditing history.

**A bulk sale is one price observation, not N.** Otherwise a single 5-unit sale swamps the index for that card.

**Snapshot retention.** The daily index snapshot (§10.4) is per printing per day — at 100k printings that is ~36M rows a year, growing forever. Unbounded, it becomes the largest table in the database and forces a hosting tier the budget does not have.

- Daily granularity retained for **90 days**
- Downsampled to **weekly** beyond 90 days
- Table **partitioned by month**, so old partitions drop cheaply

M2's deal-quality lookup needs the index value on a single historical date, and weekly resolution past a quarter costs that feature nothing. Decide this before the first snapshot is written; retrofitting means reprocessing every row.

### 4.3 Provenance

Every price point carries:

- `source` — `platform_settled` | `facebook_observed` | `international_comp` | `operator_entered`
- `confidence`

**Only `platform_settled` counts toward the authoritative index.** Everything else is labelled unverified in the UI — visibly, not in a footnote.

Two reasons this must exist before the first row is written: credibility with a community that will immediately test whether the prices are real, and the manipulation wall, which cannot be retrofitted without re-auditing every historical row.

**Known basis discontinuity.** `facebook_observed` rows carry no commission; `platform_settled` rows are gross of a commission sellers may partly pass through. Mitigations: the two sources are already visibly distinct series; the chart marks the date platform-settled data begins; underpricing fake-detection thresholds are calibrated per source rather than globally.

### 4.4 Search

**Postgres full-text search does not work for Thai.** Thai script has no inter-word spaces, so `tsvector` tokenises a Thai card name into one meaningless token. This threatens G1 and the SEO wedge.

**`pg_trgm` trigram similarity** — language-agnostic, tolerant of typos and transliteration variance, no word segmentation required. Plus:

- **`card_aliases`** — nicknames, community shorthand, transliterations, common misspellings. Populated by the partner through the admin console. Ten years of knowing what people actually call cards, encoded as a feature.
- **Direct `set_code + collector_number` lookup** — serious traders search `SV1a 123`, not names.

All search behind a single module interface, so swapping to Meilisearch or Typesense is one file.

### 4.5 Listings

One listing = one physical card, or one batch of identical cards.

- `printing`, `condition` **or** `grading` (mutually exclusive), price, photos, seller, status, shipping options
- **`quantity`** — default 1. `> 1` permitted only for **raw** cards at a **single declared condition**
- **Graded listings are always `quantity = 1`** — every slab has a unique cert number
- Above a value ceiling `[TBD — partner]`, quantity is forced to 1
- Batch photos are labelled representative: *"รูปเป็นตัวอย่าง — คุณจะได้รับ 1 ใน N ใบ"*
- Buyers may purchase a partial quantity; the listing decrements under a row lock so two buyers cannot take the same copy
- `accepts_offers` — boolean, seller-controlled, shown in the mockup's sell flow
- `verified_buyers_only` — boolean, seller-controlled (§8.1)

### 4.6 Photo protocol — value-tiered

| Listing price | Required | Badge |
|---|---|---|
| Under ~1,000฿ | Front + back | — |
| 1,000–10,000฿ | Front, back, 4 corners | รูปครบ |
| Over 10,000฿ | Full 6-shot incl. raking light | รูปครบตามมาตรฐาน |

Thresholds `[TBD — partner]`. The badge is a seller quality signal, **not a publication gate** — any seller may voluntarily upgrade a listing to earn it. Counterfeit risk scales with value, so evidence requirements should too. A flat six-shot gate means forty cards × six shots = 240 photos, and that seller returns to Facebook.

### 4.7 Offers

`Offer` is a first-class entity, not a listing mutation.

- `listing`, `buyer`, `amount`, `expires_at`, `status`, `parent_offer_id`
- **Counter-offers are a chain**, never an edit. `parent_offer_id` links them. Negotiation history is dispute evidence.
- Expiry default 24h, configurable. Expired offers render as their own state, distinct from declined.
- Accepting an offer is what brings a `Transaction` into existence. So is buying outright.
- An offer does not reserve stock. Two accepted offers on a `quantity = 1` listing is resolved by the same row lock as direct purchase; the loser is told the card is gone, not left in limbo.

### 4.8 Cart and transactions

**A cart is a client-side basket with no server identity.** It never becomes an order. There is no order object, ever.

At checkout it splits into **one `Transaction` per seller**, each with its own PSP authorisation, shipping, inspection window and state machine. Two sellers means two independent deals that can diverge — one settles, one disputes. The checkout summary therefore shows a per-seller breakdown, and the confirmation screen hands the buyer N deals, not one order.

**`Transaction`** — append-only event log (§8.4). Nothing updates in place. Stores `item_price`, `shipping`, `commission`, `net_to_seller`, PSP object references, settlement lane.

### 4.9 Other entities

**`Holding`** (M2) — `printing`, `condition`, quantity, acquired price, acquired date, notes. Converts to a listing in one tap in M3.

**`Thread`** (M4) — attaches to an `Offer` or a `Transaction`. Never to a user pair. See §6.2.

**`User`** — verification tier, reputation counters (completed, no-shows, rejections given, disputes), tenure. Never editable, never transferable.

---

## 5. M0 — Design system

Its own deliverable (N8). No product screens.

### 5.1 Token layer

Lifted verbatim from the mockups' `[data-theme="light"|"dark"]` custom properties. Tailwind is configured to read those properties, so there is exactly one source of colour and theming ports over unchanged.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0A0E16` | Page/card background |
| `--surface` | `#F3F5F8` | `#151B26` | Sunken fills, chips, rows |
| `--border` | `#E4E7EC` | `#232B38` | Hairlines, dividers |
| `--text` → `--muted` | `#0B0D12` → `#606A7C` | `#F1F5F9` → `#64748B` | Text hierarchy |
| `--primary` / `--accent` | `#00A98A` / `#00907A` | `#00A98A` / `#2DD4BF` | CTAs, links, active states |
| `--pos` / `--neg` / `--warn` | `#059669` / `#E11D48` / `#B45309` | `#34D399` / `#F87171` / `#FBBF24` | Deltas, status pills, alerts |
| `--scrim` | `rgba(11,13,18,.42)` | `rgba(0,0,0,.6)` | Modal/sheet backdrop |

**No raw hex in components, anywhere.**

### 5.2 Typography

- **Anuphan** — UI and body. 400 body, 500–600 labels, 700 headings. Thai + Latin in one family.
- **IBM Plex Mono** — prices, IDs, set codes, cert numbers, OTP. `font-variant-numeric: tabular-nums` on **every** price figure, to stop column jitter in price tables.
- Minimum sizes: mobile body 11–13px floor, desktop 12.5–13px floor. Headings 18–24px mobile, 26–30px desktop.

**Thai typographic rules — not optional polish:**

- **Line-height minimum 1.7 for Thai body text**, versus 1.5 for Latin. Thai stacks vowels and tone marks above and below the baseline; 1.5 clips and collides.
- `word-break: normal` with `line-break: strict`. **Never `overflow-wrap: break-word`** — it breaks mid-syllable and produces nonsense.
- **Never truncate Thai mid-string** without an expand affordance. A truncated Thai phrase can read as a different word.
- Text scales to 200% without layout breakage. Test Thai at maximum scale, where tone marks and line-height break first.

### 5.3 Accessibility baseline

The mockup handoff states plainly that no accessibility work exists — no ARIA, no focus order, no keyboard nav. All of it is built here, once, rather than retrofitted across forty components later.

- [ ] Contrast 4.5:1 body, 3:1 large — **verified independently in light and dark**. Any mockup token that fails is adjusted here, before it is codified
- [ ] Visible 3–4px focus rings; focus never removed
- [ ] Touch targets ≥ 44×44px, ≥ 8px apart
- [ ] Focus trapping and restoration in sheets, dialogs and overlays
- [ ] **Colour is never the sole signal** — verification pairs with a shield icon and text, estimates carry a `~` prefix and a label, accept/reject carry icons, chart series differ by line style
- [ ] Every chart has a data-table equivalent
- [ ] Form errors below the field, `role="alert"`, first invalid field auto-focused
- [ ] Icon-only buttons carry `aria-label` in Thai
- [ ] `prefers-reduced-motion` respected throughout
- [ ] Sequential heading hierarchy — also SEO-critical
- [ ] Keyboard-navigable end to end

### 5.4 The four-state contract

Every data component satisfies four states. A component without them is not done. The mockups swatch these on a mobile-only dev screen; here they become part of each component's API.

| State | Rule |
|---|---|
| **Loading** | Skeletons matching final layout. Spinners only for actions under 1s. Reserve space — CLS < 0.1 |
| **Empty** | Explain what belongs here and give the action that fills it. Never a bare "no data" |
| **Error** | State the cause and the recovery path. Retry always available |
| **Offline** | Cached catalog content stays readable. Transaction actions clearly disabled with an explanation — never silently failing |

### 5.5 Motion and feedback

150–300ms, `ease-out` entering, `ease-in` exiting, exit ~65% of enter. `transform` and `opacity` only.

Toasts: 2.6s auto-dismiss, bottom-centre mobile / bottom-right desktop, `aria-live="polite"`, never steal focus, and **never the only record of a money event.**

**One product-specific rule:** escrow state transitions never animate away confirmation. When funds release, the confirmation is a persistent state on screen, not a toast that vanishes.

### 5.6 Component inventory

Ported from the mockups: app shell (bottom nav / sidebar+topbar), search field, filter sheet and rail, card tile and row, density toggle, price chart with hover, set banner and stat cards, listing row, deal row with unread badge, timeline/stepper, amount stepper, bottom sheet, dialog, toast, permission modal, offline banner, skeleton set, tab bar, OTP input and keypad, carrier picker, checkout summary.

Built new, because the strategy depends on them: `PriceProvenance`, `VerificationBadge`, `PhotoTierBadge`, `ConditionSelector`, `ReputationSummary` (§7).

**Deliverable:** Storybook with every component in both themes at 375 / 768 / 1440.

---

## 6. The three reinstated features

Each was a deliberate PRD cut. Each is reinstated scoped narrowly enough not to reintroduce the problem it was cut to avoid.

### 6.1 Offers

The PRD cut *auctions* — they need simultaneous two-sided liquidity — but explicitly permitted "fixed-price and offer-based selling first." Offers were always in scope; the mockups make them concrete.

Buyer flow is a linear state machine: `browsing → offer form → payment confirmation → done`. Bottom sheet on mobile, centred dialog on desktop. Seller flow branches on stage: `pending → (countered) → shipping → shipped → paid`, with counter-offer via an amount stepper.

**The buyer commits payment when making the offer**, per the mockups. This is the anti-ghosting mechanism from the PRD, arriving earlier than the original design put it — an offer backed by an authorised card is a serious offer.

### 6.2 Deal-scoped chat

The PRD's objection stands: Messenger volume is a *symptom* of missing structured data, and the target is ≤2 seller messages per completed sale. A thread that can only be opened once someone is already negotiating still measures that honestly.

**Constraints:**
- Threads attach to an `Offer` or a `Transaction`. Never to a user pair.
- No general inbox. No seller DMs. No messaging a stranger from a listing page.
- Thread closes to read-only when the deal reaches a terminal state. History is retained as dispute evidence.
- Messages are evidence in the operator console (§9.5), which is a second reason they are structured rather than free-floating.

### 6.3 Cart

Client-side only. Fans out into N per-seller transactions at checkout (§4.8).

- Per-seller breakdown in the summary — subtotal, shipping, seller name, verification badge
- Buyer pays listed price + shipping. **No fee line** (N9)
- Confirmation hands over N deals, not one order, and says so
- A cart item whose listing sells out before checkout is surfaced explicitly, never silently dropped

---

## 7. Shared components carrying the strategy

### 7.1 `PriceProvenance` — the most important component in the product

Every price displayed anywhere carries one. No exceptions.

| Variant | Trigger | Visual |
|---|---|---|
| **Settled** | ≥3 platform-settled transactions | `shield-check`, `--pos`, "จากการซื้อขายจริง N รายการ" |
| **Thin** | 1–2 settled | `shield-check` muted, "ข้อมูลน้อย — N รายการ" |
| **Observed** | Facebook archaeology | `alert-triangle`, `--warn`, "ประมาณการจากประกาศ N รายการ" |
| **Comp** | International comparable | `alert-triangle`, `--warn`, "อ้างอิงราคาต่างประเทศ" |
| **Estimated** | Condition-normalised, no direct data | `~` prefix on the number, "ประมาณการจากสภาพอื่น" |
| **None** | No data | "ยังไม่มีข้อมูลราคา" — **never ฿0** |

Tappable, explaining the methodology in plain Thai. Credibility with a sceptical community is won by showing the work — and at launch the entire index is seeded, so this component is what stops the product from lying.

### 7.2 `PriceChart`

Line chart with area fill. Not candlestick — there is no OHLC data and the accessibility grade is poor.

- Ranges 30d / 90d / 1y / All, default 90d
- **Settled and estimated data visually separated by line style** — solid for settled, dashed for seeded. Not colour alone
- **Vertical marker at the date platform-settled data begins**, making the basis discontinuity legible instead of looking like a price jump
- Hover/tap tooltip: date, price, condition, source
- **Data-table toggle** — required for screen readers, and traders genuinely want it
- Empty state explains itself. Never a bare axis frame

### 7.3 `ConditionSelector`

Enumerated, never free text. NM / LP / MP / HP / DMG, each showing its Thai definition and an example photo **at the moment of selection**, not behind a help link.

Adopting the international scale rather than inventing one is deliberate: a custom scale makes Thai prices incomparable to international data and destroys the cheapest cold-start source for the index.

Reused identically in listing creation, portfolio add, and search filters — one component, one vocabulary.

### 7.4 `VerificationBadge`

| Tier | Display |
|---|---|
| Basic | none |
| Bank-verified | `shield` outline, "ยืนยันบัญชีธนาคาร" |
| ID-verified | `shield-check` filled, `--pos`, "ยืนยันตัวตนแล้ว" |

Six placements: profile, listing card, listing detail, search results, deal screen, meetup screen. Tappable → what the badge means and what was checked.

### 7.5 `PhotoTierBadge` and `ReputationSummary`

`PhotoTierBadge` — none / รูปครบ / รูปครบตามมาตรฐาน. Tappable → which shots were required and provided.

`ReputationSummary` — completed deals · no-shows · rejections given · dispute rate · tenure. **Counts shown with denominators** — "2 จาก 47", never "2". A raw number without context is unreadable as risk.

---

## 8. Milestone content

### 8.1 M1 — Catalog & price index

**Search**
- [ ] Trigram search over `name_th`, `name_en`, `name_ja` and aliases
- [ ] Thai query returns the correct card in the top 5
- [ ] `SV1a 123` style lookup resolves directly
- [ ] Misspellings and transliteration variance resolve — threshold tuned against a partner-authored test set
- [ ] Filters: game, set, rarity, language, condition, price range. Bottom sheet on mobile with a sticky apply button; persistent left rail on desktop
- [ ] Two density modes, user-toggled and remembered
- [ ] **Zero-result queries are logged** — the gaps queue input, and free demand data
- [ ] Zero-result state shows closest matches then "ไม่พบการ์ดนี้? แจ้งเรา". Never a dead end

**Card page** — the SEO surface and the only free acquisition channel. Server-rendered, one page per printing.
- [ ] Names in all three languages, set, number, rarity, artist, reference image, cross-links to sibling printings
- [ ] Price block: headline index, `PriceProvenance` **directly beneath, never separated from the number**, change indicator with arrow icon plus sign, per-condition breakdown, chart
- [ ] **Printing switcher** as a horizontal chip row — users land here from Google on the wrong printing
- [ ] Live listings slot — empty in M1, populated in M3. Build the slot now
- [ ] Thai metadata, canonical URLs, `Product` structured data, full auto-regenerating sitemap
- [ ] **No account required anywhere in M1 or M2**

**Set page** — banner, stat cards, card grid, sort by number / rarity / price.

**Corrections** — anonymous, three fields max, routed to the partner's queue. Confirmation states it goes to a human, with no SLA promised.

**Admin console** — §9.

**Data seeding.** Import EN Pokémon from public APIs. Hand-fill JP, One Piece and Thai-exclusive sets. Seed prices from Facebook archaeology and international comps, every row labelled unverified. **Run the 200-card pilot before committing to full coverage** — it produces the real cost-per-card that assumption A5 needs, and stress-tests the admin console while changing it is still cheap.

### 8.2 M2 — Portfolio

- [ ] Add a holding — printing, condition, quantity, acquired price, acquired date, notes
- [ ] One-tap add from any card page, pre-filled
- [ ] Collection list — current value, cost basis, unrealised gain/loss per card and in total
- [ ] Value-over-time chart
- [ ] **CSV import** — upload → column mapping → validation preview showing matched/unmatched → confirm. Unmatched cards listed for manual resolution, **never silently dropped**
- [ ] Private by default
- [ ] Price alerts — "notify me on ±X%". Email in M2
- [ ] Holdings persist independently of listings, enabling M3's one-tap list

**Deal quality vs appreciation — two numbers that must never merge.**

- **"Did I get a bargain?"** — acquired price vs index value **on the acquisition date**
- **"Has it gone up?"** — acquired price vs index value **today**

A card bought 20% under market that has since fallen 30% is a good buy *and* a loss. Label them distinctly; a shared colour scale implies they measure the same thing.

- [ ] Live feedback while typing the acquisition price: *"ต่ำกว่าราคาตลาดในวันนั้น 18%"*
- [ ] Honest "ไม่มีข้อมูลราคาในช่วงนั้น" state where the index had no coverage. **Never fabricate a benchmark**
- [ ] Comparisons are like-for-like on the gross basis

**This requires a daily index snapshot per printing, running from M1.** Cheap now, unreconstructable later.

**Risk:** portfolio value is only as credible as the index behind it, and in M2 the index is entirely seeded. Mitigation is §4.3's provenance labelling — show the work; never present an estimate as a fact.

Accounts here require **phone or email only**. No KYC, no bank details.

### 8.3 M3 — Listings & identity

**Verification — three tiers, both sides**

| Tier | Requires | Buyer unlocks | Seller unlocks |
|---|---|---|---|
| **Basic** | Phone + email | Browse, portfolio, buy under 10,000฿ | — |
| **Bank-verified** | Bank account name match | — | Sell under 10,000฿ |
| **ID-verified** | Government ID + liveness | Buy at any value, verified badge | Sell at any value, verified badge |

**The platform stores only** `psp_merchant_id`, `kyc_status`, `verified_name`, `verified_at`. **No ID documents ever enter the platform database.** This is the primary PDPA mitigation and a deliberate design decision, not an accident. The bank-name-match requirement falls out for free by comparing `verified_name` to the payout account.

**The gap:** PSP merchant KYC covers only those receiving payouts — sellers. Buyers pay by card or PromptPay and are never merchant-onboarded, so buyer verification needs a **second, payments-independent eKYC vendor**.

- [ ] **Above 10,000฿, both parties must be ID-verified.** Not the seller alone
- [ ] Threshold configurable
- [ ] Verification prompted **by intent** — crossing a threshold, or hitting a listing that requires it. Never at signup or first listing
- [ ] Sellers hitting the threshold see a **non-blocking** prompt: the listing saves as a draft and publishes automatically on verification. Never lose their work
- [ ] The interstitial states *why*, *what* is checked, *who* checks it, and *what we store* — specifically "เราไม่เก็บภาพบัตรประชาชนของคุณ", where the user is deciding, not in a privacy policy
- [ ] States: not started · in progress · **pending review** · verified · rejected. `pending` is a real, honest screen — these checks are not instant, and a spinner that runs for two hours destroys trust

**Market-enforced verification below the threshold.** Do not mandate it — let sellers demand it.

- [ ] Sellers can mark any listing **"verified buyers only"**, shown *before* the buy action with a route into verification — never a rejection after the fact
- [ ] Buyers can filter for verified sellers
- [ ] Verified buyers get higher escrow limits and skip any meetup deposit

Sellers with desirable cards will gate them; buyers who want those cards will verify. It also attacks ghosting directly — a no-show attached to a government identity is a different proposition from one attached to a burner account.

**Marketing claims must be precise. The claim *is* the product.**
- ✅ "ทุกดีลมูลค่าสูงเกิดขึ้นระหว่างผู้ใช้ที่ยืนยันตัวตนแล้ว"
- ❌ "ผู้ใช้ทุกคนยืนยันตัวตนแล้ว" — untrue while it is optional below the threshold

**Listing composer** — stepped, with progress and back navigation at every point:

1. **Find the card** — same search component. Not found → "แจ้งเพิ่มการ์ด" to the gaps queue, **listing saved as draft**. Never a dead end
2. **Condition** — `ConditionSelector`, or graded path (company / grade / cert, quantity locked to 1)
3. **Photos** — guided capture, one shot at a time, on-screen frame overlay, reference illustration beside the viewfinder, progress dots, immediate retake. Required shots vary by price tier, and the UI states what earning the next badge would require. The raking-light shot carries a plain-Thai explanation of why it matters. Upload is resilient: per-photo progress, retry, draft survives a dropped connection
4. **Price, quantity and shipping** — live market comparison, **net proceeds always visible**: "ลงขาย ฿540 · คุณจะได้รับ ฿497". Quantity > 1 only for raw, single-condition, with the batch-photo disclosure
5. **Review and publish**

- [ ] **One-tap list from a portfolio holding** — printing and condition pre-filled
- [ ] Bulk mode — shared fields entered once, then a rapid add loop. **It should feel like a queue, not a form repeated 40 times**
- [ ] **Auto-save drafts throughout.** A trader listing 40 cards on mobile will be interrupted
- [ ] Underpricing auto-flags for review and shows a non-blocking inline warning. Underpricing is the strongest available counterfeit signal, and the index provides it free

**Reputation** — public, non-editable, non-transferable: completed transactions, no-shows, rejections given, dispute rate, tenure, verification tier.

Note the consequence of M3 shipping without settlement: **every counter except tenure and verification tier is zero until M4.** The profile must read as "new, verified, no history yet" rather than as an empty error, and verification tier carries the entire trust signal in the interim. This is a real M3 design problem, not a temporary state to gloss over.

### 8.4 M4 — Offers, deals & settlement

**Transaction state machine.** Every transition is an **append-only event** in `transaction_events`. Current state is derived. Nothing updates in place. Money and reputation both depend on the history being reconstructable, and a complete log is what makes the 10-minute dispute target achievable.

Both lanes share one machine, branching after `committed`:

```
                    ┌─> shipped ──> delivered ──> inspection(48h) ──> settled
                    │                                   │        └─(auto-release)
committed ──────────┤                                   └──> disputed ──> operator
                    │
                    └─> scheduling ──> scheduled ──> checked_in ──> settled
                           │(48h)          │              │     └─> refunded (reject)
                           │               │              └───────> no_show_review
                           └───────────────┴──────────────────────> expired (4d hard)
```

Same events table, same deal screen, same stepper component. The lane changes only which steps render.

**Shipped lane** (built first — the mockups design it completely)
- [ ] Seller enters tracking; carrier picker (Kerry, Flash, ไปรษณีย์ไทย); delivery confirmation starts the 48h window
- [ ] Buyer accepts, or auto-release fires at expiry, with a visible countdown
- [ ] **Dispute requires an unboxing video, disclosed at commit time** — not discovered at dispute time

**Face-to-face lane** — built to different constraints than any other screen: one hand, bad mall wifi, a stranger waiting, thousands of baht at stake.
- [ ] 48h to agree a meetup; **4d hard expiry** from commit (N11). Both configurable, and the hard expiry must always sit *under* the authorisation window, never be chosen independently of it
- [ ] **Confirm the PSP's maximum authorisation-hold period per card brand** — it is a hard technical ceiling on the expiry rule (§8.5)
- [ ] Suggested public venues — malls, card shops, tournament venues — with map links
- [ ] Mutual QR check-in between both devices. **QR generation and scanning are local; only confirmation touches the network.** Screen brightness boosted while the QR displays
- [ ] Both parties' names and verification badges shown, so the buyer can confirm they are meeting the right person
- [ ] Inspect: checklist drawn from the photo protocol. **Accept and Reject are spatially separated, never adjacent.** Reject requires confirmation
- [ ] Accept → immediate capture, commission split, seller paid, **persistent** settled state
- [ ] Reject → immediate void and refund, **structured reason code required**, public rejection rate updated. The rejection's effect on their public profile is disclosed *before* the decision — that is the entire deterrent
- [ ] Missed mutual check-in → auto-refund, **24h grace** for the absent party, operator decides before any strike lands. The UI must make clear **no strike is recorded yet**. Presumption of guilt in the interface would be a design lie about how the system works

**Commission**
- [ ] 5–8% seller-side `[TBD]`, deducted at settlement by the PSP via split settlement or partial capture
- [ ] **Buyer pays the listed price plus shipping, always**
- [ ] Rate configurable per game and per value band
- [ ] Zero commission on refunds and rejections
- [ ] **Only `settled` transactions write to the price index** — the manipulation wall, enforced in code, not policy

**Seller protection against bad-faith rejection**
- [ ] Seller may contest a rejection within 24h
- [ ] Statistical outliers on buyer rejection rate auto-flag
- [ ] Repeated bad-faith rejections restrict escrow access

Reputation carries the cost, not money — no adjudication of intent, therefore no new operator queue.

### 8.5 Payment provider

The highest-stakes vendor decision in the product. Identity, merchant KYC and settlement all run through one supplier.

**Screen during M1, not M4.** The legal question is unanswerable in the abstract — the answer depends on which provider's structure is being described to the lawyer.

#### The escrow mechanic, precisely

Escrow here is **delayed capture**: authorise at commit, capture on buyer acceptance, void on rejection. The platform never holds funds, which is the whole of N2 and the position the lawyer is asked to bless.

**This works on cards and does not work on PromptPay** (N10). PromptPay is a real-time credit push from the payer's bank app — there is no authorisation object, nothing held, nothing to capture or void. The money is irreversibly with the recipient the moment it is sent.

The obvious workaround — platform collects, then transfers to the seller later — is both custodial (violating N2) and, on Stripe specifically, **unavailable to Thai accounts**, which do not support separate charges and transfers. On Stripe Thailand the available shape is direct or destination charges with an application fee as commission, which is genuinely non-custodial, with manual capture supplying the escrow window on the card leg only.

**This is a commercial problem, not only a technical one.** The market being replaced runs on PromptPay, and it is the documented behaviour under 10,000฿ — where most volume lives. "Escrow requires a credit card" asks users to change payment method and platform at once.

**Unresolved product decision, required before M4 screens are designed** — what happens to a PromptPay buyer:

| Option | Consequence |
|---|---|
| Card-only for escrowed deals | Simplest and safest. PromptPay disabled at checkout. Cuts off the dominant local payment method |
| PromptPay permitted without escrow below a threshold | Preserves the habit, but the trust proposition is absent exactly where the PRD says trust is thinnest. Must be labelled unmistakably — an unescrowed deal must never look like an escrowed one |
| A Thai PSP with a licensed escrow or wallet structure | Possibly the real answer, but it is a sales conversation and lands directly in the lawyer's lap. May reintroduce custody |

#### Authorisation windows are a hard ceiling

Business rules sit *under* the authorisation window; they are never chosen independently of it.

| Brand | Card-not-present, customer-initiated | Merchant-initiated |
|---|---|---|
| Visa | 7 days | **4 days 18 hours** |
| Mastercard / Amex / Discover | 7 days | 7 days |

Hence N11: the hard expiry is **4 days**, not 5. MIT/CIT classification is made from cardholder-participation signals rather than API parameters, so a commit classified MIT under a 5-day rule would see the authorisation lapse while the deal is still open — releasing the buyer's funds silently with the transaction live. Extended authorisation may raise the ceiling; confirm per provider.

#### Candidates

| | Stripe | Omise / Opn |
|---|---|---|
| Thai availability | General availability, Connect included | Thai-founded, BOT-licensed, local incumbent |
| Developer experience, sandbox | Best in class | Good |
| Escrow mechanic | Manual capture, cards only. **No separate charges + transfers for TH accounts** | Requires direct confirmation |
| Sub-merchant KYC | Connect onboarding, hosted. Selfie verification must use the hosted flow — **which suits the "no ID documents in our database" position exactly** | Merchant onboarding, requires confirmation |
| Indicative rates | Verify directly | PromptPay 1.65%, cards 3.65%, both + 7% VAT |
| Known caveat | Connect may require sales engagement. Connected accounts in industries "for whom the platform is responsible for incurred losses" are unsupported — **a disputes-liable marketplace may trip this** | Marketplace/escrow structure not publicly documented |

**Resolve the Stripe caveat first.** The platform adjudicates disputes and decides release-versus-refund, which is the shape of "platform responsible for incurred losses." If that excludes stacket, Connect is off the table regardless of everything else.

#### Margin

At a 5–8% seller commission (S3), card processing at ~3.9% all-in consumes **half the take rate at the low end**. Two consequences for the partner: the commission should sit nearer 8% than 5%, and PromptPay being ~2.1 points cheaper is a real margin argument for wanting it to work — which collides head-on with the escrow finding above.

#### Vendor spike

Two weeks, both providers, the same five questions:

1. Does a disputes-liable P2P marketplace qualify for your sub-merchant product?
2. Can PromptPay funds be escrowed in **any** structure you offer?
3. Maximum authorisation hold per card brand, and can it be extended?
4. Does your merchant onboarding satisfy Thai KYC such that we never receive ID documents?
5. All-in rates at our expected volume.

The `PaymentProvider` adapter (§10.2) is what makes running this spike cheap and switching afterwards survivable.

---

## 9. Admin & operator console

Used daily by a founder who does not code. Throughput is a business constraint, so these screens get the same design attention as the buyer flow. Ships **with M1**.

**Shell.** Persistent left sidebar, desktop-first — this is a laptop tool. Dashboard · Catalog · Corrections · Gaps · Disputes · Manipulation · Users. **Queue counts as badges in the nav** — the operator's first question every morning is "what's waiting for me." Role-based auth, separate route, `noindex`.

**Catalog manager**
- [ ] Table with instant search, including unpublished records
- [ ] Inline editing on the row where possible; full editor for complex changes
- [ ] **Bulk CSV import: upload → validate → dry-run diff → confirm → rollback.** The diff view is the most important screen in the console — added / changed / unchanged counts, changed rows expandable field-by-field. A bad 2am import must be reversible without the engineer
- [ ] Set management — create a set with language and code, bulk-attach cards
- [ ] Printing management — add a variant without re-entering the card
- [ ] Image upload with drag-and-drop batch, automatic resize, CDN handoff
- [ ] **Alias editor** — fast, keyboard-driven. This is where a decade of market knowledge is entered; it should feel like typing a list, not filling a form
- [ ] Price point entry — manual, mandatory source label and confidence, bulk paste for archaeology sessions
- [ ] Audit log per record, with revert

**Corrections queue** — submitted value beside current value, diff highlighted, submitter evidence inline. Accept / edit and accept / reject. Keyboard shortcuts. **Target: under 15 seconds per item.**

**Gaps queue** — **ranked by zero-result search volume**, with search counts. "Create card" pre-fills from the search term. This turns an operational chore into a demand-driven work queue. Needs same-day turnaround, or supply leaks: a seller who cannot find their card abandons the listing.

**Dispute console** (M4) — **single screen, target under 10 operator-minutes.** Listing photos and evidence media left · full transaction event log and thread centre, chronological · both parties' reputation and history right · decision bar fixed at the bottom. Three actions: release / refund / split, each requiring a reason note. Templated Thai responses. Outcome auto-writes to both profiles.

**Manipulation watch** — circular trades, implausible price movement, repeated same-pair transactions. Lowest priority; deferred until the index has enough authority to be worth gaming.

---

## 10. Architecture

### 10.1 Modules

One Next.js repo, Postgres, hard internal seams. The binding constraint is one engineer holding one module in context at a time.

```
catalog/      games, sets, cards, printings, aliases, corrections
search/       query interface — pg_trgm implementation behind it
pricing/      price points, index computation, daily snapshots, provenance
portfolio/    holdings, valuation, deal quality, alerts
listings/     listings, photos, condition, quantity/lots
identity/     users, tiers, reputation, PSP + eKYC handoff
offers/       offers, counters, expiry
transactions/ state machine, events, both settlement lanes
messaging/    deal-scoped threads
payments/     PaymentProvider adapter — interface plus one implementation
admin/        catalog tools, queues, operator console
```

### 10.2 Six decisions worth naming

1. **Search behind an interface.** `search.query(...)` is the only entry point. Swapping the implementation is one file.
2. **PSP behind an adapter.** `PaymentProvider` exposes `authorize / capture / void / refund / splitSettle / onboardMerchant`. **No PSP type leaks past it.** The vendor concentration risk cannot be removed, but it can be contained — this is the difference between switching providers in weeks and rewriting M4. The eKYC vendor gets the same treatment.
3. **The platform has no money in it.** No balance table, no ledger of held funds, ever. Transactions store references to PSP objects only. A schema with a balances table undermines the lawyer's argument before the conversation starts.
4. **Transactions are append-only.** `transaction_events` is the source of truth; state is derived.
5. **Offers are a chain, not a mutation.** Negotiation history is dispute evidence.
6. **No order object.** A cart fans out into N transactions at checkout (§4.8).

### 10.3 PDPA

Already mitigated by architecture: **no ID documents stored**, since KYC lives with the PSP and eKYC vendor.

Still required:
- [ ] Privacy policy and signup consent
- [ ] Documented lawful basis for processing
- [ ] Data subject access and deletion handling
- [ ] Retention policy
- [ ] **Settled transactions and reputation are anonymised, not deleted** — they cannot simply vanish

Fold into the same lawyer engagement as escrow; the marginal cost is near zero and retrofitting is not.

### 10.4 Background jobs

- **Daily price index snapshot per printing** — from M1. M2 depends on it and it is unreconstructable later
- **Offer expiry sweeps** — 24h default
- **Escrow expiry sweeps** — 48h scheduling, 4d hard
- **Inspection auto-release** at 48h post-delivery
- **Price alerts**
- **Zero-result search aggregation** → gaps queue ranking

### 10.5 Non-functional

**SEO is infrastructure** — the only free acquisition channel and the reason for web-before-app.
- [ ] Every card page server-rendered with unique Thai title and description
- [ ] Auto-regenerating sitemap covering the full catalog
- [ ] `Product` + `Offer` structured data
- [ ] Core Web Vitals green **on a mid-range Android over 4G**

**Performance**
- [ ] Card page TTFB < 500ms
- [ ] Search results < 300ms at 100k printings
- [ ] Index reads served from materialised snapshots, **never computed per request**

**Responsive.** Mobile-first. The web build uses fluid flex/grid capped at `max-width: 1440px` — it does not keep stretching on ultra-wide monitors. Mobile uses bottom sheets and full-screen overlays for transient UI with bottom-anchored primary actions. No horizontal scroll at any width. `min-h-dvh`, never `100vh`. Landscape supported — phones get rotated at meetups.

| Surface | Mobile | Desktop |
|---|---|---|
| Search filters | Bottom sheet + sticky apply | Left rail, always visible |
| Card detail | Single column, price above the fold | Two column, sticky image |
| Deals | List → full-screen push | Master-detail |
| Checkout | Stacked | Two-column, sticky summary |
| Sell flow | Full width | Centred, max 640px |
| Check-in | Full-screen, max targets | Mobile layout retained — nobody meets with a laptop |
| Admin | Read-only fallback | Full console, desktop-first |

**Locale.** Thai default, English switchable, preference persisted. `฿1,234` with tabular numerals; never mix `฿` and `บาท` in one view. Asia/Bangkok. Buddhist-era dates in user-facing copy, ISO in the admin console. Card names always show both Thai and original-language names. **All copy written in Thai first, then translated** — translated-from-English Thai reads as foreign.

**Backups are existential.** The catalog is manual labour and the primary asset. Automated daily backups, tested restore, point-in-time recovery. Losing the catalog is not an outage.

### 10.6 Deployment

Budget ceiling is **under $25/month at M1**, at ~50–100k printings and low-thousands daily traffic.

**Zero-ops does not fit that ceiling for a commercial product.** Vercel Hobby is non-commercial per its terms, so a marketplace is on Pro at $20; Supabase's free tier pauses when idle, caps at 500MB and has no point-in-time recovery, which is disqualifying for the primary asset. That floor is ~$45/month. Semi-managed alternatives land at $14–25 but with Postgres tiers of 1GB or less, which §4.2's snapshot table exceeds on arithmetic alone.

So: **one VPS**, which at this scale is the correct answer rather than a compromise.

```
Cloudflare (free)     DNS · CDN · WAF · cache
  │                   PoP in Bangkok — cached card pages served locally
  ▼
VPS · Singapore       Caddy (auto-TLS)
2 vCPU / 4GB          Next.js (Docker)
                      Postgres 16 + pg_trgm (Docker, named volume)
  │
  ├─► Cloudflare R2   card images, later listing photos
  └─► R2, separate    nightly pg_dump + WAL archive
```

| Line | Monthly |
|---|---|
| VPS, Singapore, 2 vCPU / 4GB | $18–24 |
| Provider snapshots | $2–5 |
| Cloudflare — DNS, CDN, WAF, R2 (10GB free) | $0 |
| Sentry, uptime monitoring, GitHub Actions — free tiers | $0 |
| **Total** | **$20–29** |

Drop to 2 vCPU / 2GB at ~$12 to sit comfortably under $25 — viable because the working set is small and Cloudflare absorbs most read traffic.

**Singapore region is non-negotiable.** ~30ms to Bangkok against ~250ms from US-east, measured against a sub-500ms TTFB target on a mid-range Android over 4G.

**Cloudflare replaces Vercel's ISR.** Card pages are 100k documents that change rarely — long edge TTL, purge by tag when the admin console edits a card. The SEO behaviour without the platform fee.

**Two non-negotiables:**

1. **Nightly `pg_dump` to R2 — a different vendor's storage — with a restore that has actually been performed.** Provider snapshots share a blast radius with a billing error or a compromised key. The catalog is manual labour and the primary asset; losing it is not an outage. A tested restore is a step in the M0 plan, not an intention.
2. **Postgres in its own container with a named volume, never on the host.** This is what keeps an eventual move to managed a config change rather than a data-extraction project.

**Later.** M3 photos on R2 cost ~$0.015/GB/month with zero egress — 100GB is $1.50. M4's jobs and webhooks may push the box to 4 vCPU / 8GB (~$48) or split app from database. Both are hours of work, not redesigns.

---

## 11. Testing

TDD throughout.

- **State machines** (transaction, offer) get exhaustive transition tests **including illegal transitions**. This is where money bugs live.
- **Search** gets a partner-authored fixture set of real Thai queries with expected top-5 results, run in CI, so tuning the trigram threshold cannot silently regress.
- **Every component** ships with its four states covered.
- **Both settlement lanes** covered end-to-end by Playwright against a PSP sandbox stub.
- **Index computation** — property tests on the condition-multiplier normalisation and the one-observation-per-bulk-sale rule.
- **Accessibility** — automated contrast and ARIA checks in CI, plus manual keyboard traversal per milestone.

---

## 12. Metrics and gates

| Milestone | Gate | Target | Status |
|---|---|---|---|
| M0 | Components pass AA in both themes at three widths | binary | — |
| M1 | A1 — weekly returning users at wk10 | ≥400 continue / <150 kill | ⚠️ **hypothesis — founders to set** |
| M1 | A5 — cost per card | `[TBD]` | ⚠️ run the 200-card pilot |
| M2 | Weekly returning users with a portfolio | `[TBD]` | ⚠️ set before M2 ships |
| M3 | A2 — listings per active seller per week | ≥5 (trader persona) | — |
| M3 | A4 — KYC upgrade completion when prompted | ≥70% target, <50% kills the threshold | — |
| M4 | Legal clearance | binary | **blocking** |
| M4 | Escrow completion without dispute | ≥98% | — |
| M4 | Operator minutes per dispute | <10 | two-person constraint |
| M4 | Meetup no-show rate by day 90 | <10% | — |

Tracked throughout: search→listing-view rate (≥40%), % listings meeting their photo tier (≥80%), price index coverage of top-500, median seller messages per completed sale (≤2), and high-value volume before vs after verified-to-verified enforcement.

**A1's kill criterion is a placeholder and must be set before M1 ships.** Since all four milestones are now planned up front, that number is the only thing standing between M1 and M3 spend regardless of what M1 reports.

---

## 13. Open questions

**Blocking M4 — the legal track, starting week 1**
1. **PSP selection first**, against §8.5's screen. It is a prerequisite to the legal conversation, not a follow-on
1b. **Can PromptPay be escrowed under any available structure?** Its own item for the lawyer, not a sub-clause of the PSP question. If the answer is no, escrow is card-only and the product's trust proposition is materially weaker below 10,000฿ — where most volume lives. This may be the single most consequential unknown in v1 (N10, §8.5)
1c. Whether a disputes-liable marketplace qualifies for Stripe Connect in Thailand, given the exclusion of platforms responsible for incurred losses
2. Thai legal opinion on the delayed-capture structure
3. eKYC vendor, per-check cost, and whether a marketplace may act as an NDID relying party without its own licence
4. PDPA obligations — same engagement
5. **The PSP's maximum authorisation-hold period**, which caps the 5-day escrow expiry rule

**Partner's market knowledge**
6. Condition multiplier table (NM / LP / MP / HP / DMG)
7. Photo tier thresholds
8. Bulk-lot value ceiling
9. Exact commission rate, and whether it varies by game or value band
10. Whether 10,000฿ is a real market norm or one group's convention

**Needs data**
11. Graded vs raw mix above 10,000฿ — decides whether cert verification matters
12. Actual dispute rate — decides escrow vs guarantee fund
13. JP Pokémon and One Piece data licensing — buy, scrape, or crowdsource
14. Every `[TBD]` in §12

**Design, still open**
15. Default search density — trader-compact or browser-grid? It signals who the product is for
16. Whether portfolio value should be hideable in public
17. Meetup venues — curated, or crowd-suggested with moderation?
18. Rejection rate as raw count or percentage. A percentage is fairer to high-volume buyers; a count is harder to game
19. Whether unread badges need a 99+ treatment

**Strategic, with no mitigation on record**
20. Distribution. The top strategic risk, and the only one in these documents with no mitigation beyond "go multi-group." The incumbent group admins *are* the current escrow business and they control distribution

---

## 14. Assumptions

Recorded in full in `docs/2026-08-17-understanding-and-reconciliation.md` §10. Still open: no catalog data yet in usable form; no lawyer engaged and no PSP shortlisted; phone-first OTP auth; WCAG AA held as a build requirement; fresh repo.

**Resolved since**: hosting is decided (§10.6, single VPS in Singapore under $25/month), and the payment landscape is screened (§8.5) though no vendor is chosen.

**Two are worth answering this week.** Existing catalog data would materially shorten M1's critical path. PSP and legal have the longest lead time in the project — and question 1b, whether PromptPay can be escrowed at all, may reshape M4 more than the vendor choice does.
