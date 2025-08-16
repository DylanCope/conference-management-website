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

4) Run migrations (local dev DB)

   npm run prisma:migrate

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

### 3. Run migrations on deploy (automation)
Use the included GitHub Actions workflow `.github/workflows/db-migrate.yml`. It runs `prisma migrate deploy` on pushes to `main`.

Setup:
- In GitHub repo Settings → Secrets and variables → Actions:
   - Add secret `DATABASE_URL` (your Neon production URL).

Alternatively, run migrations manually from your machine:

```bash
DATABASE_URL="<neon connection>" npx prisma migrate deploy
```

### 4. Vercel build settings
No special config required. Vercel will run `next build` and host the app. Ensure env vars are present.

### 5. Session cookie security
Session cookie uses httpOnly, sameSite=lax, secure in production, and a 30-day maxAge.


## Authentication and environment setup (NextAuth + OAuth)

This app uses NextAuth (JWT sessions) with GitHub and Google sign-in.

### 0) Copy env template
- Copy `.env.example` to `.env.local` and fill in values for local dev.
- In Vercel, add the same variables in Project Settings → Environment Variables for Production and Preview.

Required variables:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GITHUB_ID, GITHUB_SECRET
- GOOGLE_ID, GOOGLE_SECRET

### 1) Generate NEXTAUTH_SECRET
Use Node’s crypto in PowerShell (Windows) or any shell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the output in `NEXTAUTH_SECRET` locally and in Vercel.

### 2) GitHub OAuth App
1. Go to https://github.com/settings/developers → OAuth Apps → New OAuth App.
2. Set:
   - Application name: anything
   - Homepage URL: http://localhost:3000 (use your Vercel URL in prod)
   - Authorization callback URL (local): http://localhost:3000/api/auth/callback/github
     - For production, also add: https://YOUR_VERCEL_DOMAIN/api/auth/callback/github
3. After creating, copy the Client ID and generate a Client Secret.
4. Set env vars:
   - GITHUB_ID = <Client ID>
   - GITHUB_SECRET = <Client Secret>

### 3) Google OAuth Client (Web)
1. Go to https://console.cloud.google.com/apis/credentials and create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URIs:
   - Local: http://localhost:3000/api/auth/callback/google
   - Production: https://YOUR_VERCEL_DOMAIN/api/auth/callback/google
3. Copy Client ID and Client Secret.
4. Set env vars:
   - GOOGLE_ID = <Client ID>
   - GOOGLE_SECRET = <Client Secret>

### 4) NEXTAUTH_URL
- Local: NEXTAUTH_URL=http://localhost:3000
- Production: NEXTAUTH_URL=https://YOUR_VERCEL_DOMAIN

### 5) Set variables in Vercel and GitHub Actions
- Vercel → Project Settings → Environment Variables (add for Production and Preview):
  - DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET, GOOGLE_ID, GOOGLE_SECRET
- GitHub → Repo Settings → Secrets and variables → Actions:
  - DATABASE_URL (used by CI to run `prisma migrate deploy`)

Notes:
- If you change provider settings (redirect URIs), update Vercel env and redeploy.
- For local dev, restart `npm run dev` after editing `.env.local`.


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

All environments use Postgres via Prisma.

Minimum required:
- DATABASE_URL: Postgres connection string (Docker local, Neon in prod)
- NEXTAUTH_URL: Base URL for NextAuth (http://localhost:3000 in dev)
- NEXTAUTH_SECRET: 32+ char secret (see generator above)
- GITHUB_ID / GITHUB_SECRET: GitHub OAuth app credentials
- GOOGLE_ID / GOOGLE_SECRET: Google OAuth client credentials

See `.env.example` for a starter file.

## Troubleshooting

- If you hit connection limits on Postgres: use Neon pooled connection string or consider Prisma Accelerate.
- If migrations fail on Vercel build: run migrations in CI or manually; don’t run them in the Vercel build step.


