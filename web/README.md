# Trex Web (Next.js)

Customer storefront. API base is `NEXT_PUBLIC_API_URL` (the NestJS API on
:3001 in production, the Ruby twin on :8080 during preview).

```sh
cp .env.example .env.local
npm install
npm run dev     # :3000
```

Auth pages call Better Auth (`/api/auth/*` on the API host); trade,
offers and settings screens use `lib/api.ts` with idempotency keys on
every financial write. The current static pages in the repo root are the
clickableUI reference — port them route by route, keeping copy and flow.
