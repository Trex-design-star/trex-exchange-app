# Trex API (NestJS + Postgres + Redis)

Production backend. The Ruby `api.rb` at the repo root is the interim
runnable twin with the same routes and rules — this is the system of record.

## Bring-up (needs Node 20+, Docker)

```sh
cp .env.example .env        # fill secrets; never commit .env
docker compose up -d        # postgres:5432, redis:6379 (repo root)
npm install
npx prisma migrate dev      # creates all tables in schema.prisma
npm run start:dev           # :3001
```

## Acceptance gates (run before calling it done)

```sh
npm run typecheck           # tsc --noEmit, must be clean
npx prisma validate         # schema valid
npm run build && npm start  # production boot
```

Then exercise the money paths against :3001 the same way `api.rb` was
verified: OTP request/verify, offer create + validation errors, trade
open → pay (missing proof rejected) → confirm → deliver → complete,
illegal jump rejected, over-capacity rejected, same idempotency key twice
→ one trade, dispute → second-approval-gated resolve, bond top-up and
release, ledger kinds `reserve → release/refund/forfeit`, audit rows.

## Money rules (do not weaken)

- Minor units everywhere; no floats cross a financial boundary.
- Capacity, min/max and fees are evaluated in provide-currency terms.
- State machine transitions are allow-listed; anything else is 422.
- Financial writes take `X-Idempotency-Key`; repeats return the original.
- The ledger only moves on provider confirmation (transfer success
  webhook), never optimistically at request time.
- Large releases/resolutions require `secondBy`.
- Webhook secrets stay in the vault; signatures verified over raw bytes.
