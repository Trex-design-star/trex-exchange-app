# Trex Global Architecture (master spec implementation)

Status: preview build — all UI flows run against the central services in
`js/trex.js` with illustrative reference rates and sample figures.
Production must move authoritative financial state (balances, rates, bond,
capacity, settlement, verification) behind the API + ledger. No page may
hard-code currencies; NGN is simply the detected local currency of a
Nigerian user.

## Central services (`js/trex.js`)

- **Currency registry** — 40 ISO 4217 fiat currencies: code, name, symbol,
  decimals, flag, country links, popularity. Admin toggles status
  (LIVE / LIMITED / PAUSED / COMING_SOON / DISABLED) without rebuilds.
- **Country registry** — 15 countries: code, name, region, status, local
  currency, dialling prefix, timezone, payment rails.
- **Money** — minor-unit arithmetic (`toMinor`/`fromMinor`) + `Intl`
  formatting with per-currency precision (JPY 0, KWD/BHD 3, default 2).
- **Rates & quotes** — `refRate()` from the reference table; `quote()`
  splits reference rate / fee / net, stamps `asOf` + 30s `expiresAt`.
  Stale quotes must be refreshed, never transacted.
- **Fees** — percentage-based, currency-aware, shown pre-confirm.
- **Detection** — phone prefix + device language + timezone → country,
  confidence and reasons; user always confirms or changes.
- **Defaults** — every account gets local + USD + GBP + EUR; add, remove
  (blocked while needed by an open trade), reorder, favourite, preferred
  and display currency.
- **Availability** — currency status ≠ payment availability; pairs pause
  independently; every restriction explains itself and suggests alternatives.
- **Ledger records** — every amount carries its currency; minor units,
  rate, counter-amount, fee + fee currency, method, settlement, audit ref.
- **Audit** — every sensitive action appends an immutable event.

## Page map

| Page | Covers |
|---|---|
| `index.html` | Global hero, how-it-works, live markets, trust |
| `onboarding.html` | Phone → country/currencies → email → liveness → vendor |
| `dashboard.html` | Balances, add currency, converter, frequent pairs, history + filters, currency details |
| `trade.html` | Sell/receive selectors, pair discovery, sorting, watchlist, vendor profiles, quotes with expiry, receipts, reverse directions |
| `offers.html` | Dynamic pair builder, reference rate, preview with fee, availability, analytics |
| `bond.html` | Multi-currency protection capacity, top-up, withdraw, plan switching |
| `settings.html` | Country & currency, favourites/order, security centre, support |
| `admin.html` | Market health, currency/pair controls, rate monitor, reviews, vendors, settings, support, audit |
| `automation.html` | Ranking, fair-price, chat safety, standards, fraud scan |
| `expansion.html` | Converters, business access, invites |
| `launch.html` | Go-live gates |

## Backend handoff (no redesign needed)

`Docs/phase2-backend.md` + `Docs/phase3-5-backend.md` + `Docs/phase6-8-backend.md`
already define the Postgres entities (User, Country, Currency, Balance,
Pair, Rate, Quote, Vendor, Offer, Capacity, Bond, Trade, Payment,
Settlement, LedgerEntry, Dispute, Evidence, Message, Notification,
Verification, RiskEvent, Ticket, AuditLog, FeeRule). Replace the
`TREX.*` store calls with API calls and keep every screen as-is.

## Honesty rules enforced in UI

- "Preview — sample figures, no real money moves" on every money screen.
- Reference rates labelled illustrative; quotes expire in 30s and cannot
  be used stale; paused/unavailable markets say so and suggest alternatives.
- No floating-point money logic in the core (minor units throughout).
