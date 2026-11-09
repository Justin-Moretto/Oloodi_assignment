# Live Staffing Dashboard

An event manager invites workers to one shift. Workers accept or decline, then check in and check out. The manager dashboard and the worker screen stay in sync through a shared Supabase database.

## Setup

- Node.js 22 or newer (`node -v`)
- A Supabase project

In the Supabase SQL editor, run these files in order:

1. `supabase/migrations/20261107140000_staffing_schema.sql`
2. `supabase/seed.sql`

Then:

```bash
npm install
cp .env.example .env
npm run dev
```

Put the project URL and the anon key in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Use the anon key only. Do not put the service-role key in `.env` or any frontend file.

Open `/` and sign in as the manager or as a worker. Until `.env` is set, the screens show a setup notice and do not call the database.

This project was developed on Node 22.16. `react-router` prints a warning below 22.22. The app still runs.

## Reset

`supabase/reset.sql` puts every assignment on the seeded shift back to uninvited and not started, and clears the check-in and check-out times. Run it in the SQL editor. It does not delete the shift or the workers. Re-running `seed.sql` fails because those rows use fixed ids.

## Architecture

The app is one React client with three routes. `/` is a sign-in screen. `/manager` is the dashboard. `/worker?worker=<id>` is that worker's assignment. The sign-in list is a demo picker, not authentication.

One TanStack Query, key `['staffing']`, loads the shift, the workers, and the assignments. The client joins worker names and derives the counts from those same rows. Filled is the number of accepted workers, including anyone already checked in or checked out. Remaining is the capacity minus filled, and it does not go below zero. Checked in and checked out are attendance counts.

Participation and attendance are separate columns. Accepting a shift does not mean the worker has arrived. Checking in or out leaves participation as accepted, so a checked-out worker still occupies a spot.

The browser cannot update tables. Row Level Security lets the anon key select and nothing else. Every write goes through a Postgres function that returns `{ ok, code, message }`:

| Function | What it enforces |
| --- | --- |
| `invite_worker` | Uninvited or declined only. A cancelled worker accepts again instead of receiving a new invite. |
| `respond_to_invitation` | Decline only from invited. Accept from invited or cancelled, and only while attendance is not started. |
| `cancel_assignment` | Accepted and not started only. |
| `check_in_worker` | Accepted and not started. A second check-in succeeds and keeps the original timestamp. |
| `check_out_worker` | Accepted and checked in. A second check-out succeeds and keeps the original timestamp. Checked out is final. |

Accept locks the shift row, counts the other accepted assignments, and rejects the accept when the shift is already full. Two overlapping accepts serialize on that lock, so they cannot both pass a capacity of three.

Realtime uses a Postgres Changes subscription on `public.assignments`. The event is only a signal. The client throws the payload away and refetches the rows. The first subscribe does not refetch. A later subscribe means the channel dropped and came back, so the client refetches then. TanStack Query also refetches on window focus and on browser reconnect. The header shows Live, Reconnecting, or Offline from `navigator.onLine` and the channel status.

The trade-off is an extra read on every change. That read is the screen's source of truth, so a missed or partial event cannot leave the dashboard on a stale status.

## Technology choices

Vite, React 19, and TypeScript keep the client small and strictly typed. Tailwind and the shadcn components are the UI kit. TanStack Query holds the server state. Supabase is the database, the write API, and the realtime transport.

I used a hosted Supabase project instead of the local Docker stack. The schema and seed stay in the repo. Docker was running the same Postgres with more setup than this exercise needed, so that stack was removed.

I did not add a separate Node API. The Postgres functions are the backend, and they are the place that rejects illegal transitions. I did not poll on a timer. The subscription covers the live case, and focus plus reconnect cover the gaps.

## Testing and measurements

`npm test` runs Vitest. It checks that filled counts include accepted workers who are checked in or out, that remaining never goes negative, and that the header reports unconfigured, offline, live, and reconnecting. It also checks that a dropped channel refetches only when it subscribes again, not on the first connect.

`supabase/tests/staffing_rules.sql` checks the database functions: legal transitions, rejected actions, a repeated check-in and check-out keeping the original timestamps, a third accept failing once capacity is full, anon select, and a rejected anon update. Run the whole script in the SQL editor. It rolls back, so the seeded shift is unchanged.

With the anon key from `.env`, a select of `shifts` succeeded, an update of `assignments` failed with `permission denied for table assignments`, and `invite_worker` on an unknown id returned `{ ok: false, code: "not_found" }`.

Live delay was measured on November 8, 2026, with two localhost tabs against the hosted project. A click listener stored the time of the action, and the other tab stored the time its screen changed.

| Action | Other screen updated |
| --- | --- |
| Worker accepted | Manager row updated in 953 ms |
| Manager invited a declined worker | Worker screen showed Accept and Decline in 464 ms |

Recovery was measured by taking only the manager tab offline in Chrome. The header switched to Offline. The worker then cancelled. The manager row stayed on the old status while the tab was offline. After the tab was back online, that row showed Cancelled in 292 ms.

These are single samples from a laptop, not a load test.

## Challenges and what I learned

The light cards sit on a dark page, and they override the text color. Outline buttons were still using the page background, so the label was the same near-black as the button. The fix forces white text on those buttons inside cards and alerts.

`supabase-js` treated the database row types as `never` while they were interfaces. Making them type aliases fixed the client.

The first install ran under Node 18 and Vite could not load its native binding. Reinstalling under Node 22 fixed it.

I used Cursor's agent to implement the schema, the screens, and the tests from the brief. I chose hosted Supabase over Docker, set the layout and colors, and checked the manager and worker flows in the browser. I kept the status rules in the database functions and kept the screen on a refetch rather than on the realtime payload.

## Limitations

Sign-in does not prove who the person is. Anyone with the anon key can call the functions for any assignment. A real login would scope each call to the signed-in worker or manager.

There is one shift. The capacity check in the SQL test runs two accepts in one transaction. That is the same check the row lock serializes when two sessions overlap. The test does not open two database sessions.

The production build is one JavaScript chunk of about 690 kB before gzip. Splitting the route screens would matter if the app grew.

The app is not deployed. `npm run build` completes locally.
