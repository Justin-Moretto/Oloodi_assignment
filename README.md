# Live Staffing Dashboard

A small staffing app for the Oloodi coding challenge. An event manager invites three workers to one shift. Workers accept or decline, then check in and check out. The manager dashboard stays in sync across browser sessions.

This repository is in progress. The app reads one hosted Supabase project. Tests, measured timings, and deployment are still open. See `TODO.md`.

## Requirements

- Node.js 22 or newer (`node -v`)
- A Supabase project. Run `supabase/migrations/20261107140000_staffing_schema.sql`, then `supabase/seed.sql`, in the SQL editor.

The machine used for this project had Node 14 on `PATH`. Development uses Node 22.23.4.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `/manager` and `/worker`. Until `.env` has a Supabase URL and anon key, the screens show a setup notice and do not call the database.

Use the anon key only. Do not put the service-role key in `.env` or any frontend file.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run lint` | Oxlint |
| `npm test` | Count rules and live-connection behavior |
| `npm run preview` | Serve the production build |

`npm test` covers the dashboard counts and the live, reconnecting, and offline states. `supabase/tests/staffing_rules.sql` checks status transitions, illegal actions, repeated check-in and check-out, and the three-worker capacity limit against the database functions. Run that whole script in the SQL editor. It rolls back, so the seeded shift stays as it is.
