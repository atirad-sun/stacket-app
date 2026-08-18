# stacket — Understanding & Source Reconciliation

**Status:** Working document. Written before the v1 design spec, to make my understanding auditable.
**Date:** 17 August 2026
**Purpose:** Record what the existing artifacts say, where they contradict each other, what was decided in the 17 Aug brainstorming session, and what I am assuming in the absence of answers.

This is not a spec. It is the input to one. If anything here is wrong, the spec built on it will be wrong in the same place.

---

## 1. Sources reviewed

| Source | Date | What it is |
|---|---|---|
| `files/00-README.md` | 16 Aug 2026 | Index and one-paragraph summary of the discovery set |
| `files/01-strategy-and-positioning.md` | 15 Aug 2026 | Market context, competitive landscape, strategic reasoning |
| `files/02-prd-v1.md` | 12 Aug 2026 | v1 product requirements, personas, acceptance criteria, phasing |
| `files/03-journeys-and-blueprint.md` | 16 Aug 2026 | Lifecycle, settlement flows, three-lane service blueprint |
| `files/04-validation-and-open-questions.md` | 15 Aug 2026 | Riskiest assumptions, kill criteria, blocking legal questions |
| `docs/superpowers/specs/2026-08-16-tcground-v1-design.md` | 16 Aug, 02:02 | Product design spec — domain model, milestones, architecture |
| `docs/superpowers/specs/2026-08-16-tcground-ui-design-spec.md` | 16 Aug, 02:09 | UI spec — principles, tokens, every screen M1–M4 |
| `TCGround responsive webapp mockups.zip` | 16 Aug, 23:45 | Interactive prototype: mobile (402×874), fluid web (768–1440), handoff doc, screenshots |
| `design-resources/` | 16 Aug | `Icon - base -01.svg`, `logo-text-based.svg` |

**Recency matters here.** The mockups are ~22 hours newer than both specs and are the only artifact carrying the name *stacket*. Where they conflict, I have treated the mockups as the later thought — but only where the conflict is about design, not about law or strategy. Section 4 records where that distinction was applied.

---

## 2. What the product is

A trust-layer marketplace for trading-card collectors in Thailand, replacing buy/sell/escrow activity currently running through Facebook groups (~100k members, 50+ listings a day).

The problem is not demand — it is that the market's growth is capped by trust. Listings are unstructured free text so cards are not searchable; there is no shared price reference so pricing is inconsistent; sellers are unverified so every purchase carries counterparty and counterfeit risk. Above 10,000฿ a group admin acts as manual escrow, which is a single human bottleneck and a single point of fraud.

The answer is structured peer-to-peer: a real card catalog with settled-price history, verified identity, standardised condition and photo evidence, and escrow via a licensed payment provider — with the buyer inspecting the card in person or in a delivery window, so the platform never takes custody of cards or money.

**Position:** structured peer-to-peer. Not competing with curated retail (Sasom) on the high end; not taking custody of cards. The deliberate premise is that **cards are non-fungible and condition variance *is* the market** — hence per-item listings with rich condition evidence, not an interchangeable-SKU order book.

**The three things most likely to kill it,** per the founders' own README:

1. **Legal.** Escrow may trigger Thai payment-services or escrow licensing. Unresolved and blocking.
2. **The catalog.** Largest cost, manual data work rather than engineering, and the actual moat.
3. **Evidence quality.** Discovery is founder observation. `04` records it as n=1; the 16 Aug spec upgrades it to n=2, one with ten years' industry experience. Two insiders in the same communities still do not constitute customer research.

---

## 3. Who is building it

Two founders. One owns catalog data, market knowledge and operations — ten years in the industry, does not code. One owns engineering, working with AI assistance. No hard launch date; phase gates are described as real rather than decorative.

**This constrains the design in two concrete ways,** and both are load-bearing:

- The admin console is a product surface, not an internal tool. If adding a card requires an engineer, the moat stalls and the catalog gaps queue leaks supply. It ships *with* the catalog, not after.
- Module boundaries matter more than usual. The binding constraint is one engineer holding one module in context at a time.

---

## 4. Where the sources disagree

The mockups are a materially different product from the specs in eight places. This table is the reason this document exists.

| # | Area | Specs say | Mockups show | Resolved |
|---|---|---|---|---|
| D1 | Brand | TCGround · blue `#2563EB` · IBM Plex Sans Thai | **stacket** · teal `#00A98A` · Anuphan + IBM Plex Mono | Mockups win entirely |
| D2 | Settlement | Face-to-face meetup + mutual QR check-in is the flagship flow | No meetup at all — shipping only, carrier selection, tracking | **Both lanes.** Shipped as designed, meetup added on top |
| D3 | Custody | "No balance table, no ledger of held funds, ever" | Escrow copy: *"คุณชำระเงินไว้กับ stacket"* — you pay stacket | **Non-custodial.** Mockup copy is wrong and gets rewritten |
| D4 | Buyer pays | Exactly the listed price; commission is seller-side | Cart adds 1.5% payment fee + ฿60 shipping | Listed price **+ shipping only.** Fee line removed |
| D5 | Negotiation | Minimal transaction-scoped messaging; ≤2 seller messages per sale | Full chat thread + offer/counter-offer stepper | **Kept**, but deal-scoped only — no general inbox, no DMs |
| D6 | Buying | Per-item listings, no cart | Multi-item cart across sellers | **Kept**, as a client-side basket that fans out into N deals |
| D7 | Trust surfaces | `PriceProvenance` on every price, three verification tiers, value-tiered photo protocol, admin console | None present — boolean `verified`, price deltas without provenance, "2 รูป" sell flow, no admin | Specs win. These are new design work |
| D8 | Games | Pokémon (EN+JP+Thai-exclusive) + One Piece | Five: + Yu-Gi-Oh!, Magic, Lorcana | **5 in the UI, 2 populated** at launch |

**The principle applied:** where the conflict is about *design*, the mockups win — they are newer and pixel-complete. Where it is about *law* (D3) or *strategy* (D4, D7), the specs win, because those positions were reasoned from constraints the prototype was not built to respect.

The mockups are also a milestone ahead of themselves: they depict M3/M4 marketplace surfaces, while M1 is defined as catalog-only with no accounts. That is not a contradiction — it is a prototype showing the destination.

---

## 5. Decisions made in this session

All confirmed by the founder on 17 Aug 2026.

| # | Decision | Consequence |
|---|---|---|
| **N1** | Both settlement lanes; shipped built first, meetup added on top | One state machine with a branch after `committed` |
| **N2** | Non-custodial — PSP holds funds, platform never does | No balances table. Mockup escrow copy rewritten to name the PSP |
| **N3** | Full v1 planned, M1 through M4 | M4 planned behind the payment adapter; legal track runs parallel from week 1 |
| **N4** | stacket brand and mockup token set, verbatim | UI spec §2.2–2.3 (colour, type) superseded; its principles and component contracts survive |
| **N5** | Offers, chat and cart all kept | Three PRD non-goals reinstated, each scoped narrowly (§6) |
| **N6** | Next.js + Postgres + Tailwind reading the mockup's CSS custom properties | Own component library — no shadcn. One source of colour |
| **N7** | 5 games in the UI, Pokémon + One Piece populated | Unpopulated games render as "coming soon", never as empty |
| **N8** | Design system is its own deliverable, before product screens | Milestones become **M0 → M1 → M2 → M3 → M4** |
| **N9** | Buyer pays listed price + shipping; no payment-fee line | Price index records the item price only, never postage |

### 5.1 Reasoning behind the two non-obvious ones

**N8 — design system first.** The mockup's components are reused roughly forty times across four milestones. Porting them once, with accessibility and the four states built in, is cheaper than extracting them under pressure in M3. The cost is that nothing resembling the product exists for the first few weeks. The founder accepted that trade explicitly.

**N3 — full v1 despite the gate.** The spec sequences M1 with a real kill criterion (assumption A1: returning weekly users at week 10). Planning all four milestones does not disable that gate; it means the plan exists in advance of it. M4 in particular is planned against a generic `PaymentProvider` interface rather than a named vendor, because the vendor is not yet selected.

---

## 6. The three reinstated features, scoped

Each was a deliberate PRD cut. Reinstating them without re-reading why they were cut would reintroduce the problem they were cut to avoid.

**Offers.** The PRD cut *auctions* — those need simultaneous two-sided liquidity — but explicitly allowed "fixed-price and offer-based selling first." So offers were always in scope. `Offer` is its own entity with its own expiry (24h in the mockups). Counter-offers are a **chain of offers, not mutations**, because negotiation history is dispute evidence. A transaction comes into existence only when an offer is accepted or a listing is bought outright.

**Chat.** The PRD's objection was that Messenger volume is a *symptom* of missing structured data, not a feature to optimise — and it set a target of ≤2 seller messages per completed sale. A thread that can only be opened once someone is already negotiating still measures that honestly. So: threads attach to an offer or a transaction. No general inbox, no seller DMs, no messaging a stranger from a listing page.

**Cart.** A cart is a **client-side basket with no server identity**. It never becomes an order. At checkout it splits into one `Transaction` per seller, each with its own escrow authorisation, shipping, inspection window and state machine. Two sellers means two independent deals that can diverge — one settles, one disputes — so the checkout summary needs a per-seller breakdown. **There is no order object, ever.** The mockup's cart already mixes two sellers, which is what forces this.

---

## 7. What the mockups actually contain

Useful as a build inventory. Both builds are Thai-language throughout.

**Screens** (mobile keys, with web equivalents): `home` · `search` · `detail` (card) · `setDetail` · `portfolio` · `deals` · `chat` · `sellerDeal` · `cart` · `sell` · `account` · `alerts` · `login` · `offerExpired` · `states` (mobile-only dev screen).

**Interaction patterns already designed:**
- Buyer offer flow as a linear state machine: `0 browsing → 1 offer form → 2 payment confirmation → 3 done`. Bottom sheet on mobile, centred dialog on web.
- Seller flow branching on stage: `pending → (countered) → shipping → shipped → paid`, with counter-offer via an amount stepper.
- Every state-changing action fires a 2.6s auto-dismissing toast — bottom-centre mobile, bottom-right desktop.
- Camera permission (from the sell flow's scan affordance) and notification permission (from alerts) as modals.
- Skeleton blocks for loading, never spinners.
- Offer-expired and payment-failure treated as distinct states, not one generic error.

**Responsive strategy:** the web build uses fluid flex/grid with no fixed media-query breakpoints, capped at `max-width: 1440px`. Mobile uses bottom sheets and full-screen overlays for transient UI with bottom-anchored primary actions. Deals is master-detail on web, full-screen push on mobile.

**Explicitly flagged as not built,** by the handoff doc itself:
- **No accessibility pass whatsoever** — no ARIA roles or labels, no focus order, no keyboard nav. Stated as "a visual prototype, not a production a11y baseline."
- No treatment above 1920px.
- The empty/loading/error swatch screen is mobile-only.

That first bullet is the largest single gap between the prototype and a shippable product, and it is why the design system is its own milestone.

---

## 8. Domain model as I understand it

```
Game            Pokémon, One Piece, Yu-Gi-Oh!, Magic, Lorcana
  └─ Set        language, set_code, release_date, region
       └─ Card  collector_number, name_th, name_en, name_ja, rarity, artist
            └─ Printing   normal | holo | reverse_holo | 1st_edition |
                          unlimited | promo_stamp | ...
```

Two invariants I will not design around:

**Language belongs to `Set`, not `Card`.** Japanese sets are not translations of English sets — different codes, numbering, cadence and contents. There is no meaningful cross-language card link for most of the catalog. No cross-language price merging, ever; this falls out of the model for free.

**`Printing` is the tradeable unit.** Listings, holdings and price points attach to `Printing`, never to `Card`. A reverse-holo and a normal printing are different objects with different prices. Getting this wrong makes the index worthless with no cheap migration.

**Price index.** Stored at `(printing, condition)`; headline index computed at `printing` level, condition-normalised via a multiplier table. Per-condition breakdown shown only where real data exists. Graded cards are a **separate index** keyed `(printing, grading_company, grade)` — a PSA 10 does not belong in the same series as a raw NM. Basis is **gross: the price the buyer paid**, matching TCGplayer, Cardmarket and StockX, which are the cold-start comps. Every transaction stores `gross_paid`, `commission`, `net_to_seller` so a net series can be derived later without re-auditing history. A bulk sale is **one** observation, not N.

**Provenance.** Every price point carries `source` (`platform_settled` | `facebook_observed` | `international_comp` | `operator_entered`) and a confidence. **Only `platform_settled` counts toward the authoritative index.** Everything else is labelled unverified in the UI — visibly, not in a footnote. This must exist before the first row is written: it is both credibility with a community that will immediately test whether the prices are real, and the anti-manipulation wall, which cannot be retrofitted without re-auditing every historical row.

**Known basis discontinuity:** `facebook_observed` rows carry no commission; `platform_settled` rows are gross of a commission sellers may partly pass through. The chart marks the date platform-settled data begins, so the step is legible as a basis change rather than a price jump.

---

## 9. Constraints I am treating as non-negotiable

Derived from the sources, not from preference. Each one, if violated, breaks something specific.

1. **The platform never holds money.** No balances table, no ledger. A schema with one undermines the lawyer's argument before the conversation starts.
2. **Only settled platform transactions write to the price index.** Enforced in code, not policy. This is the manipulation defence.
3. **Never present an estimate as a fact.** Systematically, via one component — not ad-hoc labels. Never show ฿0 for missing data; "no data" is a state.
4. **No ID documents in our database.** KYC lives with the PSP and the eKYC vendor. Primary PDPA mitigation, and a genuine differentiator worth stating on the verification screen rather than in a privacy policy.
5. **Friction arrives with money, never before.** Browse, search, price-check and portfolio work logged out or with a phone number. ID upload appears only when value demands it. The casual-seller persona returns to Facebook if onboarding is heavy.
6. **Transactions are append-only.** `transaction_events` is truth; state is derived. Money and reputation both depend on history being reconstructable.
7. **Thai first, and properly.** Not translated English. 1.7 line-height floor for Thai body text, `line-break: strict`, never `overflow-wrap: break-word` — it breaks mid-syllable and produces nonsense. Never truncate Thai mid-string without an expand affordance; a truncated Thai phrase can read as a different word. Copy written in Thai first, then translated.
8. **Postgres full-text search does not work for Thai.** No inter-word spaces means `tsvector` reduces a Thai card name to one meaningless token. `pg_trgm` plus a `card_aliases` table, behind a single interface.
9. **Daily index snapshot per printing, from M1.** M2's deal-quality feature needs the index value *on the acquisition date*. Cheap now, unreconstructable later — the one genuinely irreversible omission available.
10. **Colour is never the only signal.** Verification pairs with a shield icon and text; estimates carry a `~` prefix and a label; accept/reject carry icons; chart series differ by line style.
11. **Backups are existential.** The catalog is manual labour and the primary asset. Losing it is not an outage.

---

## 10. Assumptions I am carrying

Seven questions were asked and not answered. I am proceeding on these assumptions; each is cheap to correct now and progressively more expensive later.

| # | Assumption | If wrong |
|---|---|---|
| A-a | Team is unchanged: partner on catalog/ops, founder on engineering with AI. Phase gates are the only clock; no external deadline | Changes sequencing and how much is parallelised, not what is built |
| A-b | No catalog data exists yet in usable form; the 200-card pilot has not run; JP Pokémon and One Piece licensing is unsettled | If data exists, M1's critical path shortens materially. **Worth answering early** |
| A-c | No Thai lawyer engaged, no PSP shortlisted. **Partially resolved 18 Aug** — landscape screened (spec §8.5), no vendor chosen | M4 is planned against a generic `PaymentProvider` interface. Note the new finding: PromptPay cannot be escrowed, which may matter more than the vendor choice |
| A-d | ~~Hosting is Vercel + managed Postgres~~ **RESOLVED 18 Aug** — single VPS in Singapore, Cloudflare in front, R2 for images and offsite backups. Under $25/mo. See spec §10.6 | — |
| A-e | Auth is phone-first with 6-digit OTP, per the mockups. SMS provider not selected | Thai SMS pricing affects unit economics at signup volume |
| A-f | WCAG AA is held as a build requirement, not a later audit | If AA is deferred, M0 shrinks and technical debt concentrates in the component library |
| A-g | No code exists; I am initialising a fresh git repo in this directory | Existing code would change the starting point entirely |

**A-b and A-c are the two worth answering this week.** A-b is the critical path; A-c has the longest lead time in the project.

---

## 11. Open questions inherited from the source documents

Not created by this session — carried forward, still unanswered. Ordered by what a wrong answer costs.

**Blocking M4 — the legal track, which should start immediately**
1. Thai legal opinion on the PSP delayed-capture structure. Unanswerable in the abstract: the lawyer needs a named provider's structure to opine on, which makes PSP selection a *prerequisite* to the legal conversation, not a follow-on.
2. PSP selection. Hard screen: delayed capture or split settlement · ≥5-day authorisation hold · inheritable merchant KYC · PromptPay · refund-to-source · usable sandbox. **The maximum authorisation-hold period is a hard technical ceiling on the 5-day escrow expiry rule** — confirm it before that rule is written into the state machine.
3. eKYC vendor, per-check cost, and whether a marketplace may act as an NDID relying party without its own licence. PSP merchant KYC covers sellers receiving payouts only; buyers are never merchant-onboarded, so buyer verification needs a second, payments-independent vendor.
4. PDPA obligations — same engagement, near-zero marginal cost, expensive to retrofit.

**Partner's market knowledge, not research**
5. Condition multiplier table (NM / LP / MP / HP / DMG) — needed before the index can normalise.
6. Photo tier thresholds (currently ~1,000฿ / 10,000฿).
7. Bulk-lot value ceiling above which quantity is forced to 1.
8. Exact commission rate within 5–8%, and whether it varies by game or value band.
9. Whether 10,000฿ is a real market norm or one Facebook group's local convention.

**Needs data**
10. Graded vs raw mix above 10,000฿ — decides whether cert-number verification is a feature or a rounding error.
11. Actual dispute rate — decides escrow vs a guarantee fund (assumption A3).
12. Every `[TBD]` in the milestone gate table, including A1's kill criterion. The 16 Aug spec proposes ≥400 weekly returning users by week 10 to continue and <150 to kill, but flags it as a hypothesis for the founders to set. **A kill criterion with a placeholder is not a kill criterion.**

**Strategic, with no mitigation on record**
13. Distribution. `01` names it as the top strategic risk and it is the only risk in the source documents with no mitigation beyond "go multi-group." The incumbent group admins *are* the current escrow business and they control distribution.

---

## 12. Open design questions

Carried from the UI spec, still live, each one a real fork:

1. Default density on search results — trader-compact or browser-grid? It signals who the product is for.
2. Whether portfolio value should be hideable. Collectors may be reluctant to display totals on a phone in public.
3. Meetup venue list — curated, or crowd-suggested with moderation?
4. Whether rejection rate shows as a raw count or a percentage. A percentage is fairer to high-volume buyers; a count is harder to game.
5. Whether a first-time visitor needs a price-index explainer, or the provenance component carries it alone.
6. **New, from this session:** unread-badge behaviour past 99. The handoff doc flags it as unspecified.

---

## 13. What I intend to write next

1. **`docs/superpowers/specs/2026-08-17-stacket-v1-design.md`** — the consolidated v1 design spec, reconciling both existing specs against the mockups and carrying every decision in §5. It supersedes the two 16 Aug specs, which stay on disk as history.
2. **Per-milestone implementation plans** — M0 through M4, one document each. A single plan spanning M0–M4 would be unreviewable.

Both existing specs remain accurate on everything not listed in §4. The changes are surgical, not a rewrite.
