# 04 — Validation and Open Questions

**Status:** Draft for cofounder review
**Last updated:** 16 August 2026

This document exists because the rest of the documentation is confident and **none of it is validated**. Read this before approving spend.

---

## 1. Evidence quality

All market observations in these documents come from one founder's experience as an active buyer and seller in the Facebook groups. That is real founder-market fit and it is also **n=1**.

Specifically unverified:
- Whether the described pains generalise beyond the founder's own trading style
- The actual rate of bad transactions
- Whether sellers would move any part of their workflow off Facebook
- Whether the 10,000฿ threshold is a real market norm or one group's local convention

---

## 2. Riskiest assumptions

Ordered by how much damage a wrong answer causes.

| # | Assumption | Cheapest test | Kill criterion |
|---|---|---|---|
| A1 | Traders will use a price and catalog tool that has no listings on it | Ship catalog plus price index alone — no accounts, no payments | Fewer than `[TBD]` weekly returning users by week 10 → thesis is wrong, stop before building the marketplace |
| A2 | Sellers will move transactions off Facebook | Manually broker 10 deals with enforced structure, spreadsheet only, for sellers who are not the founder | Sellers refuse structure without an app → they will refuse with one |
| A3 | Scam rate is high enough to justify escrow | Survey 30 active traders on bad deals per 100 | If 1–2 per 100, a guarantee fund likely beats escrow on cost and complexity |
| A4 | KYC does not kill supply | A/B the upgrade prompt timing during beta | Upgrade completion below 50% → threshold or timing is wrong |
| A5 | The catalog can be built inside budget | Time-box a 200-card pilot, measure cost per card | Extrapolated cost exceeds `[TBD]` → narrow scope to Pokémon only |
| A6 | The founder's pain generalises | Interview 5 sellers *unlike* the founder — casual, bulk, low-value | They report no pain → the product is being built for n=1 |

**A1 and A6 are the two that most often go untested by founders, and they are the two that most often kill the company.**

---

## 3. Blocking questions

Nothing should be built past the catalog until these are answered.

**Legal — payment structure.** Does the delayed-capture model through a licensed payment provider avoid payment-services and escrow licensing obligations under Thai law? Holding customer funds touches Bank of Thailand payment-services regulation and the Escrow Act. *This is not a question the team can answer internally. Engage a Thai lawyer during Phase 1, not Phase 3.*

**Legal / finance — vendor selection.** Which payment provider, and does their merchant onboarding satisfy the KYC requirement without a parallel in-house build? Note the vendor concentration risk: identity, merchant KYC and settlement would all run through one supplier.

**Data — graded versus raw mix.** What share of 10,000฿+ trades are graded slabs versus raw cards? Determines whether cert-number verification (PSA, BGS, CGC lookup — cheap, no facility needed) is a meaningful feature or a rounding error.

**Product — actual dispute rate.** What proportion of deals in the current market go bad? Determines whether escrow or a simpler guarantee fund is the right primitive. See A3.

---

## 4. Non-blocking open questions

- **Data.** Licensing and coverage for Pokémon Japanese and One Piece card data — buy, scrape, or crowdsource? Public data exists for English Pokémon; Japanese and One Piece coverage is patchy.
- **Ops.** Dispute resolution SLA and expected operator minutes per dispute.
- **Product.** Commission rate, and who pays — buyer, seller, or split.
- **Product.** Is 10,000฿ the correct tier threshold, or an artifact of one group's convention?
- **Ops / strategy.** Do we need a relationship with existing group admins, given they are the incumbent escrow business and control distribution?
- **Ops.** Does the current admin charge a fee for escrow, and how long does a settlement take? If it is free and same-day, escrow is a weaker business than it appears.
- **Design.** Resolution of the three open settlement decisions in `03` — rejection cost, no-show adjudication, and escrow expiry.

---

## 5. Phase gates

**Phase 1 — Catalog and price index (~8 weeks).** Card database, search, filters, card detail pages, seeded price history. No accounts, no listings, no payments. Web only.
*Gate: A1 must pass before Phase 2 spend.*

**Phase 2 — Listings and identity (~8 weeks).** Accounts, tiered verification, structured listings, photo protocol, condition standard, reputation. Deals may still close off-platform.
*Gate: A2 and A4.*

**Phase 3 — Escrow and settlement.** Payment provider integration, both settlement flows, disputes.
*Gate: legal clearance from §3. Begin that conversation during Phase 1.*

**Phase 4+.** Portfolio tracker, auctions, native apps, provenance layer.

---

## 6. Budget and team notes

- **The catalog is the largest line item and it is manual data work, not engineering.** Staff it with the cheapest appropriate labour and the community, not with engineers.
- **Dispute handling is permanent headcount, not a one-time build.** Every disputed deal is a human reading evidence. Model this before promising escrow at scale.
- **Engineers will gravitate to the marketplace and escrow systems** because those are the interesting problems. The catalog is unglamorous and it is the thing that actually wins. Expect to defend the sequencing — including against your own instincts.

---

## 7. Recommended next two weeks

Ordered, and none of it requires writing production code:

1. **Look at Sasom's trading card section in detail.** Coverage, pricing, which sets they carry, where the gaps are. This defines the defensible ground.
2. **Interview 5 sellers unlike the founder.** Tests A6, the cheapest test of the riskiest unexamined assumption.
3. **Survey 30 traders on bad-deal rate.** Tests A3 and decides escrow versus guarantee fund.
4. **Book a Thai lawyer consultation** on the escrow structure. Long lead time; start now.
5. **Run a 200-card catalog pilot.** Tests A5 and produces a real cost-per-card figure for budgeting.
6. **Fill in every `[TBD]` in these documents.** A kill criterion with a placeholder is not a kill criterion.
