# F1 Dashboard — Home Feed Technical Design

> Technical design document for the home page race feed.
> This is a living document — update it as the design changes.

---

## Overview

The F1 Dashboard is a full-stack web app (React frontend + FastAPI backend) that
pulls real Formula 1 data and presents it in a clean, OneFootball-inspired layout.

The app has **three pages**:

1. **Home (Explore Races)** — a feed of race cards (upcoming + previous). *This is the heart of the app and the feature this document covers.*
2. **Race Detail** — reached by clicking a race card; shows the finishing order with per-driver stats.
3. **Driver Comparison** — pick two drivers, see their stats side by side.

A fourth section, **Tracks / Historical**, is parked for **v2**.

The atomic unit of the app is the **race** — the same way a *match* is the atomic
unit on OneFootball. You browse races, click into one, and drill down.

---

## Technical Design

### Data sources and responsibilities

Two external APIs, each used for what it is best at:

- **Jolpica** (the maintained successor to the old Ergast API) — season **schedule**
  (including upcoming races), **results**, standings, and circuit info, going back to 1950.
  *The home feed is essentially a Jolpica feature.*
- **OpenF1** — deep race **telemetry** (lap times, pit stops, positions, driver photos,
  team colors), historical from 2023 onward. *Not needed for the home feed; it returns
  on the Race Detail page.*

### Backend: the `/schedule` endpoint

The backend is the smart middle layer. The frontend asks for "the schedule" once and
receives clean, render-ready race objects. New endpoint:

```
GET /schedule?year=2024
```

Internally it does three things:

1. **Fetch the schedule** from Jolpica (`/ergast/f1/{year}/races/`) — round number,
   race name, circuit, country, date for every race.
2. **Fetch the season's winners** from Jolpica (results filtered to finishing
   position 1 returns the winner of each round). *Verify the exact response shape when building.*
3. **Merge and tag** the two together before returning.

Merge logic (pseudocode):

```
for each race in schedule:
    race.status = "completed" if race.date < today else "upcoming"
    if completed:
        race.winner = winnersByRound[race.round]
        race.winner.teamColor = TEAM_COLORS[race.winner.team]
    else:
        race.winner = null
```

The `status` field implements the "same card, the winner field just differs" decision:
completed races carry a winner; upcoming races carry `null` and the card shows the date instead.

Shape of each returned object:

```
RaceObject {
  round:     8,
  raceName:  "Monaco Grand Prix",
  country:   "Monaco",
  date:      "2024-05-26",
  status:    "completed" | "upcoming",
  winner:    { name, team, teamColor } | null
}
```

The frontend never sees Jolpica's raw structure — only this.

### Frontend: Home page + RaceCard

- **Home page component** — holds `year` in state, fetches `/schedule?year={year}`
  whenever the year changes (same `useEffect` pattern used for the driver list), and
  maps the returned list into cards.
- **RaceCard component** — receives one `RaceObject` and renders round number, country
  flag, track name, date, and either the winner (in their team color) or an "upcoming"
  treatment. Clicking the card navigates to that race's detail page.

The clickable-card behavior introduces one new piece of infrastructure: **React Router**
(the app is currently a single page). Small and standard, but genuinely new.

### Data flow diagram

```
[ User opens Home ]
        |
        v
[ Year selector: 2024 ] --on load/change--> fetch GET /schedule?year=2024
                                                      |
                                                      v
                                          [ FastAPI /schedule ]
                                           /                  \
                              Jolpica schedule          Jolpica winners
                            (races + dates)           (position 1 / round)
                                           \                  /
                                            v                v
                                        [ merge in backend ]
                                     - tag completed vs upcoming
                                     - attach winner + team color + flag
                                                      |
                                                      v
                                       returns clean race[] list
                                                      |
                                                      v
                              [ React maps races -> <RaceCard/> grid ]
                                                      |
                                       click card --> navigate
                                                      v
                                [ Race Detail page  /race/:round ]
```

### Open decisions

- **Team color source.** Jolpica gives the winning constructor's *name*, not a color.
  Recommended: a small hardcoded `TEAM_COLORS` map in the backend (name → hex). Reliable,
  fast, no extra API call. Trade-off: needs a manual update each season.
- **Country flags.** Recommended: map country to a flag emoji for v1 (no images to host).
  Upgrade to flag images later if desired.
- **Two Jolpica calls per page load.** Fine for v1 — limits are generous and the schedule
  barely changes. Caching is an easy later optimization, not a v1 concern.

### To verify when building

- Exact response shape of the Jolpica winners endpoint (results / position 1).
- Whether flags will be handled on the backend or the frontend.
- Jolpica rate limits, if the two-call pattern ever feels slow (caching is the fallback).

---

## Why These Decisions

**Put the data logic in the backend, keep the frontend dumb.** Merging and past/upcoming
tagging happen server-side so the frontend receives render-ready objects and only has to
loop and draw. This keeps components simple and makes the app resilient: if the data
source ever changes, only one backend function changes and the frontend is untouched.

**Compute "completed vs upcoming" once, on the server.** Whether a race has happened
depends on today's date. Decide it in one place, stamp it on the data, let the frontend
just read the field. One source of truth.

**Use each API for what it is good at.** Jolpica owns schedule/results/history; OpenF1
owns deep telemetry. The home feed is all schedule and results, so it is pure Jolpica.
OpenF1 waits for the Race Detail page where its data earns its place.

**Don't take a live dependency for data that is basically static.** Team colors don't
change mid-season, so a network call to fetch them every load adds a failure point and
latency for zero benefit. A hardcoded map is more reliable and faster. The small manual
maintenance cost is worth removing the dependency.

**Build for the view you have, not the app you might want.** One `/schedule` endpoint for
the one page that needs it, rather than "more reusable" granular endpoints built before
they're needed. Same reason caching is deferred — don't optimize a problem you don't have.

**Verify in small steps.** The work is sequenced so every step is independently
checkable and commit-sized. If something breaks, the culprit is the last small change.
This also feeds the daily-commit habit and follows "working before pretty."

**Architecture is contextual.** These choices fit a solo developer learning the stack and
building a portfolio piece that must ship and be explainable in an interview — so:
no premature microservices, no heavy state library, no caching layer, but enough good
structure to read as competent work. A ten-person team at scale would flip several of these.
