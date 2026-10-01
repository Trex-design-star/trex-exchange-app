# Phase 2 — Backend contract (runs when Node + Postgres available)

Stack: NestJS API, PostgreSQL, Better Auth, Resend, Cloudflare R2, Paystack.

## Ledger schema (PostgreSQL)

```sql
create table bond_events (
  id text primary key,            -- evt_xxx = idempotency key for Paystack
  vendor_id text not null,
  kind text not null,             -- reserve | release | forfeit | refund | topup
  amount_ngn integer not null,
  trade_id text null,
  meta jsonb default '{}',
  created_at timestamptz default now()
);
-- balance = sum(amount) per vendor; append-only, no updates/deletes
-- BND-04: bond vs fee kept as separate kinds (fee_* vs bond_*)
```

Rules: BND-02 real-time used/free; BND-03 block over-capacity server-side;
BND-05 auto-release on Completed; BND-06 refund on pre-payment cancel;
BND-07 forfeit on vendor-at-fault; BND-11 switch guard (zero open + 72h).

## Paystack wiring

- Funding (BND-12/13/15): create DVA per vendor → webhook `charge.success`
  (verify `x-paystack-signature` HMAC) + 5-min poll backstop → credit bond only.
  Wrong amount/sender → review queue, never auto-apply.
- Release (BND-14/16): ledger event → `POST /transfer` with
  `reference = bond_events.id` → wait for `transfer.success` webhook before
  marking released → retry with backoff → manual queue after exhaustion.
- Controls: BND-17 4-eyes above ₦500,000 (configurable); BND-18 daily
  `ledger vs paystack balance vs bank` job + immediate alert on mismatch.
- Secrets in vault; separate test/live keys.

## Better Auth + Resend

- Better Auth handles phone/email OTP sessions; Resend sends email codes.
- Rate-limit OTP, enumeration-safe errors, device binding, step-up for
  limit/exit actions.
- R2 stores proofs via signed URLs; admin sees them only on dispute (privacy).

## What the preview covers

`bond.html` simulates: DVA webhook+poll, Transfers with idempotency key display,
4-eyes above threshold, switch cooldown, zero-open-trades guard, reconciliation.
`trade.html` enforces capacity silently (customer never sees bond internals).
