# Phases 3–5 — Backend contracts (NestJS + Postgres + Better Auth + R2)

## Phase 3 Offers (OFR-01..03)
- `offers` table: id, vendor_id, pair, rate_text, rate_bps, min_ngn, max_ngn,
  methods[], live bool, created_at. Server validates min≤amount≤max, live, capacity.
- Preview: `offers.html` CRUD in localStorage `trex_offers`; `trade.html` reads live offers only.
- P1 deferred: OFR-04 ranking, OFR-05 rate guardrails vs market feed.

## Phase 4 Trade engine + chat (TRD, CHT, TRU-01, NOT)
- `trades` table: full state machine server-side (§5), timestamps + actor per transition (TRD-08).
- Mandatory R2 proof objects before confirm (TRD-02/03); cancellation only pre-payment (TRD-05);
  dispute button only post-payment-sent (TRD-06); capacity reserve/release via bond_events (TRD-07).
- Configurable windows (TRD-04): vendor confirm minutes + auto-release grace hours (in `trex_config`, editable in admin.html).
- Chat: auto-open per trade (CHT-01), quick actions (CHT-02), R2 attachments (CHT-03),
  hidden from admin unless disputed (CHT-05). Preview: quick buttons + attachment names + timers in `trade.html`.
- P1: CHT-04 contact soft-block, CHT-06 retention config.
- Notifications (NOT-01/02): trade opened, payment sent, confirm needed/closing, delivery, completed, disputed/resolved + escalating reminders (push/SMS/email; Resend for email).

## Phase 5 Disputes + Admin + Ratings + Support
- `disputes`: freeze trade + capacity (DIS-02); admin view = chat + proofs + timeline (DIS-03);
  actions compensate/exonerate/partial (DIS-04); 4-eyes above threshold (DIS-05, shared `trex_config.thresh`);
  sanctions: vendor rating/tier/suspend (DIS-07), customer sanctions P1 (DIS-06); outcomes feed trust (DIS-08).
- Preview: `admin.html` reads `trex_disputes` from trade.html, resolves with 4-eyes confirm, writes `trex_audit`.
- Admin (ADM): RBAC + network lockdown in prod (ADM-01/08), dispute queue (ADM-02),
  vendor mgmt (ADM-03), config (ADM-04), audit (ADM-05), reserve monitor (ADM-06). P1: ADM-07 fraud patterns.
- Ratings (RAT-01/02): mutual post-trade, public vendor profile (TRU-02), tier auto-rise/fall (TRU-03/04). Preview: `trex_ratings` shown in admin.
- Support (SUP-01/02): ticketing separate from chat (`trex_tickets`), published fault rules at signup (already in onboarding.html).
