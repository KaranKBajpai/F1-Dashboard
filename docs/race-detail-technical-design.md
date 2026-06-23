# F1 Dashboard — Race Detail Technical Design

> Technical design document for the Race Detail page.
> This is a living document — update it as the design changes.

---

## Overview

The Race Detail page is the **second page** of the F1 Dashboard. You reach it by
clicking a race card on the Home feed; it shows that one race's **finishing order** —
a clean classification table of every driver, with position, team (in team color),
time or gap, fastest lap, and points.

It is the "drill down" half of the app's core loop: browse races on the Home feed,
click one, see how it played out. The atomic unit is still the **race**; this page is
that race seen up close.

Scope for **v1** is deliberately just the results table plus a header (race name + year).
Richer visuals — track photo, lap-by-lap telemetry, a grid-vs-finish toggle, fastest-lap
badges — are parked as later polish.

---

## Technical Design

### The URL carries the inputs: `/race/:year/:round`

To fetch one race's results, the page needs **two** facts: which season and which round.
Round number alone is meaningless — round 8 exists in every season. So the detail page's
URL carries both, and the page reads them back out of its own address.

This is a small adjustment to the route built during the Home feed work, which was
`/race/:round`. It becomes:

```
/race/:year/:round        e.g.  /race/2024/8
```

Three edits make this happen:

- **`App.jsx`** — the route gains the year segment: `path="/race/:year/:round"`.
- **`RaceCard`** — receives the currently-selected `year` as a prop (the Home page
  already holds it in state).
- **`RaceCard`'s `Link`** — its destination becomes `` `/race/${year}/${race.round}` ``.

The payoff: each detail URL is **self-contained and shareable**. `/race/2024/8` fully
describes what it shows, with no hidden state — paste it to someone and it loads the
2024 Monaco results exactly.

### Data source: Jolpica (not OpenF1) for v1

The whole finishing classification comes from Jolpica in **one** call:

```
/ergast/f1/{year}/{round}/results.json
```

That single response carries everything v1 needs for every driver — position, constructor,
time/gap, points, grid slot, and fastest lap — for every season back to 1950.

OpenF1 was the loose earlier pick for "race detail," but for a plain finishing order it is
the wrong tool for v1: it is session-based (round would have to be translated to a
`session_key` first), only reaches back to 2023, and its real strength is *telemetry* —
lap times, positions over time, driver photos, car data. That strength earns it a place in
a later, richer "telemetry view"; it does not help assemble a final classification today.

### Backend: the `/race` endpoint

Same principle as the Home feed: **backend owns the data, frontend stays dumb.** We add one
new endpoint — one new door into the backend:

```
GET /race?year=2024&round=8
```

`year` and `round` arrive as **query parameters** (the same mechanism as `?year=` on the
existing `/schedule` endpoint). The endpoint calls Jolpica, reshapes the messy Ergast
response into a clean list, attaches team colors from the existing `TEAM_COLORS` map, and
returns render-ready data:

```json
{
  "raceName": "Monaco Grand Prix",
  "season": "2024",
  "round": "8",
  "results": [
    { "position": 1, "driver": "Charles Leclerc", "team": "Ferrari",
      "teamColor": "E8002D", "time": "2:23:15.554", "points": 25,
      "fastestLap": "1:14.165", "grid": 3 }
  ]
}
```

One wrinkle the backend smooths out: **not every driver has a time.** P1 has a full race
time; everyone else has a gap (`+7.875`); a DNF has no time at all, only a status like
"Retired." The backend normalizes this so the frontend can show time/gap when it exists and
the status otherwise — the frontend never has to reason about Ergast's quirks.

### Frontend: the RaceDetail page

`RaceDetail` does exactly what `Home` already does, just for one race instead of a list:

1. `useParams()` reads `year` and `round` out of the URL.
2. `fetch` calls the new `/race?year={year}&round={round}` endpoint.
3. Render a header (race name + year) and map the results into table rows.

The only genuinely new piece is **`useParams`** — React Router's hook for reading the
dynamic URL segments. Everything else is the same fetch-into-state, map-into-JSX shape
already used on the Home feed.

### Data flow diagram

```
[ User clicks a card on the 2024 feed ]
        |
        v
[ <Link> -> navigate to /race/2024/8 ]
        |
        v
[ RaceDetail mounts ]
   useParams() reads year=2024, round=8 from the URL
        |
        v
   fetch GET /race?year=2024&round=8
        |
        v
[ FastAPI /race endpoint ]
   - call Jolpica /ergast/f1/2024/8/results.json
   - reshape Ergast response -> clean results[]
   - attach teamColor from TEAM_COLORS
   - normalize time / gap / status
        |
        v
   returns { raceName, season, round, results[] }
        |
        v
[ React renders header + maps results -> table rows ]
```

### Open decisions

- **Time vs gap vs status display.** Recommended: one field the backend fills sensibly —
  full time for P1, `+gap` for finishers, status text ("Retired", "DNF") for the rest —
  so the frontend prints one column without branching logic.
- **Team color reuse.** The existing `TEAM_COLORS` map already covers constructors; reuse
  it as-is. Same accepted trade-off as the feed: silent white fallback for an unmapped team.
- **Table vs cards.** Recommended: a real table for the classification — it is tabular data
  and reads cleanly as rows. Card styling is a later cosmetic choice.

### To verify when building

- Exact response shape of the Jolpica `/results` endpoint — the nesting of `Results`,
  `Driver`, `Constructor`, `Time`, `FastestLap`, and `status`.
- How DNFs and lapped cars appear in that response (the `status` field), so the
  time/gap/status normalization handles them.
- That `useParams` returns the segment names matching the route (`year`, `round`).

---

## Why These Decisions

**Put the inputs in the URL.** The detail page needs a year and a round to fetch anything,
and the URL is how the page receives those inputs. Encoding both in the path makes the page
self-sufficient and the URL shareable — paste `/race/2024/8` and it just works, no hidden
state. This is the same "one source of truth" discipline as the feed, applied to navigation.

**Use each API for what it is good at — and re-check that as you go.** OpenF1 was the loose
earlier pick, but designing the page closely revealed Jolpica returns the whole
classification in one call, for every season, mapped straight off year + round. Picking the
simpler, broader tool for v1 and saving OpenF1's telemetry for where it shines is using each
API for its strength — and a reminder that a loose early plan should be re-examined when you
reach it, not followed blindly.

**Keep the backend smart and the frontend dumb.** Ergast's response is messy — nested
structures, and a time field that is sometimes a race time, sometimes a gap, sometimes
absent. Normalizing all of that server-side means the frontend receives a clean list and
just draws rows. If the data source ever changes, one backend function changes and the page
is untouched.

**Reuse what already works.** The `TEAM_COLORS` map and the query-parameter pattern already
exist and are proven on the feed. The detail page leans on both rather than inventing new
mechanisms — less new surface area, less to get wrong, and the codebase stays consistent.

**Build for the view you have.** v1 is one results table and a header. No track photos, no
telemetry, no toggles — those are added when they earn their place, not before. The page
ships and is explainable now; richness is a later, separate step.

**One new concept at a time.** The only genuinely new thing here is `useParams`. Everything
else — fetch into state, map into JSX, one new backend endpoint — repeats patterns already
built and understood. New learning stays small and isolated, so when something breaks the
culprit is obvious.
