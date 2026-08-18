# 01 — Strategy and Positioning

**Status:** Draft for cofounder review
**Last updated:** 16 August 2026

---

## 1. Market context

The Thai trading card market (Pokémon, One Piece, Palworld and adjacent TCGs) currently transacts primarily through Facebook groups.

Observed conditions in the primary group:

- ~100,000 members
- 50+ buy/sell/bid posts per day
- Listings are unstructured free text; multi-card posts put price and condition in the description or comments
- Bidding happens in comment threads
- **Under 10,000฿:** direct PromptPay transfer. The seller posts their ID-card name and the buyer checks it matches the receiving bank account. Handover by Messenger arrangement or face-to-face
- **Over 10,000฿:** the group admin holds funds as manual escrow, the parties meet and inspect, the admin releases to the seller
- Collectors buy to hold for weeks, months or years, then resell

Two behavioural facts drive most of the product design:

- **Transaction frequency per user is low. Price-checking frequency is high.** A collector may buy twice a year and check prices weekly.
- **Same-day face-to-face handover is normal.** Bangkok meetups are a live channel, not a legacy behaviour.

**Evidence quality: n=1.** All of the above is founder observation from active participation. See `04-validation-and-open-questions.md`.

---

## 2. Problems, by side of the market

**Buyers**

1. No way to search for a specific card — listings are free text in a feed
2. No price reference, so asking prices are wildly inconsistent and listings read as noise
3. Sellers are unverified; no reliable way to judge counterparty risk
4. Counterfeit cards, with no recourse after a PromptPay transfer clears
5. Bidding in comment threads: no proxy bids, no anti-snipe, no bid retraction

**Sellers**

6. High volume of low-intent messages; long conversations before a real buyer emerges
7. Buyers cancel meetups mid-schedule or fail to appear
8. Buyers push for ship-first-pay-later, which is usually fraud

**Root causes.** These seven collapse into two:

- **No structured data.** Problems 1, 2, 5 and 6 are all consequences of free-text listings with no canonical card identity and no price history.
- **No cost to defection.** Problems 3, 7 and 8 are all consequences of anonymity plus zero commitment — everything is free to start and free to abandon.

Problem 4 (counterfeits) is the only one that is genuinely about the physical object.

---

## 3. Competitive landscape

**Facebook groups — the real incumbent.** They hold the liquidity, and liquidity took years to build. A better UI does not move liquidity; sellers go where buyers are. This is the single largest strategic risk in the project.

**Sasom and curated retail platforms.** Sasom already operates in trading cards — Pokémon singles, booster boxes and packs, One Piece and Bandai as brands, a bid feature, and price bands extending past 50,000฿. They also publish content aimed directly at buyers worried about fakes from unreviewed marketplace sellers. **They are a live competitor in this exact category, not a distant analogy.**

**StockX as a model.** Referenced for UI and feature patterns. Two structural reasons its core mechanism does not transfer:

- **The order book requires fungibility.** A sneaker in a given size is interchangeable, which is what makes a bid/ask book work. Raw cards are not — condition varies continuously. Cards only become fungible once graded and slabbed.
- **Custody economics break at the low end.** Routing a 200฿ card through a warehouse with two shipping legs and an authenticator is negative before any margin. This is precisely why the Facebook long tail persists despite Sasom existing.

**Resulting position.**

| | Curated retail (Sasom) | Facebook groups | **This platform** |
|---|---|---|---|
| Inventory | Curated, shop-supplied | Peer-to-peer, unlimited | Peer-to-peer, unlimited |
| Trust mechanism | Custody plus authentication | Social reputation only | Verified identity, escrow, buyer inspection |
| Price discovery | Retail list price | None | Transaction-based index |
| Low-value long tail | Uneconomic | Served, chaotically | **Served, structurally** |
| Speed | Days | Same-day | Same-day |

**Sasom is the retail high end. We are the peer-to-peer market.** Custody only where value justifies it, escrow everywhere else, and a catalog deep enough to cover Japanese printings and Thai-exclusive sets that a general collectibles platform will never index.

---

## 4. Core strategic decisions

### 4.1 Non-fungibility is the design premise

Condition variance *is* the market — it is where price differentiates and where collector demand lives. The product is built around per-item listings with rich condition evidence, not interchangeable SKUs. This is a deliberate divergence from the StockX model.

### 4.2 The catalog is the wedge, not the marketplace

A searchable card index with real price history requires **no other users** to be useful. It can be built by indexing existing public Facebook posts and international comparables. It helps a buyer on day one with zero sellers, zero transactions, zero money touched, and no permission from any group admin.

It also solves counterfeits partially and for free: **underpricing is the strongest fake signal available.** Once market price is known, anything listed far below it can be auto-flagged. The same dataset that fixes search fixes scam detection.

### 4.3 The platform authenticates people, not cards

Card authentication requires a facility, trained staff, capital and liability. Cut entirely.

What identity verification actually buys is **consequence** — someone who can be found, banned and reported does not disappear with 30,000฿. This is a strong deterrent against exit scams and a weak one against fakes.

The gap is covered by making being wrong reversible: escrow plus a buyer inspection step. **The buyer becomes the authenticator** — a motivated expert inspecting their own purchase, at zero operational cost. Curated retail pays staff to do what the buyer does for free because it is their own money.

### 4.4 Face-to-face is a feature, not a fallback

A trader who can meet in Bangkok tonight will not wait ten days for warehouse clearance. The meetup flow with on-the-spot escrow release should be the best-designed surface in the product.

### 4.5 The platform never holds funds

Escrow runs on a licensed payment provider using delayed capture or split settlement. **Blocking legal review required.**

### 4.6 Verification is tiered to match existing norms

Light verification below 10,000฿, full KYC above. This mirrors a threshold the community already believes is fair, and avoids putting an ID upload in front of a casual seller listing one 300฿ card — friction at the exact moment supply is scarcest.

### 4.7 Chat is a symptom, not a feature

Messenger volume exists because price, condition and availability are ambiguous. Fixed price plus standardised condition photos plus committed payment means there is little left to ask. Build structured data, not better chat.

### 4.8 Web before native app

v1 is a catalog and price index — content, which wants to be a website. Google indexes it, so a buyer searching for a card price finds it without paid acquisition. No app review cycle, ship daily. The native app arrives with the portfolio feature, where the daily-open habit justifies it.

---

## 5. Sequencing logic

Ordered by **how few other users each step requires**:

1. **Catalog and price index** — needs nobody
2. **Portfolio / collection tracking** — needs only the individual user
3. **Listings** — needs sellers only
4. **Escrow and settlement** — needs both sides plus legal clearance
5. **Auctions** — needs simultaneous two-sided liquidity

The lower-frequency insight matters here: collectors transact rarely but price-check constantly, so a marketplace-only product starves on low frequency. The portfolio tracker is the likely daily-habit surface and the strongest retention play, even though it is deferred.

---

## 6. Decision log — positions that changed during discovery

Recording these because the reasoning is more useful than the conclusion.

| # | Original position | Revised to | Why |
|---|---|---|---|
| D1 | Build auctions first — nobody needs to trust you to place a bid, so it cold-starts easily | Build the catalog and price index first | The buyer-side problems (unsearchable, unpriceable) are more acute, and the catalog requires *zero* other users where auctions still require two-sided simultaneity |
| D2 | Escrow is the wedge; the admin bottleneck is the opportunity | Escrow is phase 3, gated on legal clearance | Founder is not an admin. Attacking escrow directly competes with the incumbent escrow operator who controls distribution and the ban button |
| D3 | Define a proprietary 5-point condition scale to own the market's vocabulary | Adopt the international NM/LP/MP/HP/DMG standard with Thai definitions | A custom scale makes Thai prices incomparable to international data, destroying the cheapest source of cold-start price seeding |
| D4 | Platform should verify card authenticity to make buyers feel safe | Verify sellers only; buyer inspects the card | Authentication is a facility, headcount and liability. Escrow plus an inspection window delivers the same felt safety at a fraction of the burn |
| D5 | Copy the StockX / Sasom model | Take UI and feature patterns only; reject the custody and order-book model | Order books need fungibility; custody economics break below roughly 2,000฿ — which is most of the market's volume |

---

## 7. Known strategic risks

- **Distribution.** Founder is a trader, not a group admin. Sellers posting platform links may be removed. Mitigation: go multi-group across Pokémon, One Piece and Palworld communities so no single admin can shut off distribution.
- **Incumbent conflict.** Group admins are the existing escrow business. They are either a partner or an opponent; there is no neutral.
- **Competitor already in category.** Sasom sells cards today. The defensible ground is the long tail and peer-to-peer, not the high-value curated end.
- **Catalog cost.** Largest line item, manual data work, and the thing engineers will least want to do.
- **Operational load.** Four support queues (catalog corrections, catalog gaps, disputes, manipulation review) all scale with volume rather than with code.
- **Price manipulation.** Once the index carries authority, sellers will fake sales to pump inventory. Only escrow-settled transactions may count toward the index.
- **Vendor concentration.** Identity, merchant KYC and settlement all run through one payment provider — a single point of failure across the whole product.

---

## 8. Explicitly deferred

NFT and blockchain provenance; own-brand grading; sealed product and box breaks; tournament integration; cross-border selling; consignment; insurance products; formal Facebook group partnership.

**On the NFT vision specifically:** a token is only as trustworthy as whoever attests that it matches a physical card, and it cannot prevent off-platform resale or post-mint damage. It is a wrapper around trust already earned, not a shortcut to it. Become the trusted attester first. Digital token issuance in Thailand also falls under SEC oversight, making it a legal conversation rather than only an engineering one.
