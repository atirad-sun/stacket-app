# PRD — Thai TCG Peer-to-Peer Marketplace (v1)

**Status:** Draft for cofounder review
**Date:** 12 August 2026
**Owner:** [Founder]
**Scope:** v1 only. Phases 2+ are listed as Future Considerations, not commitments.

---

## 1. Context

The Thai trading card market (Pokémon, One Piece, Palworld, and adjacent TCGs) currently transacts primarily through Facebook groups.

Observed conditions in the primary group:

- ~100,000 members
- 50+ buy/sell/bid posts per day
- Listings are free-text posts; multi-card listings put price and condition in the description or comments
- **Under 10,000 THB:** direct PromptPay transfer. Seller posts their ID-card name; buyer verifies it matches the receiving bank account. Handover by Messenger arrangement or face-to-face.
- **Over 10,000 THB:** the group admin acts as manual escrow. Funds are held, the parties meet and inspect, the admin releases to the seller.
- Collectors hold inventory for weeks to years, then resell. Transaction frequency per user is **low**; price-checking frequency is **high**.

**Evidence quality — read this before trusting the rest of the document.** Everything above is founder observation from active participation in the market. It is n=1. Section 11 lists what must be validated before major spend.

---

## 2. Problem Statement

Buyers cannot find, price, or trust what they want to buy. Cards are not searchable because listings are unstructured free text; prices are wildly inconsistent because there is no shared reference; and sellers are unverified, so every purchase carries counterparty and counterfeit risk. Sellers lose hours to low-intent Messenger conversations, get ghosted at scheduled meetups, and are pressured into ship-first-pay-later arrangements that are usually fraud.

The manual admin escrow that partially solves this is a single human bottleneck, a single point of fraud, and does not scale past a few deals a day.

**Cost of not solving:** the market's growth is capped by trust, not demand. High-value trades either don't happen or route to a curated retail platform that charges retail margin and does not serve the long tail.

---

## 3. Strategic Position

| | Sasom / retail platforms | Facebook groups | **This platform** |
|---|---|---|---|
| Inventory | Curated, shop-supplied | Peer-to-peer, unlimited | Peer-to-peer, unlimited |
| Trust mechanism | Platform takes custody + authenticates | None (social reputation only) | Verified identity + escrow + buyer inspection |
| Price discovery | Retail list price | None | Transaction-based index |
| Long-tail / low-value cards | Uneconomic to serve | Served, chaotically | **Served, structurally** |
| Speed | Days to ship | Same-day possible | Same-day possible |

**Position:** structured peer-to-peer. We do not compete with curated retail on the high end and we do not take custody of cards.

**Deliberate design premise:** cards are non-fungible. Condition variance *is* the market. The platform is built around per-item listings with rich condition evidence, not an interchangeable-SKU order book.

---

## 4. Goals

Outcomes, not outputs. Targets are hypotheses to be revised after the validation in §11.

1. **G1 — Make cards findable.** A buyer can locate every active listing for a specific card, by set and printing, in under 30 seconds. *Measure:* search→listing-view rate ≥ 40%.
2. **G2 — Establish a price reference.** Every card detail page shows recent and average settled prices. *Measure:* ≥ 60% of top-500 cards have ≥ 3 settled data points within 90 days of launch.
3. **G3 — Make transactions safe without custody.** *Measure:* ≥ 98% of escrowed transactions complete without dispute; zero platform-held funds at any time.
4. **G4 — Remove pre-sale negotiation overhead.** *Measure:* median seller messages per completed sale ≤ 2.
5. **G5 — Eliminate uncosted ghosting.** *Measure:* meetup no-show rate below 10% by day 90.

---

## 5. Non-Goals (v1)

Each of these is a deliberate cut, not an oversight.

1. **We do not authenticate or grade cards.** Operationally expensive, requires facility and trained staff, and creates liability when we are wrong. The buyer inspects — at the meetup or in the delivery window — and escrow makes being wrong reversible.
2. **We do not take custody of cards.** No warehouse, no two-leg shipping. Custody is uneconomic below ~2,000 THB and adds days to a market that trades same-day.
3. **We do not custody money.** Holding funds triggers Thai payment-services and escrow licensing. Escrow is implemented via a licensed PSP using delayed capture or split settlement. **Blocking legal review required — see §12.**
4. **No blockchain / NFT provenance.** A token is only as trustworthy as the party attesting the physical match, and cannot prevent off-platform resale or post-mint damage. It wraps trust we have not yet earned. Digital token issuance also falls under Thai SEC oversight. Revisit at Phase 3.
5. **No auction/bidding engine in v1.** High-value and desirable, but requires simultaneous two-sided liquidity. Fixed-price and offer-based selling first. Phase 2.
6. **No in-app chat as a primary surface.** Messenger volume is a *symptom* of missing structured data, not a feature to optimize. Structured listings should make most conversation unnecessary. Minimal transaction-scoped messaging only.
7. **No native mobile app at launch.** v1 is responsive web so the catalog is search-indexable and shippable daily. Native app arrives with the portfolio feature, where the daily-open habit justifies it.

---

## 6. Personas

- **Collector-Investor (primary buyer).** Buys cards to hold weeks to years. Checks prices frequently, transacts rarely. Cares about condition accuracy and price fairness.
- **Active Trader (primary seller).** Lists tens of cards at a time. Time-poor. Cares about listing speed, buyer seriousness, and not getting ghosted.
- **Casual Seller.** Clearing a collection, a few low-value cards. Extremely friction-sensitive. **Will return to Facebook if onboarding is heavy — this persona constrains the KYC design.**
- **Platform Operator.** Handles disputes and verification review. Headcount cost that scales with volume; the design must minimize their load.

---

## 7. User Stories

**Buyer**
- As a collector, I want to search for a specific card by name, set, and printing so I can see every available listing rather than scrolling a feed.
- As a collector, I want to see recent settled prices for a card so I can judge whether an asking price is fair.
- As a collector, I want to see standardized condition photos so I can assess a card before committing money.
- As a collector, I want to see whether a seller's identity is verified and their completed transaction history so I can judge counterparty risk.
- As a collector, I want to inspect a card in person before payment is released so a bad card costs me nothing.
- As a collector buying remotely, I want a window to inspect on arrival before funds release so shipping does not mean losing recourse.

**Seller**
- As an active trader, I want to list many cards quickly against a card database so I do not retype details for every card.
- As an active trader, I want buyers to commit funds to escrow before we schedule a meetup so I stop losing time to no-shows.
- As an active trader, I want my completed sales to build a visible track record so my reputation travels with me.
- As a casual seller, I want to list a low-value card without submitting government ID so the barrier is proportionate to the transaction.

**Edge cases**
- As a buyer, I want to reject a card at the meetup and have my money returned immediately.
- As a seller, I want protection when a buyer rejects a card in bad faith after inspection.
- As either party, I want a no-show recorded against the other party's profile.

---

## 8. Requirements

### P0 — Must have

**8.1 Card Catalog**
Canonical database of cards with set, set code, card number, rarity, language (EN/JP/TH), printing variant (1st edition, holo, reverse holo, promo), and reference imagery. Each card has a detail page that serves as the search and filter index.

*This is the single largest v1 line item and it is data work, not engineering. Resource it accordingly.*

- [ ] Search by card name, set, set code, and number, in Thai and English
- [ ] Filter by game, set, rarity, language, condition, price range
- [ ] Card detail page lists all active listings for that card
- [ ] Variants are distinguishable (EN vs JP printing of the same card are separate records)
- [ ] Coverage at launch: Pokémon EN + JP + Thai-exclusive sets; One Piece. Others deferred.
- [ ] Community correction submission with operator review

**8.2 Structured Listings**
- [ ] Seller creates a listing by selecting a catalog card, then setting condition, price, and photos
- [ ] Bulk listing flow: add multiple cards in one session without re-entering shared fields
- [ ] Listing cannot publish without required photos and a declared condition

**8.3 Condition Standard**
Adopt the international TCG scale — **Near Mint / Lightly Played / Moderately Played / Heavily Played / Damaged** — with Thai-language definitions and visual examples. Graded cards (PSA/BGS/CGC) are recorded with grading company, numeric grade, and cert number instead.

- [ ] Condition is a required, enumerated field — never free text
- [ ] Each grade shows its definition and example images at selection time
- [ ] Graded listings capture cert number

*Rationale for adopting rather than inventing: a custom scale makes Thai prices incomparable to international data and destroys the cheapest cold-start source for §8.7.*

**8.4 Photo Protocol**
Required shots: front, back, four corners, and one angled shot under raking light (reveals holo pattern and print texture — where most counterfeits fail).

- [ ] Listing cannot publish with fewer than the required shots
- [ ] Guided capture UI shows the required angle at each step
- [ ] Compliant listings display a badge

**8.5 Tiered Identity Verification**
Mirrors the threshold the community already accepts.

| Tier | Requirement | Unlocks |
|---|---|---|
| Basic | Phone + email + bank account name match | Buying; selling under 10,000 THB |
| Verified | Full KYC via PSP onboarding | Selling at any value; verified badge |

- [ ] KYC is inherited from the PSP's merchant onboarding, not built in-house
- [ ] A basic-tier seller is prompted to upgrade only when a listing exceeds the threshold
- [ ] Verified badge visible on listing and profile
- [ ] Bank account holder name must match verified identity before any payout

*Constraint: KYC is friction at the moment supply is scarcest. Do not gate signup or first listing on it.*

**8.6 Escrow & Settlement (no platform custody)**
Funds are captured by a licensed PSP and released on buyer acceptance. The platform never holds funds.

*Face-to-face flow:*
- [ ] Buyer commits payment to escrow before a meetup is scheduled
- [ ] Both parties check in at the meetup (QR scan between the two apps)
- [ ] Buyer accepts or rejects on the spot; accept releases funds immediately, reject returns them
- [ ] A no-show is recorded against the absent party's profile
- [ ] Suggested public meetup locations (malls, card shops, tournament venues)

*Shipped flow:*
- [ ] Seller enters tracking; delivery confirmation starts a 48-hour inspection window
- [ ] Buyer accepts, or auto-release fires at window expiry
- [ ] Dispute requires an unboxing video

**8.7 Price History**
- [ ] Card detail page shows recent settled prices and a rolling average, segmented by condition
- [ ] **Only transactions settled through platform escrow count toward the index.** Any other data is labelled unverified.
- [ ] Seed data at launch from Facebook post archaeology and international comps

*Manipulation risk: once the index has authority, sellers will fake sales to pump inventory. The settled-only rule is the defence and is non-negotiable.*

**8.8 Reputation**
- [ ] Public profile shows completed transactions, no-show count, dispute rate, and tenure
- [ ] Sold listings become visible transaction history
- [ ] Reputation is not editable or transferable

**8.9 Disputes**
- [ ] Either party can open a dispute within the inspection window
- [ ] Structured evidence submission (photos, video, meetup check-in record)
- [ ] Operator decision releases or refunds; outcome recorded on both profiles

### P1 — Should have

- Ghosting deposit: small refundable buyer commitment forfeited on no-show
- Saved searches with alerts (fits the low-frequency, high-attention collector)
- Seller storefront pages
- Scan-to-list via card image recognition
- Shipping label integration with insured carriers

### P2 — Future Considerations (design for, do not build)

- **Portfolio tracker.** Collection value over time. This is the likely daily-habit surface and the strongest retention play — architect listings and catalog so a card can be *owned* rather than only *listed*.
- Auction engine with proxy bids, anti-snipe extension, bid deposits
- Optional paid third-party authentication for high-value cards
- Native mobile apps
- Provenance/ownership-history layer

---

## 9. Success Metrics

**Leading (weeks)**
- Catalog search sessions per week, and search→listing-view rate (target ≥ 40%)
- Listings created per active seller per week (target ≥ 5 for the trader persona)
- % listings meeting the photo protocol (target ≥ 80%)
- Escrow completion rate (target ≥ 98% without dispute)
- Median seller messages per completed sale (target ≤ 2)
- KYC upgrade completion rate when prompted (target ≥ 70%)

**Lagging (months)**
- GMV settled through escrow, and % of it above 10,000 THB
- Repeat seller rate at 90 days
- Meetup no-show rate (target < 10%)
- Price index coverage: % of top-500 cards with ≥ 3 settled data points in 90 days
- Dispute cost per transaction (operator minutes × volume)

---

## 10. Key Flows

**Face-to-face:** Buyer finds card → commits to escrow → parties schedule → both check in at meetup → buyer inspects → accept releases funds instantly / reject refunds instantly.

**Shipped:** Buyer commits to escrow → seller ships with tracking → delivery confirmed → 48h inspection window → accept or auto-release; dispute requires unboxing video.

The face-to-face flow is not a legacy fallback. It is the **cheapest possible authentication mechanism** — a motivated expert inspecting their own purchase, at zero operational cost — and it should be the best-designed surface in the product.

---

## 11. Riskiest Assumptions

Ordered by how much damage a wrong answer causes.

| # | Assumption | Cheapest test | Kill criterion |
|---|---|---|---|
| A1 | Traders will use a price/catalog tool that has no listings on it | Ship catalog + price index alone, no accounts | Under [X] weekly returning users by week 10 → thesis is wrong, stop before building the marketplace |
| A2 | Sellers will move transactions off Facebook | Manually broker 10 deals with enforced structure, spreadsheet only | Sellers refuse structure without an app → they will refuse with one |
| A3 | Scam rate is high enough to justify escrow | Survey 30 active traders on bad deals per 100 | If 1–2 per 100, a guarantee fund may beat escrow on cost |
| A4 | KYC does not kill supply | A/B the prompt timing during beta | Upgrade completion under 50% → threshold is wrong |
| A5 | Catalog can be built inside budget | Time-box a 200-card pilot, measure cost per card | Extrapolated cost exceeds [Y] → narrow to Pokémon only |
| A6 | Founder's pain generalizes | Interview 5 sellers *unlike* the founder (casual, bulk, low-value) | They report no pain → we are building for n=1 |

---

## 12. Open Questions

**Blocking**
- **[Legal]** Does the PSP delayed-capture model avoid payment-services and escrow licensing obligations under Thai law? *Nothing ships until a Thai lawyer confirms. This is not a question the team can answer internally.*
- **[Legal/Finance]** Which PSP — and does their merchant onboarding satisfy our KYC requirement without a parallel build?
- **[Data]** What share of 10,000 THB+ trades are graded slabs vs raw? Determines whether cert-number verification is a meaningful feature or a rounding error.
- **[Product]** What is the actual dispute rate in the current market? Determines whether escrow or a guarantee fund is the right primitive (see A3).

**Non-blocking**
- **[Data]** Licensing and coverage for Pokémon JP and One Piece card data — buy, scrape, or crowdsource?
- **[Ops]** Dispute resolution SLA and expected operator minutes per dispute
- **[Product]** Commission rate, and who pays it — buyer, seller, or split
- **[Product]** Is the 10,000 THB tier threshold correct, or is it an artifact of one group's local convention?
- **[Ops]** Do we need a relationship with existing group admins, given they are the incumbent escrow business and control distribution?

---

## 13. Phasing

**Phase 1 — Catalog & Price Index (~8 weeks).** Card database, search, filters, card detail pages, seeded price history. No accounts, no listings, no payments. Web only. *Gate: A1 must pass before Phase 2 spend.*

**Phase 2 — Listings & Identity (~8 weeks).** Accounts, tiered verification, structured listings, photo protocol, condition standard, reputation. Deals may still close off-platform.

**Phase 3 — Escrow & Settlement.** PSP integration, both settlement flows, disputes. *Gated on legal clearance in §12 — start that conversation during Phase 1, not Phase 3.*

**Phase 4+.** Portfolio tracker, auctions, native apps.

**Budget notes.** The catalog is the largest line item and it is manual data work — do not staff it with engineers. Dispute handling is permanent headcount, not a one-time build; model it before promising escrow at scale.

**Team risk.** Engineers will gravitate to the marketplace and escrow systems because they are the interesting problems. The catalog is unglamorous data work and it is the thing that actually wins. Expect to defend the sequencing.

---

## 14. Parking Lot

Good ideas explicitly not in v1: NFT provenance; own-brand grading service; sealed product and box breaks; tournament/event integration; cross-border selling; consignment; insurance products; Facebook group integration as a distribution channel.
