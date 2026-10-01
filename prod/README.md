# Trex production stack (`prod/`) — Next.js + NestJS + Postgres + Redis + R2 + Better Auth + Resend + Paystack

> Status: complete scaffold, **not yet runnable on this Mac** (no Node,
> Docker, or API keys here). The live system remains the Ruby API on
> :8080. Nothing below is faked — it is real code awaiting a runtime.

## Run it (needs Node 20+, Docker, and keys)

```sh
cd prod
cp .env.example .env        # fill RESEND_API_KEY, PAYSTACK_SECRET_KEY, R2_*, BETTER_AUTH_SECRET
docker compose up -d        # Postgres 16 + Redis 7
cd api && npm install
npx prisma migrate dev      # creates all tables below
npm run dev                 # NestJS API on :3001
cd ../web && npm install && npm run dev   # Next.js on :3000
```

## Layout

```text
prod/
  docker-compose.yml        Postgres + Redis
  .env.example              every secret in one place
  api/                      NestJS: auth, ledger, offers, trades, bond, uploads, notify, risk, admin
    prisma/schema.prisma    Postgres entities (append-only ledger + idempotency keys)
  web/                      Next.js: Better Auth client, API proxy, routes mirror the static pages
```

## Port notes (Ruby → NestJS, same contracts)

- Routes keep the `/api/*` shapes in `Docs/backend.md`, so `js/api.js`
  works unchanged — only the host moves.
- `data/*.json` → Postgres tables; `trex_config` → `FeeRule` + settings.
- OTP demo codes → Better Auth phone/email OTP via Resend sender.
- Bond simulations → Paystack DVA + Transfers + verified webhooks.
- Timeouts/auto-release/retries → BullMQ queues on Redis (jobs, not cron hopes).
