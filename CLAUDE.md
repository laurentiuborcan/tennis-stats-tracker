# Tennis Stats Tracker — Project Context

## What this is
A vanilla JS (no framework) ATP/WTA stats app, deployed on GitHub Pages.
Repo: `laurentiuborcan/Claude-Code`

## Sandbox constraints (IMPORTANT)
- This environment's git proxy only allows pushes to branches matching `claude/*-cq97s` or similar
  (check current session's allowed branch name — it changes per Claude Code session).
  Direct pushes to `main` return 403.
- Cannot create/merge PRs programmatically — user does this manually on GitHub after each push.

## Git workflow conventions
- Feature branches: `feature/*`, fixes: `fix/*`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`
- Always create a branch before making changes — never commit directly to main

## App structure
- 5 tabs: ATP Rankings, WTA Rankings, Live Matches, Tournaments, H2H
- Dark theme, green accents, mobile-responsive (tab bar scrolls horizontally on narrow screens)
- Player Profiles accessible by clicking any player name (rankings, H2H, tournament draws)

## Data sources
1. **ATP/WTA Rankings** — live via RapidAPI TennisApi (`tennisapi1.p.rapidapi.com`), with
   hardcoded `DEMO` fallback data when API quota is exceeded. API key is in app.js.
   **Quota is limited** — be conservative with API calls during development/testing.
2. **Live Matches** — `GET /api/tennis/events/live`
3. **Player Profiles** — two-step: `GET /api/tennis/search/{name}` to get numeric ID, then
   `GET /api/tennis/player/{id}` for full profile. Cached in `state.playerCache` per session.
4. **Tournament results** — `GET /api/tennis/tournament/{uniqueId}/seasons` to get season ID,
   then `GET /api/tennis/tournament/{uniqueId}/season/{seasonId}/events/last/0` for matches.
   - `TOURNAMENT_IDS` object in app.js maps slugs to uniqueIds (see below for known IDs)
   - Tournament IDs occupy a different numeric range than season IDs — don't confuse them
   - `/seasons` sub-endpoint needs the **uniqueTournament.id**, not a season-specific tournament ID

## Known tournament IDs (uniqueId — reuse these, don't re-discover via API calls)
- Miami Open: ATP 2430, WTA 2587
- Monte Carlo Rolex Masters: ATP 2391
- Mutua Madrid Open: ATP 2374, WTA 2607
- Internazionali BNL d'Italia (Rome): ATP 2488, WTA 2569
- Roland Garros: ATP 2480, WTA 2577
- Wimbledon: ATP 2361, WTA 2600
- US Open: ATP 2449, WTA 2601
- Australian Open: ATP 2363, WTA 2571
- Halle Open: ATP 2493
- Cinch Championships (aka Queen's Club, API lists as "London"): ATP 2494

## Tournament status logic (DEMO_TOURNAMENTS in app.js)
- `status: 'upcoming'` — no Load Results button, no auto-load
- `status: 'ongoing'` — manual "Load Live Results" button shown
- `status: 'completed'` — auto-loads results on tournament detail page open, no button shown
- **Statuses go stale over time as the season progresses** — when working on this app, check
  today's date against the tournament's date range and update status if needed (this has been
  a recurring issue — e.g. Rome/Madrid/Wimbledon status fixes were needed multiple times)
- Draw view (visual bracket) only works with hardcoded DRAW_DATA (Miami Open only) — for tournaments
  with live API results, the bracket button is hidden and list view (All Matches/Completed) is used
  instead, since the bracket geometry breaks with real API round-name variability

## Mobile layout notes
- Tab bar uses horizontal scroll (`overflow-x: auto`, hidden scrollbar) — all 5 tabs reachable
  by swiping, active tab auto-scrolls into view via `scrollIntoView()`
- Rankings table has responsive column hiding under 600px/400px breakpoints

## API call discipline
RapidAPI quota is limited and shared across rankings + player profiles + tournament results.
When debugging, prefer reading existing JSON/cached data over making fresh API calls.
If quota is hit, wait for reset (typically next day) rather than guessing at endpoint behavior.
