# Oloodi Live Staffing Dashboard — remaining work

Deadline: Monday, November 9, 2026, end of day.

## Phase 1 — Project setup

- [x] Initialize Vite + React 19 + TypeScript (strict)
- [x] Tailwind CSS + shadcn/ui
- [x] Routing (`/manager`, `/worker`) and feature folders
- [x] Env template and Supabase client stub
- [x] Confirm `npm run build` and both routes in the browser

## Phase 2 — Database

Paused before the local database was started. Docker Desktop was shut down.

- [x] Migration and seed written (`supabase/migrations`, `supabase/seed.sql`)
- [ ] Apply with `npm run db:start`, then `npm run db:reset`, and fix anything that fails
- [ ] Confirm anon can read, cannot write tables directly, and can call the RPC functions
- [ ] Confirm repeated check-in does not change `checked_in_at`
- [ ] Confirm two simultaneous accepts cannot exceed 3 filled spots

## Phase 3 — Core frontend

- [ ] Dashboard query and derived counts
- [ ] Manager dashboard
- [ ] Worker view
- [ ] Mutations with error feedback

## Phase 4 — Real-time reliability

- [ ] Postgres Changes subscription
- [ ] Invalidate + refetch (do not trust the event payload as the UI state)
- [ ] Live / Reconnecting / Offline indicator
- [ ] Refetch on reconnect, focus, and online
- [ ] Latency and recovery timing hooks (no invented numbers)

## Phase 5 — Testing and submission

- [ ] Vitest for transition and count rules
- [ ] Real-database RPC tests where practical
- [ ] Playwright: two-session sync and one recovery path
- [ ] Typecheck and production build
- [ ] Measure live-update delay and reconnection recovery
- [ ] Finish README (architecture, trade-offs, measurements, AI use)
- [ ] Vercel deploy (needs Supabase project credentials)

## Blocked on you

- Create a Supabase project, or confirm local Docker Supabase is OK
- Provide `VITE_SUPABASE_URL` and the anon key only — never the service-role key
- Vercel account when we deploy

## Decisions already locked

- One seeded shift, fixed ids, three assignment rows created up front as `uninvited` / `not_started`
- Participation and attendance stay separate columns
- Accept locks the shift row so two simultaneous accepts cannot exceed capacity
- Repeated check-in and check-out do not overwrite timestamps
- Anon role cannot update tables directly
- Realtime events only trigger a refetch of authoritative rows
