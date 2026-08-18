# Thai TCG Peer-to-Peer Marketplace — Project Documentation

**Status:** Pre-build. Discovery and definition complete; nothing validated.
**Last updated:** 16 August 2026

A trust-layer marketplace for trading card collectors in Thailand, replacing the manual buy/sell/escrow activity currently running through Facebook groups.

---

## Documents

| File | What it covers | Read it when |
|---|---|---|
| `01-strategy-and-positioning.md` | Market context, competitive landscape, strategic decisions and the reasoning behind them, including positions that changed during discovery | You want to know *why* the product is shaped this way |
| `02-prd-v1.md` | The v1 product requirements: goals, non-goals, personas, requirements with acceptance criteria, metrics, phasing | You are scoping or building |
| `03-journeys-and-blueprint.md` | Full user lifecycle, face-to-face settlement flow, and the three-lane service blueprint across the lifecycle | You are designing screens or planning operations |
| `04-validation-and-open-questions.md` | Riskiest assumptions with kill criteria, blocking legal questions, and what to do in the next two weeks | You are deciding whether to spend money |

---

## One-paragraph summary

Thai card trading happens in Facebook groups: ~100k members, 50+ listings a day, unstructured free-text posts, comment-thread bidding, direct PromptPay under 10,000฿ and a human admin acting as manual escrow above it. Buyers cannot search or price cards and cannot tell who is trustworthy; sellers lose hours to low-intent messages and get ghosted at meetups. The platform's answer is structured peer-to-peer: a real card catalog with settled-price history, verified seller identity, standardised condition and photo evidence, and escrow via a licensed payment provider — with the buyer inspecting the card in person or in a delivery window, so the platform never takes custody of cards or money.

---

## The three things most likely to kill this

1. **Legal.** Escrow may trigger Thai payment-services or escrow licensing. Unresolved and blocking. See `04`.
2. **The catalog.** It is the largest cost, it is manual data work rather than engineering, and it is the actual moat. See `01` and `02`.
3. **n=1 evidence.** Everything here comes from one founder's experience as an active trader. Nothing has been tested with users who are not the founder. See `04`.

---

## Status of this documentation

These documents record a definition process, not a validated plan. Targets and thresholds are hypotheses. Anything marked `[TBD]` needs a real number before the document is circulated to anyone outside the founding team.
