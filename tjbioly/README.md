# TJ Biology Olympiad

The website for the TJ Biology Olympiad club at Thomas Jefferson High School for
Science and Technology. Built with [Next.js](https://nextjs.org) (App Router),
Tailwind CSS v4, TJ Ion OAuth, and Supabase.

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` — optional server-side key for the auth callback.
- `ION_CLIENT_ID` / `ION_CLIENT_SECRET` / `ION_REDIRECT_URI` — TJ Ion OAuth app credentials.

## Structure

- `app/page.tsx` — the single-page marketing site (hero, about, USABO, gallery, join).
- `app/components/` — `Navbar` and `Footer`.
- `app/api/auth/` — Ion OAuth login / callback / me / logout routes.
- `lib/` — `ion-oauth`, `auth`, and Supabase clients.
- `public/logo.png` — club logo. `public/images/` — hero background and club photo.
