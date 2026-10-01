# Trex production stack — setup (run on a machine with Node 20+ and Docker)

```sh
cd trex-stack
cp .env.example api/.env
cp .env.example web/.env.local
# fill in RESEND_API_KEY, PAYSTACK_SECRET_KEY, R2_* , BETTER_AUTH_SECRET

docker compose up -d            # Postgres :5432 + Redis :6379
cd api && npm install && npx prisma migrate dev && npm run start:dev   # API :4000
cd ../web && npm install && npm run dev                                # Web :3000
```

Open http://localhost:3000. The web app calls the API at
`NEXT_PUBLIC_API_URL` using the **same `/api/*` routes** as the current
preview backend, so every screen keeps working while the engine underneath
becomes Postgres + Redis + Better Auth + Resend + R2 + Paystack.

What you must provide (I cannot create these for you):
1. Resend API key + verified sender domain (OTP/notify emails)
2. Paystack secret key (start with `sk_test_`, DVA + Transfers in test mode)
3. Cloudflare R2 bucket + API token (proof uploads)
4. A 32+ char BETTER_AUTH_SECRET (`openssl rand -base64 32`)
