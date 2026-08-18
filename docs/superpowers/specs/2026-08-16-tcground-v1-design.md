# TCGround v1 — Design Specification

**Status:** Draft for founder review
**Date:** 16 August 2026
**Supersedes:** nothing. Extends `files/01`–`files/04`.
**Scope:** All of v1, delivered as four public milestones.

---

## 1. Context

This document turns the discovery work in `files/01`–`files/04` into a buildable specification. Read those first; this assumes them.

**Team.** Two founders. One owns catalog data, market knowledge and operations (ten years in the industry). One owns engineering, working with AI assistance. No hard launch date — phase gates are real, not decorative.

**What changed since `files/04`.** That document records evidence quality as n=1. It is now n=2, one with a decade of industry experience. A6 ("the founder's pain generalises") is materially weaker than written, though two insiders in the same communities still do not constitute customer research. `files/04` §1 should be updated.

---

## 2. Decisions locked in this session

| # | Decision | Rationale |
|---|---|---|
| S1 | **Approach B** — portfolio pulled forward to M2 | `01` §5 and `03` §1 both argue for it and then defer it. Cheapest retention surface in the product; doubles as listing inventory for M3. |
| S2 | Catalog built by **import + manual gap-fill** | Public/licensed data for EN Pokémon; manual entry for JP, One Piece, Thai-exclusive. |
| S3 | **Seller-side commission, 5–8%**, split at settlement | Matches Shopee, Lazada, StockX, Sasom and crypto exchanges. Buyer pays the listed price. |
| S4 | **Price index records the price the buyer paid** (gross basis) | Same basis as TCGplayer and Cardmarket, which are the cold-start comps. Preserves D3's comparability logic. |
| S5 | Rejection costed by **reason code + public rejection rate** | Social cost, no money movement, no operator queue. |
| S6 | No-show: **mutual scan + 24h grace, then operator** | No automatic strikes. A flat tyre is not a permanent mark. |
| S7 | Escrow expiry: **48h to schedule, 5d hard**, configurable | Tighter than the 72h/7d alternative. Revisit at day 30 with data. |
| S8 | **Next.js + Postgres**, one repo, Thai-first | SSR for the SEO-critical catalog; Thai default with English fallback. |
| S9 | **Value-tiered photo requirements** replace the flat 6-shot gate | A flat gate contradicts the long-tail strategy in `01` §3. |
| S10 | **Bulk lots** — `quantity > 1` for identical raw cards | Real seller behaviour; multiple copies of one common are genuinely fungible. |
| S11 | **Admin tool is an M1 deliverable** | The catalog owner does not code. Without it every gap becomes an engineering ticket. |
| S12 | **Three verification tiers, applied to both sides** | PSP merchant KYC covers sellers only. Buyer verification needs a second vendor. |
| S13 | **Verified-to-verified required above 10,000฿** | Makes the marketing claim precise and true without adding friction to the long tail. |

---

## 3. Milestones

Development is continuous. Users see four public releases. No milestone is throwaway.

| # | Milestone | Contains | Gate to proceed |
|---|---|---|---|
| **M1** | Catalog & Price Index | Card database, search, filters, card pages, seeded prices, admin tool | **A1** — returning weekly users |
| **M2** | Portfolio | Holdings, valuation, deal quality, alerts | Weekly returning users with a portfolio |
| **M3** | Listings & Identity | Accounts, three-tier verification, listings, photo tiers, condition standard, reputation | **A2 + A4** |
| **M4** | Escrow & Settlement | PSP integration, both settlement flows, disputes, operator console | **Legal clearance — blocking** |

M1 and M2 require no accounts holding money, no legal clearance, and no other users.

### Parallel tracks

- **Data track** (partner) — week 1 to indefinitely. Import, gap-fill, price seeding, then the corrections and gaps queues.
- **Build track** (engineer) — M1 → M2 → M3 → M4.
- **Legal track** (both) — **starts week 1.** Escrow structure, PSP selection, PDPA. Long lead time; gates M4 entirely.

---

## 4. Domain Model

### 4.1 Core hierarchy

```
Game            Pokémon, One Piece, Palworld
  └─ Set        language, set_code, release_date, region
       └─ Card  collector_number, name_th, name_en, name_ja, rarity, artist
            └─ Printing   normal | holo | reverse_holo | 1st_edition |
                          unlimited | promo_stamp | ...
```

**Language belongs to `Set`, not `Card`.** Japanese sets are not translations of English sets — different codes, numbering, cadence and contents. There is no meaningful cross-language card link for most of the catalog.

**`Printing` is the tradeable unit.** Listings, holdings and price points all attach to `Printing`, never to `Card`. A reverse-holo and a normal printing of the same card are different objects with different prices. Getting this wrong makes the index worthless with no cheap migration.

### 4.2 Price index

**Storage:** every price point at `(printing, condition)`.

**Computation:** headline index at `printing` level, condition-normalised via a multiplier table (NM / LP / MP / HP / DMG). Per-condition breakdown displayed only where real data exists; elsewhere show the normalised estimate, labelled as an estimate.

Rationale: G2 targets ≥3 settled points per top-500 card in 90 days. Split five ways that is effectively ≥15, in a market with explicitly low transaction frequency. Most buckets will be empty.

**Graded cards are a separate index**, keyed `(printing, grading_company, grade)`. A PSA 10 does not belong in the same series as a raw NM.

**No cross-language merging, ever.** Falls out of the model, since sets carry language.

**Basis: gross — the price the buyer paid.** Commission is deducted from the seller's proceeds and is not subtracted from the recorded price. This matches TCGplayer, Cardmarket and StockX, which are the seed comps.

Every transaction stores `gross_paid`, `commission`, `net_to_seller`. A net-basis series can be computed later without re-auditing history.

**A bulk sale is one price observation, not N.** Otherwise one 5-unit sale swamps the index for that card.

### 4.3 Provenance

Every price point carries:

- `source` — `platform_settled` | `facebook_observed` | `international_comp` | `operator_entered`
- `confidence`

**Only `platform_settled` counts toward the authoritative index** (`02` §8.7). Everything else is labelled unverified in the UI — visibly, not in a footnote.

Two reasons this must exist before the first row: credibility with a community that will immediately test whether the prices are real, and the manipulation wall from `01` §7, which cannot be retrofitted without re-auditing every historical row.

**Known basis discontinuity.** `facebook_observed` rows carry no commission; `platform_settled` rows are gross of a commission sellers may partially pass through. Mitigations: the two sources are already visibly distinct series; mark the chart at the date platform-settled data begins; calibrate underpricing fake-detection thresholds per source rather than globally.

### 4.4 Search

**Postgres full-text search does not work for Thai.** Thai script has no inter-word spaces, so `tsvector` tokenises a Thai card name into one meaningless token. This threatens G1 and the SEO wedge.

**Use `pg_trgm` trigram similarity** — language-agnostic, tolerant of typos and transliteration variance, no word segmentation required. Plus:

- **`card_aliases`** — nicknames, community shorthand, transliterations, common misspellings. Populated by the partner through the admin tool. Ten years of knowing what people actually call cards, encoded as a feature.
- **Direct `set_code + collector_number` lookup** — serious traders search `SV1a 123`, not names.

All search behind a single module interface so a swap to Meilisearch or Typesense is one file.

### 4.5 Listings

One listing = one physical card, or one batch of identical cards.

- `printing`, `condition` **or** `grading` (mutually exclusive), price, photos, seller, status
- **`quantity`** — default 1. `> 1` permitted only for **raw** cards at a **single declared condition**
- **Graded listings are always `quantity = 1`** — every slab has a unique cert number
- Above a value ceiling `[TBD — partner]`, quantity is forced to 1
- Batch photos are labelled representative: *"you will receive one of N similar cards"*
- Buyers may purchase a partial quantity; the listing decrements under a row lock so two buyers cannot take the same copy

### 4.6 Photo protocol — value-tiered

Replaces the flat six-shot publication gate in `02` §8.4, which contradicts the long-tail strategy in `01` §3. Forty cards × six shots = 240 photos; that seller returns to Facebook.

| Listing price | Required | Badge |
|---|---|---|
| Under ~1,000฿ | Front + back | — |
| 1,000–10,000฿ | Front, back, 4 corners | Verified Photos |
| Over 10,000฿ | Full 6-shot incl. raking light | Full Protocol |

Thresholds `[TBD — partner]`. The badge is a seller quality signal, not a publication gate; any seller may voluntarily upgrade a listing to earn it. Counterfeit risk scales with value, so evidence requirements should too.

### 4.7 Other entities

**`Holding`** (M2) — `printing`, `condition`, quantity, acquired price, acquired date, notes. Converts to a listing in one tap in M3.

**`Transaction`** — append-only event log (§7.1). Nothing updates in place.

**`User`** — verification tier, reputation counters (completed, no-shows, rejections given, disputes), tenure. Never editable, never transferable.

---

## 5. M1 — Catalog & Price Index

### 5.1 Public surface

**Search**
- [ ] Trigram search over `name_th`, `name_en`, `name_ja` and aliases
- [ ] Thai query returns the correct card in the top 5
- [ ] `SV1a 123` style lookup resolves directly to the card page
- [ ] Misspellings and transliteration variance resolve — threshold tuned against a partner-authored test set
- [ ] Filters: game, set, rarity, language, condition, price range
- [ ] **Zero-result queries are logged** — this is the gaps queue input and free demand data

**Card page** — the SEO surface and the only free acquisition channel. Server-rendered, one page per printing.
- [ ] Names in all three languages, set, number, rarity, artist, reference image, cross-links to sibling printings
- [ ] Price index: headline number, sparkline, per-condition breakdown where data exists, labelled estimates elsewhere
- [ ] **Provenance visible** — "based on N platform sales" vs "estimated from N observed listings"
- [ ] Live listings slot — empty in M1, populated in M3. Build the slot now.
- [ ] Thai metadata, canonical URLs, `Product` structured data, full sitemap
- [ ] **No account required anywhere in M1 or M2**

**Corrections** — anonymous submission, one field plus optional photo, routed to the partner's queue.

### 5.2 Admin tool

Ships **with** M1, not after. The catalog owner does not code; if adding a card requires an engineer, the moat stalls and `03` §4.2's supply leak becomes real.

- [ ] **Card CRUD** — create, edit, merge duplicates, deprecate; search including unpublished
- [ ] **Bulk CSV import** — schema validation, **dry-run diff**, rollback of the last import. A bad 2am import must be reversible without the engineer.
- [ ] **Set management** — create a set with language and code, bulk-attach cards
- [ ] **Printing management** — add a variant without re-entering the card
- [ ] **Image upload** — automatic resize, CDN handoff
- [ ] **Price point entry** — manual, mandatory source label and confidence; bulk paste for archaeology sessions
- [ ] **Alias management** — nicknames and transliterations on any card
- [ ] **Corrections queue** — accept / reject / edit inline, submitter evidence shown beside the current record
- [ ] **Gaps queue** — ranked by zero-result search volume
- [ ] **Audit log** — who changed what, when, revertible

Role-based auth, separate route, not indexed.

### 5.3 Data seeding

Import EN Pokémon from public APIs. Hand-fill JP, One Piece and Thai-exclusive sets. Seed prices from Facebook archaeology and international comps, every row labelled unverified.

**Run the 200-card pilot from `04` §7 before committing to full coverage.** It produces the real cost-per-card A5 needs and stress-tests the admin tool while changing it is still cheap.

### 5.4 Gate

`04` §2 leaves A1's kill criterion as a placeholder. A kill criterion with a placeholder is not a kill criterion.

**Proposed hypothesis, for the founders to set properly before M1 ships:** ≥400 weekly returning users by week 10 continues; <150 kills the thesis and M3 spend stops; between the two, extend and diagnose.

---

## 6. M2 — Portfolio

- [ ] Add a holding — printing, condition, quantity, acquired price, acquired date, notes
- [ ] One-tap add from any card page
- [ ] Collection list — current value, cost basis, unrealised gain/loss per card and in total
- [ ] Value-over-time chart
- [ ] **CSV import** — many serious collectors arrive with a spreadsheet; cheapest possible switching-cost reduction
- [ ] Private by default
- [ ] Price alerts — "notify me on ±X%". Email in M2; push with the native app.
- [ ] Holdings persist independently of listings, enabling M3's one-tap list

### 6.1 Deal quality vs appreciation

Two distinct questions the docs conflate:

- **"Did I get a bargain?"** — acquired price vs index value **on the acquisition date**
- **"Has it gone up?"** — acquired price vs index value **today**

A card bought 20% under market that has since fallen 30% is a good buy *and* a loss.

- [ ] Deal quality per holding — *"you paid ฿850; market was ฿1,040 that week — 18% below"*
- [ ] Appreciation since purchase, displayed separately
- [ ] Collection-level roll-up of both
- [ ] Honest "insufficient data" state where the index had no coverage on that date. **Never fabricate a benchmark.**
- [ ] **Comparisons are like-for-like on the gross basis.** A platform purchase at ฿543 is compared against the gross market price, not a net figure, or every platform purchase reads as an overpay.

**Requirement this creates: a daily index snapshot per printing, running from M1.** Cheap now, unreconstructable later.

**Risk.** Portfolio value is only as credible as the index behind it, and in M2 the index is entirely seeded. Mitigation is §4.3's provenance labelling — show the work; never present an estimate as a fact.

Accounts here require **phone or email only**. No KYC, no bank details. Identity friction arrives only when money does.

---

## 7. M3 — Listings & Identity

### 7.1 Verification — three tiers, both sides

**How PSP KYC works.** The PSP is the regulated entity; whoever settles funds to a person performs CDD on that person. The flow: seller crosses the threshold → platform calls the PSP's sub-merchant onboarding API → PSP returns a hosted onboarding link → seller submits national ID, ID image, liveness selfie, bank account and address **on the PSP's surface** → PSP runs verification and AMLO screening → webhook returns status.

**The platform stores only** `psp_merchant_id`, `kyc_status`, `verified_name`, `verified_at`. **No ID documents ever enter the platform database.** This is the primary PDPA mitigation (§9.3) and must be stated as a deliberate design decision, not an accident. The bank-name-match requirement falls out for free by comparing `verified_name` to the payout account.

**The gap.** PSP merchant KYC covers only those receiving payouts — sellers. Buyers pay by card or PromptPay and are never merchant-onboarded. Verifying buyers requires a **second, payments-independent eKYC vendor**.

| | Vendor | Covers | Mandatory |
|---|---|---|---|
| Merchant KYC | PSP | Sellers receiving payouts | Above threshold |
| Identity KYC | eKYC provider | Buyers and sellers | Per tier below |

Candidates to evaluate: NDID via a relying-party aggregator, ThaiID (DOPA), commercial eKYC vendors operating in Thailand. **Capabilities, pricing and whether a marketplace may act as an NDID relying party without its own licence must be verified directly** — fold into the §11 legal conversation. Expect a per-check cost, which is itself an argument against universal verification.

**Tiers**

| Tier | Requires | Buyer unlocks | Seller unlocks |
|---|---|---|---|
| **Basic** | Phone + email | Browse, portfolio, buy under 10,000฿ | — |
| **Bank-verified** | Bank account name match | — | Sell under 10,000฿ |
| **ID-verified** ⭐ | Government ID + liveness | Buy at any value, **verified badge** | Sell at any value, **verified badge** |

- [ ] **Above 10,000฿, both parties must be ID-verified.** Not the seller alone.
- [ ] Threshold configurable — `04` §4 doubts whether it is a market norm or one group's convention
- [ ] Verification prompted by intent (crossing a threshold, or hitting a listing that requires it), never at signup or first listing
- [ ] Seller KYC inherited from the PSP; buyer KYC from the eKYC vendor

**Market-enforced verification below the threshold.** Do not mandate it — let sellers demand it.

- [ ] Sellers can mark any listing **"verified buyers only"**
- [ ] Buyers can filter for verified sellers
- [ ] Badge visible on profile, listing, search results and the meetup flow
- [ ] Verified buyers get higher escrow limits and skip any meetup deposit

Sellers with desirable cards will gate them; buyers who want those cards will verify. Adoption rises without the platform imposing a wall. It also attacks ghosting directly — a no-show attached to a government identity is a different proposition from one attached to a burner account.

**Marketing claims must be precise.** The claim *is* the product.

- ✅ "Every high-value trade is between verified identities"
- ✅ "Verified badge = government ID checked and face-matched"
- ✅ "Every seller above 10,000฿ is identity-verified"
- ❌ "All our users are KYC verified" — untrue while it is optional below the threshold

### 7.2 Listings

- [ ] Create by selecting a catalog printing, then condition, price, quantity, photos
- [ ] **One-tap list from a portfolio holding** — identity and condition pre-filled
- [ ] Bulk flow — multiple cards per session, shared fields entered once
- [ ] Value-tiered photo requirements (§4.6) with badges for exceeding them
- [ ] Condition is enumerated, with definitions and example images shown at selection. **Never free text.**
- [ ] Graded listings capture company, grade, cert number; quantity forced to 1
- [ ] **Net proceeds shown before publish** — *"list at ฿540, you receive ฿497"*
- [ ] Card not in the catalog → inline "request this card", routed to the gaps queue, listing saved as draft. **Never a dead end.**
- [ ] Underpriced listings auto-flag for review — `01` §4.2, underpricing is the strongest available counterfeit signal, and the index provides it free

### 7.3 Reputation

Public, non-editable, non-transferable: completed transactions, no-shows, **rejections given**, dispute rate, tenure, verification tier.

---

## 8. M4 — Escrow & Settlement

### 8.1 Transaction state machine

Every transition is an **append-only event** in `transaction_events`. Current state is derived. Nothing updates in place. Money and reputation both depend on the history being reconstructable, and a complete log is what makes the 10-minute dispute target achievable.

**Face-to-face**

```
committed ──> scheduling ──> scheduled ──> checked_in ──> settled
   │  (48h)       │             │              │      └─> refunded (reject)
   │              │             │              └────────> no_show_review
   └──────────────┴─────────────┴───────────────────────> expired (5d hard)
```

- [ ] Buyer commits — PSP authorises. **The platform holds nothing at any point.**
- [ ] 48h to agree a meetup; 5d hard expiry from commit. Both configurable.
- [ ] **Confirm the PSP's maximum authorisation-hold period** — it is a hard technical ceiling on the 5d rule
- [ ] Mutual QR check-in between both devices
- [ ] Accept → immediate capture, commission split, seller paid
- [ ] Reject → immediate void and refund; **structured reason code required**; public rejection rate updated
- [ ] Missed mutual check-in → auto-refund, **24h grace** for the absent party to respond, operator decides before any strike lands
- [ ] Suggested public meetup locations — malls, card shops, tournament venues

**Shipped**

```
committed ──> shipped ──> delivered ──> inspection (48h) ──> settled
                                             │        └──(auto-release)
                                             └──> disputed ──> operator
```

- [ ] Tracking entry required; delivery confirmation starts the 48h window
- [ ] Buyer accepts, or auto-release fires at expiry
- [ ] **Dispute requires an unboxing video, disclosed at commit time** — not discovered at dispute time

### 8.2 Disputes and the operator console

`03` §5 identifies this as the queue that consumes the operator. The console is a product requirement, scored on **minutes per dispute**.

- [ ] One screen per dispute: listing photos, unboxing video, check-in record, full event log, both parties' reputation history, side by side
- [ ] Structured evidence submission with deadlines. No free-form email threads.
- [ ] Three one-click decisions: release, refund, split
- [ ] Outcome auto-writes to both profiles
- [ ] Templated Thai-language responses
- [ ] **Target: under 10 operator-minutes per dispute.** A design that exceeds it is the wrong design.

**Seller protection against bad-faith rejection** — the edge case in `02` §7 with no mechanism behind it:
- [ ] Seller may contest a rejection within 24h
- [ ] Statistical outliers on buyer rejection rate auto-flag
- [ ] Repeated bad-faith rejections restrict escrow access

Reputation carries the cost, not money — no adjudication of intent, therefore no new operator queue.

### 8.3 Commission

- [ ] 5–8% seller-side `[TBD — exact rate]`, deducted at settlement by the PSP via split settlement or partial capture
- [ ] **Buyer pays exactly the listed price, always**
- [ ] Rate configurable per game and per value band
- [ ] Zero commission on refunds and rejections
- [ ] **Only `settled` transactions write to the price index** — the manipulation wall, enforced in code, not policy

### 8.4 PSP selection

The highest-stakes vendor decision in the product. `03` §5: identity, merchant KYC and settlement all run through one supplier.

Hard screen: delayed capture or split settlement; ≥5-day authorisation hold; inheritable merchant KYC; PromptPay support; refund-to-source; a usable sandbox.

**Screen during M1, not M4.** The legal question in `04` §3 is unanswerable in the abstract — the answer depends on which provider's structure is being described to the lawyer.

---

## 9. Architecture

### 9.1 Modules

One Next.js repo, Postgres, hard internal seams. The binding constraint is one engineer holding one module in context at a time.

```
catalog/      games, sets, cards, printings, aliases, corrections
search/       query interface — trigram implementation behind it
pricing/      price points, index computation, daily snapshots, provenance
portfolio/    holdings, valuation, deal quality, alerts
listings/     listings, photos, condition, quantity/lots
identity/     users, tiers, reputation, PSP + eKYC handoff
transactions/ state machine, events, escrow orchestration
payments/     PSP adapter — interface plus one implementation
admin/        catalog tools, queues, operator console
```

### 9.2 Four decisions worth naming

1. **Search behind an interface.** `search.query(...)` is the only entry point. Swapping the implementation is one file.
2. **PSP behind an adapter.** `PaymentProvider` exposes `authorize / capture / void / refund / splitSettle / onboardMerchant`. **No PSP type leaks past it.** The vendor concentration risk cannot be removed, but it can be contained — this is the difference between switching providers in weeks and rewriting M4. The eKYC vendor gets the same treatment.
3. **The platform has no money in it.** No balance table, no ledger of held funds, ever. Transactions store references to PSP objects only. This is the legal position from `02` §5.3 — a schema with a balances table undermines the lawyer's argument.
4. **Transactions are append-only.** `transaction_events` is the source of truth; state is derived.

### 9.3 PDPA

Not covered in `files/01`–`04`; it applies directly.

Already mitigated by architecture: **no ID documents stored** (§7.1), since KYC lives with the PSP and eKYC vendor.

Still required:
- [ ] Privacy policy and signup consent
- [ ] Documented lawful basis for processing
- [ ] Data subject access and deletion handling
- [ ] Retention policy
- [ ] **Settled transactions and reputation are anonymised, not deleted** — they cannot simply vanish

Fold into the same lawyer engagement as escrow; the marginal cost is near zero and retrofitting is not.

### 9.4 Background jobs

- **Daily price index snapshot per printing** — from M1. M2's deal-quality feature depends on it and it is unreconstructable later.
- **Escrow expiry sweeps** — 48h scheduling, 5d hard
- **Inspection auto-release** at 48h post-delivery
- **Price alerts**
- **Zero-result search aggregation** → gaps queue ranking

### 9.5 Non-functional

**SEO is infrastructure.** The only free acquisition channel and the reason for web-before-app.
- [ ] Every card page server-rendered with unique Thai title and description
- [ ] Auto-regenerating sitemap covering the full catalog
- [ ] `Product` + `Offer` structured data
- [ ] Core Web Vitals green **on a mid-range Android over 4G**

**Performance**
- [ ] Card page TTFB < 500ms
- [ ] Search results < 300ms at 100k printings
- [ ] Index reads served from materialised snapshots, never computed per request

**Mobile-first, not responsive-as-afterthought.** Meetups happen in malls, on phones, with poor connectivity and one hand free. The QR check-in is a phone flow.

**Locale** — Thai default, English fallback, THB, Asia/Bangkok, Buddhist-era dates where users expect them.

**Backups are existential.** The catalog is manual labour and the primary asset. Automated daily backups, tested restore, point-in-time recovery. Losing the catalog is not an outage.

---

## 10. Metrics and gates

| Milestone | Gate | Target | Status |
|---|---|---|---|
| M1 | A1 — weekly returning users at wk10 | ≥400 continue / <150 kill | ⚠️ hypothesis — founders to set |
| M1 | A5 — cost per card | `[TBD]` | ⚠️ run the 200-card pilot |
| M2 | Weekly returning users with a portfolio | `[TBD]` | ⚠️ set before M2 ships |
| M3 | A2 — listings per active seller per week | ≥5 (trader persona) | `02` §9 |
| M3 | A4 — KYC upgrade completion when prompted | ≥70% target, <50% kills the threshold | `02` §9 |
| M4 | Legal clearance | binary | **blocking** |
| M4 | Escrow completion without dispute | ≥98% | `02` §9 |
| M4 | Operator minutes per dispute | <10 | new — two-person constraint |
| M4 | Meetup no-show rate by day 90 | <10% | `02` §9 |

Tracked throughout: search→listing-view rate (≥40%), % listings meeting their photo tier, price index coverage of top-500, median seller messages per completed sale (≤2), and **high-value volume before vs after verified-to-verified enforcement**.

---

## 11. Open questions

**Blocking M4 — start week 1**
1. Thai legal opinion on the PSP delayed-capture structure (`04` §3)
2. PSP selection against §8.4 — required *before* the lawyer conversation, not after
3. eKYC vendor selection, per-check cost, and whether a marketplace may act as an NDID relying party without its own licence
4. PDPA obligations (§9.3), same engagement

**Partner's market knowledge, not research**
5. Condition multiplier table (NM / LP / MP / HP / DMG)
6. Photo tier thresholds
7. Bulk-lot value ceiling
8. Exact commission rate, and whether it varies by game or value band
9. Whether 10,000฿ is a real market norm or one group's convention

**Needs data**
10. Graded vs raw mix above 10,000฿ — decides whether cert verification matters
11. Actual dispute rate — decides escrow vs guarantee fund (A3)
12. JP Pokémon and One Piece data licensing — buy, scrape, or crowdsource
13. Every `[TBD]` in §10
14. Whether verified-to-verified suppresses high-value volume

**Later**
15. Whether a relationship with existing group admins is needed. `01` §7 names distribution as the top strategic risk, and it is the only risk in these documents with no mitigation beyond "go multi-group."

---

## 12. Changes required to existing documents

| Doc | Change |
|---|---|
| `04` §1 | Evidence quality is n=2, one with ten years' industry experience. A6 is weaker than stated. |
| `02` §8.4 | Flat six-shot gate → value-tiered requirements (§4.6) |
| `02` §8.5 | Two tiers → three, applied to both sides of the market (§7.1) |
| `02` §8.7 | Add explicit index basis (gross) and provenance model (§4.2–4.3) |
| `02` §13 | Portfolio moves from P2 to M2 |
| `03` §2 | Three open settlement decisions resolved (S5, S6, S7) |
| `01`, `02` | Add PDPA as a compliance requirement |
| All | Fill every `[TBD]` |
