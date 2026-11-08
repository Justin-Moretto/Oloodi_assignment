# Live Staffing Dashboard

A small staffing app for the Oloodi coding challenge. An event manager invites three workers to one shift. Workers accept or decline, then check in and check out. The manager dashboard stays in sync across browser sessions.

This repository is in progress. Setup below is enough to run the app shell. Database functions, live updates, tests, and measured timings are still being added. See `TODO.md`.

## Requirements

- Node.js 22 or newer (`node -v`)
- A Supabase project, or the local Supabase CLI, once the schema lands

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
| `npm run preview` | Serve the production build |
