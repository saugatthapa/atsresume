# JobResumeMatch

JobResumeMatch is a production-minded SaaS MVP for checking how well a resume matches a job description. It includes a free watermarked preview flow, private noindex result pages, SEO landing pages, a Groq-ready AI analyzer, and a local keyword-matching fallback.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Create the local SQLite database:

```bash
npm run prisma:generate
npm run prisma:push
```

If `prisma db push` fails because of a local Prisma schema-engine/runtime issue, the app also creates the required SQLite `Analysis` table on first API use during local development.

## Environment Variables

`DATABASE_URL`: SQLite locally, for example `file:./dev.db`. Switch to Postgres later by changing the Prisma provider and URL.

`GROQ_API_KEY`: Optional. When empty, the app uses the local scoring fallback.

`GROQ_MODEL`: Optional model override. Defaults to `llama-3.3-70b-versatile`.

`NEXT_PUBLIC_SITE_URL`: Use `http://localhost:3000` locally and `https://jobresumematch.com` in production.

This value controls canonical URLs, `robots.txt`, and `sitemap.xml`.

`NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`: Public Paddle.js client-side token. Required for the `/checkout` page that opens Paddle checkout from `_ptxn` transaction URLs.

`NEXT_PUBLIC_PADDLE_ENVIRONMENT`: Use `sandbox` for sandbox checkout testing or omit/use another value for live checkout.

`PADDLE_API_KEY`: Server-only Paddle Billing API key. Required for production checkout.

`PADDLE_PRICE_ID`: Paddle Price ID for the one-time $4.99 clean export unlock.

`PADDLE_WEBHOOK_SECRET`: Paddle notification destination secret for `/api/webhooks/payment`.

`PADDLE_ENVIRONMENT`: Use `sandbox` for testing or omit/use another value for live Paddle API.

`PADDLE_CHECKOUT_URL`: Optional approved Paddle checkout URL override. Leave blank to use the Paddle dashboard default payment link. If you set it, the exact domain must be approved in the matching Paddle sandbox/live environment.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Deploy to Vercel or another Next.js host. Set production environment variables, run Prisma migration setup for the production database, and set `NEXT_PUBLIC_SITE_URL=https://jobresumematch.com`.

For production data, use Postgres instead of SQLite. Update `prisma/schema.prisma`, set the production `DATABASE_URL`, and run a migration.

## Google Search Console

1. Add `jobresumematch.com` to Google Search Console.
2. Verify the domain.
3. Submit `https://jobresumematch.com/sitemap.xml`.
4. Use URL Inspection for the homepage and primary tool pages.
5. Request indexing after launch.
6. Connect Google Analytics and Search Console.
7. Confirm `https://jobresumematch.com/robots.txt`.
8. Check sitemap status.
9. Monitor Core Web Vitals.

## Payment Integration Notes

Development mode keeps a local mock unlock for fast testing. Production disables `/api/unlock` and uses Paddle Billing plus a verified webhook:

1. Create a Paddle product and one-time price for `$4.99`.
2. Set `PADDLE_API_KEY`, `PADDLE_PRICE_ID`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, and `NEXT_PUBLIC_PADDLE_ENVIRONMENT`.
3. Configure Paddle notification destination: `https://jobresumematch.com/api/webhooks/payment`.
4. Subscribe to `transaction.completed` and/or `transaction.paid`.
5. Configure the Paddle default payment link/checkout URL as `https://jobresumematch.com/checkout` in the matching Paddle environment. Leave `PADDLE_CHECKOUT_URL` blank unless you need to override that default with another approved checkout URL.
6. Paddle `custom_data.token` stores the analysis token; verified payment updates `Analysis.paidStatus=true`.
7. Clean PDF export is generated server-side only when `paidStatus=true`.

## Remaining Production Tasks

- Replace Paddle sandbox keys with live keys after a successful sandbox payment.
- Encrypt stored resume text if you decide to persist it; the current API stores analysis output and intentionally avoids storing raw resume/job text.
- Add persistent rate limiting with Redis or your hosting provider's edge store.
- Add real server-side PDF/DOCX generation for clean exports.
- Add deletion controls for private results.
- Add analytics and conversion tracking.
- Add full automated tests for API validation, scoring, sitemap, and payment state transitions.
- Replace starter legal copy with attorney-reviewed policies before launch.
