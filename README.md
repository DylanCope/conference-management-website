# Conference Management — prototype

Minimal Next.js + Prisma + Tailwind app for a lab’s conference submissions manager.

## Local development (Postgres)

We use Postgres in all environments to keep dev and prod aligned.

Prereqs: Node 18+ and npm. Docker (for local Postgres).

1) Start Postgres locally

   docker compose up -d

This starts a Postgres 16 instance on port 5432 (see `docker-compose.yml`).

2) Create `.env.local` with DATABASE_URL

   DATABASE_URL=postgres://postgres:postgres@localhost:5432/confman

3) Install deps and generate Prisma client

   npm install
   npm run prisma:generate

4) Run migrations and seed (admin users)

   npm run prisma:migrate
   npm run prisma:seed

5) Start the dev server

   npm run dev

The app runs at http://localhost:3000.

## Production on Vercel (recommended)

We recommend Vercel for hosting and Neon for Postgres.

### 1. Create a Neon Postgres database
- Create a Neon project (free tier is fine).
- Copy the Postgres connection string (DATABASE_URL). It looks like:
   postgres://user:password@host/db?sslmode=require

### 2. Configure Vercel project
- Import this GitHub repo in Vercel.
- In Vercel Project Settings → Environment Variables, add:
   - DATABASE_URL = your Neon connection string (for Production and Preview/Development as needed)
   - NODE_ENV = production (Production only)

Note: Prisma is already configured for Postgres in `prisma/schema.prisma`. Provide DATABASE_URL in Vercel.

### 3. Run migrations on deploy
Use the included GitHub Actions workflow `.github/workflows/deploy.yml`. It runs `prisma migrate deploy` on pushes to `main` or `staging` and on PRs to `main`.

Setup:
- In GitHub repo Settings → Secrets and variables → Actions:
   - Add secret `DATABASE_URL` for staging/prod branch targets.

Alternatively, run migrations manually from your machine:

    DATABASE_URL="<neon connection>" npx prisma migrate deploy

### 4. Vercel build settings
No special config required. Vercel will run `next build` and host the app. Ensure env vars are present.

### 5. Session cookie security
Session cookie uses httpOnly, sameSite=lax, secure in production, and a 30-day maxAge.


## SDLC suggestions

- Branches:
   - feature/* → PR to staging (Preview deploys on Vercel)
   - staging → auto deploy to staging DB (Neon branch or separate DB)
   - main → auto deploy to prod DB
- CI:
   - Typecheck, lint (optional), `prisma migrate deploy` against env DATABASE_URL
- Backups:
   - Enable Neon backups/PITR

## Environment variables

- DATABASE_URL (staging/prod): Postgres connection string
- (Local dev uses SQLite per `prisma/schema.prisma`)

## Troubleshooting

- If you hit connection limits on Postgres: use Neon pooled connection string or consider Prisma Accelerate.
- If migrations fail on Vercel build: run migrations in CI or manually; don’t run them in the Vercel build step.


