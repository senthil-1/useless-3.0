# Ministry of Useless Affairs — Frontend

A polished Next.js + Tailwind frontend aligned with the supplied MUA feature specification.

## Included routes
- `/` — landing page, services, notices, ranking preview
- `/report-incident` — incident report form
- `/certificate` — certificate request and preview state
- `/track` — application tracking UI
- `/profile` — citizen profile / activity
- `/leaderboard` — ranking table
- `/verify/[id]` — public certificate verification page

## Notes
The forms currently use frontend-only mock flows so the visual frontend can be evaluated independently. Wire the submit actions to your existing API routes (`/api/incident`, `/api/certificate`, `/api/track`, etc.) when the backend is ready.
