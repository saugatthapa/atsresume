# JobResumeMatch

JobResumeMatch is a production-minded SaaS for checking how well a resume matches a job description. It includes a free preview flow, private noindex result pages, SEO landing pages, a Groq-ready AI analyzer, and a local keyword-matching fallback.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Generate Prisma Client and push the schema to Supabase Postgres:

```bash
npm run prisma:generate
npm run prisma:push
```

## Environment Variables

`DATABASE_URL`: Supabase transaction-mode pooler URL for app runtime, for example `postgresql://postgres.PROJECT_REF:YOUR_SUPABASE_DB_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`.

`DIRECT_URL`: Supabase session/direct pooler URL for Prisma schema pushes and migrations, for example `postgresql://postgres.PROJECT_REF:YOUR_SUPABASE_DB_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres`.

`GROQ_API_KEY`: Optional. When empty, the app uses the local scoring fallback.

`GROQ_MODEL`: Optional model override. Defaults to `llama-3.3-70b-versatile`.

`NEXT_PUBLIC_SITE_URL`: Use `http://localhost:3000` locally and `https://jobresumematch.com` in production.

This value controls canonical URLs, `robots.txt`, and `sitemap.xml`.

`PAYMENT_PROVIDER`: Active payment provider. Use `dodo`.

`PAYMENTS_ENABLED`: Set to `true` to allow checkout creation.

`DODO_ENVIRONMENT`: Use `test` for Dodo test mode or `live` after production approval.

`DODO_API_KEY`: Server-only Dodo API key. Do not expose this with `NEXT_PUBLIC_`.

`DODO_PRODUCT_ID`: Dodo product ID for the one-time Resume Export Pass.

`DODO_WEBHOOK_SECRET`: Dodo webhook signing secret for `/api/webhooks/dodo`.

## Supabase Postgres Setup

1. Create a Supabase project.
2. Open Supabase Dashboard -> Connect -> ORMs -> Prisma.
3. Copy the transaction-mode pooler URL for `DATABASE_URL`.
4. Copy the session/direct pooler URL for `DIRECT_URL`.
5. Replace `[YOUR-PASSWORD]` with the real Supabase database password.
6. Put these values in `.env` locally and in your hosting provider environment variables.
7. Generate Prisma Client and push the schema.

```bash
npm install
npx prisma generate
npx prisma db push
npm run lint
npm run build
```

For production deployment, set both `DATABASE_URL` and `DIRECT_URL` in the hosting provider environment variables. Do not run destructive reset commands such as `prisma migrate reset` or `prisma db push --force-reset` against a database with production data.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy

Deploy to Vercel or another Next.js host. Set production environment variables, run Prisma migration setup for the production database, and set `NEXT_PUBLIC_SITE_URL=https://jobresumematch.com`.

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

Development mode keeps a local test unlock for fast testing. Production disables `/api/unlock` and uses Dodo Payments plus a verified webhook:

1. Create a Dodo one-time product: `JobResumeMatch Resume Export Pass`, `$4.99 USD`, tax category `SaaS`.
2. Set `PAYMENT_PROVIDER=dodo`, `PAYMENTS_ENABLED=true`, `DODO_ENVIRONMENT=test`, `DODO_API_KEY`, `DODO_PRODUCT_ID`, and `DODO_WEBHOOK_SECRET`.
3. Configure Dodo webhook destination: `https://jobresumematch.com/api/webhooks/dodo`.
4. Subscribe to `payment.succeeded` for unlocks. Failed, processing, cancelled, and refund events are logged only.
5. Dodo checkout metadata stores `{ token, provider: "dodo", product: "resume_export_pass" }`.
6. Only the verified Dodo webhook updates `Analysis.paidStatus=true`.
7. Clean exports are generated server-side only when `paidStatus=true`.

## Remaining Production Tasks

- Replace Dodo test keys with live keys only after a successful test payment and webhook verification.
- Encrypt stored resume text if you decide to persist it; the current API stores analysis output and intentionally avoids storing raw resume/job text.
- Add persistent rate limiting with Redis or your hosting provider's edge store.
- Add real server-side PDF/DOCX generation for clean exports.
- Add deletion controls for private results.
- Add analytics and conversion tracking.
- Add full automated tests for API validation, scoring, sitemap, and payment state transitions.
- Replace starter legal copy with attorney-reviewed policies before launch.
