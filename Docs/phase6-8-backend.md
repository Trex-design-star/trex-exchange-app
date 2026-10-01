# Phases 6–8 — Backend contracts

## Phase 6 Automation (all P1)
- BND-08: self-serve limit raise (top-up via DVA) / lower (release when unused) — preview in bond.html.
- OFR-04 ranking: score = tier*0.5 + rating*0.3 − dispute_rate*0.2; probation capped below Gold. Nightly job.
- OFR-05 guardrails: reject/flag offers >8% from cached mid (Wise/OXR feed, 60s cache, stale banner).
- CHT-04: regex + classifier for phones/handles; hold + notify both sides; counter in trust record.
- CHT-06: retention days in config (default 90); delayed-dispute restore job.
- DIS-06: false-claim strikes → warning → suspension (configurable counts).
- RAT-03: avg<3.0 over last 10 → auto review + tier freeze.
- ADM-07: nightly fraud scan (shared device/IP, abnormal pricing, burst signups, max-limit newbies) → flags queue.
- Preview: automation.html simulates all of the above.

## Phase 7 Expansion (parking lot)
- New pairs behind feature flags; liquidity check per corridor; spread config per pair.
- Business vendors: KYB-lite + team roles + higher limits; history still earns trust.
- Backstop vendor (if §13.6 approved): platform quotes only when no vendor fills in N min; segregated funds + audit.
- Referrals: code generation, attribution, anti-gaming (no self-referral, cap per month).
- Preview: expansion.html converter + business request + backstop toggle.

## Phase 8 Launch hardening (no PRD phase — go-live gates)
- NFR §9: <1s actions, 99.9%, TLS/at-rest, vault, append-only ledger, restricted proofs, independent scaling, full Android range, fraud flags.
- Risks §12: collusion (proof+4-eyes), circumvention (CHT-04), thin liquidity (backstop option), regulatory (legal review), false claims (§6.3 + grace), oversized dispute (limits ≤ bond coverage).
- Gates: legal sign-off, 7-day green reconciliation on live keys, beta metrics (≥97% clean, ≤45min, ≤24h, <0.5% forfeit), §13 decisions closed.
- Preview: launch.html checklist blocks launch until all ticked.
