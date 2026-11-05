# Gym Timer

An interval timer for workouts: ordered steps (warm-up, work, rest, cool-down) that repeat for a number of rounds, with email magic-link sign-in and saved workouts per user.

**Live:** https://gym-timer-theta.vercel.app

**Stack:** Next.js 16 (App Router) · Supabase (Auth + Postgres + RLS) · Tailwind CSS 4 · Vercel

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.local.example .env.local   # then add your Supabase keys
npm run dev
```

Open http://localhost:3000. The timer works even without Supabase keys; only sign-in and saving need them.

```bash
npm test          # timer engine tests
npm run build     # production build check
```

## Supabase setup

1. Create a project at https://supabase.com.
2. **SQL Editor:** paste the contents of `supabase/migrations/0001_workouts.sql` and run it. This creates the `workouts` table with RLS, so each user only sees their own workouts.
3. **Project Settings → API:** copy the `Project URL` and the public key (anon or publishable) into `.env.local`.
4. **Authentication → URL Configuration:**
   - `Site URL`: your deployed address (for example `https://gym-timer-theta.vercel.app`)
   - `Redirect URLs`: add
     - `http://localhost:3000/**`
     - `https://gym-timer-theta.vercel.app/**`
     - `https://*-<your-team>.vercel.app/**` (for preview deployments)

No email template changes are needed: Supabase's default templates work as-is, and sign-in links work from any device.

**How sign-in works:** the login form requests the link using the `implicit` flow, so the session travels inside the link itself (after the `#`, which never reaches the server). The `/auth/callback` page reads it, removes it from the address bar right away, and stores it as cookies.
We use this because new free Supabase projects can't edit email templates without a custom SMTP provider. The default `PKCE` flow is slightly more secure, but its links only work in the browser that requested them.
If you add custom SMTP later, you can switch to the `token_hash` link instead (the `/auth/confirm` route still supports it).

> Supabase's built-in email only sends a few messages per hour. For real users, connect your own SMTP provider (Resend or Postmark, for example) under **Authentication → SMTP Settings**.

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel choose **Add New → Project** and import the repository.
3. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production and Preview.
4. Deploy, then update `Site URL` and `Redirect URLs` in Supabase with the final domain.

Every push to `main` redeploys automatically.

## Project structure

```
supabase/migrations/0001_workouts.sql   workouts table + RLS
src/proxy.ts                            session refresh, protects /workouts
src/lib/timeline.ts                     turns a workout into a sequence of segments (tested)
src/hooks/useIntervalTimer.ts           drift-free timer engine
src/hooks/useWakeLock.ts                keeps the screen on
src/lib/audio.ts                        beeps (Web Audio)
src/components/WorkoutEditor.tsx        step and round editor
src/components/RunClient.tsx            run screen
src/app/login, src/app/auth/*           magic link (callback for new links, confirm for old ones) and sign-out
src/app/workouts/*                      saved workouts: list, create, edit, delete
```
