import requests
from datetime import date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEAM_COLORS = {
    "Red Bull":        "3671C6",
    "Ferrari":         "E8002D",
    "McLaren":         "FF8000",
    "Mercedes":        "27F4D2",
    "Aston Martin":    "358C75",
    "Alpine F1 Team":  "FF87BC",
    "Williams":        "64C4FF",
    "RB F1 Team":      "6692FF",
    "Sauber":          "52E252",
    "Haas F1 Team":    "B6BABD",
}

COUNTRY_FLAGS = {
    "Australia":    "🇦🇺",
    "Austria":      "🇦🇹",
    "Azerbaijan":   "🇦🇿",
    "Bahrain":      "🇧🇭",
    "Belgium":      "🇧🇪",
    "Brazil":       "🇧🇷",
    "Canada":       "🇨🇦",
    "China":        "🇨🇳",
    "Hungary":      "🇭🇺",
    "Italy":        "🇮🇹",
    "Japan":        "🇯🇵",
    "Mexico":       "🇲🇽",
    "Monaco":       "🇲🇨",
    "Netherlands":  "🇳🇱",
    "Qatar":        "🇶🇦",
    "Saudi Arabia": "🇸🇦",
    "Singapore":    "🇸🇬",
    "Spain":        "🇪🇸",
    "UAE":          "🇦🇪",
    "UK":           "🇬🇧",
    "USA":          "🇺🇸",
}


@app.get("/")
def root():
    return {"message": "F1 Dashboard is running!"}


@app.get("/schedule")
def get_schedule(year: int):
    schedule_res = requests.get(f"https://api.jolpi.ca/ergast/f1/{year}.json")
    races = schedule_res.json()["MRData"]["RaceTable"]["Races"]

    winners_res = requests.get(
        f"https://api.jolpi.ca/ergast/f1/{year}/results/1.json",
        params={"limit": 100},
    )
    winner_races = winners_res.json()["MRData"]["RaceTable"]["Races"]
    winners_by_round = {r["round"]: r["Results"][0] for r in winner_races}

    today = date.today().isoformat()
    result = []
    for race in races:
        round_num = race["round"]
        race_date = race["date"]
        status = "completed" if race_date < today else "upcoming"

        winner = None
        if status == "completed" and round_num in winners_by_round:
            w = winners_by_round[round_num]
            team = w["Constructor"]["name"]
            winner = {
                "name": w["Driver"]["givenName"] + " " + w["Driver"]["familyName"],
                "team": team,
                "teamColor": TEAM_COLORS.get(team, "ffffff"),
            }

        country = race["Circuit"]["Location"]["country"]
        result.append({
            "round": int(round_num),
            "raceName": race["raceName"],
            "country": country,
            "flag": COUNTRY_FLAGS.get(country, "🏁"),
            "date": race_date,
            "status": status,
            "winner": winner,
        })

    return result

# /drivers endpoint: returns the season's drivers for the comparison dropdowns
# Takes year as a query param, returns a clean list of { driverId, name }
@app.get("/drivers")
def get_drivers(year: int):

    # Fetch the season's driver list from Jolpica
    # A generous limit makes sure we get all ~20+ drivers in one page
    url = f"https://api.jolpi.ca/ergast/f1/{year}/drivers.json?limit=100"
    data = requests.get(url).json()

    # Dig down to the Drivers list (note: DriverTable, not RaceTable)
    drivers = data["MRData"]["DriverTable"]["Drivers"]

    # Build a clean list: machine id + display name for each driver
    result = []
    for d in drivers:
        result.append({
            "driverId": d["driverId"],
            "name": d["givenName"] + " " + d["familyName"],
        })

    # Return the clean list straight to the frontend
    return result

@app.get("/race")
def get_race(year: int, round: int):
    # Fetch this one race's results from Jolpica
    # The /results endpoint gives the finishing order for a single race
    url = f"https://api.jolpi.ca/ergast/f1/{year}/{round}/results.json"
    data = requests.get(url).json()

    # Dig down to the race object inside Ergast's nested structure
    races = data["MRData"]["RaceTable"]["Races"]

    if not races:
        return {"hasResults": False, "season": str(year), "round": str(round)}
    
    race = races[0]

    # Build a clean results list out of the raw Results array
    # Each raw entry has nested Driver / Constructor / Time / FastestLap objects
    results = []
    for r in race["Results"]:

        # Driver name and team come from their nested objects 
        driver = r["Driver"]["givenName"] + " " + r["Driver"]["familyName"]
        team = r["Constructor"]["name"]

        # Time only exists for classified finishers; otherwise fall back to status
        # ("if 'Time' in r" guards against the DNF case that has no Time object")
        time = r["Time"]["time"] if "Time" in r else r["status"]

        # FastestLap isn't always present either, so guard it the same way
        fastest = r["FastestLap"]["Time"]["time"] if "FastestLap" in r else None

        # Assemble one clean, render-ready driver object
        results.append({
            "position": int(r["position"]),
            "driver": driver,
            "team": team,
            "teamColor": TEAM_COLORS.get(team, "FFFFFF"),
            "time": time,
            "points": int(r["points"]),
            "fastestLap": fastest,
            "grid": int(r["grid"]),
        })

    # Return clean data to the frontend - it never sees Ergast's raw shape
    return {
        "hasResults": True,
        "raceName": race["raceName"],
        "season": race["season"],
        "round": race["round"],
        "results": results,
    }

# /driver-stats endpoint: computes one driver's season stat line
# Fetches the driver's whole season and tallies wins, podiums, points, etc.
@app.get("/driver-stats")
def get_driver_stats(year: int, driverId: str):

    # Fetch this driver's entire season in one call
    # The per-driver results endpoint returns every race they ran that season
    url = f"https://api.jolpi.ca/ergast/f1/{year}/drivers/{driverId}/results.json?limit=100"
    data = requests.get(url).json()

    # Grab a list of races this driver took part in
    races = data["MRData"]["RaceTable"]["Races"]

    # Guard: no races (Driver didn't race this season) - return a clean signal
    if not races:
        return {"hasStats": False, "driverId": driverId}
    
    # Counters we'll add to as we walk the races
    # They start at zero and accumulate across the whole season
    wins = 0
    podiums = 0
    dnfs = 0
    fastest_laps = 0
    total_points = 0.0
    finishes = [] # finishing positions, for best finish + average

    # Walk every race and tally the driver's results
    for race in races:
        r = race["Results"][0] # This driver's own result in that race

        # Points come as a string; add them up as numbers
        total_points += float(r["points"])

        # positionText is a number if classified, or "R" if retired
        # Only count a finish when the driver actually classified 
        if r["positionText"].isdigit():
            pos = int (r["position"])
            finishes.append(pos)
            if pos == 1:
                wins += 1
            if pos <= 3:
                podiums += 1
        elif r["positionText"] == "R":
            dnfs += 1

        # Fastest Lap: present only sometimes; rank "1" means fastest lap of the race
        if "FastestLap" in r and r["FastestLap"]["rank"] == "1":
            fastest_laps += 1

    # Best Finish = lowest position; average = mean of finishes
    # Guard against a driver who never actually finished (empty list)
    best_finish = min(finishes) if finishes else None
    avg_finish = round (sum(finishes) / len(finishes), 1) if finishes else None

    # Team + name come from the driver's most recent race (last in the race)
    last = races[-1]["Results"][0]
    team = last["Constructor"]["name"]
    name = last["Driver"]["givenName"] + " " + last["Driver"]["familyName"]

    # Clean points: Show a whole number when there are no half-points
    points = int (total_points) if total_points == int (total_points) else total_points

    # Return the clean, computed stat line
    return {
        "hasStats": True,
        "driverId": driverId,
        "name": name,
        "team": team,
        "teamColor": TEAM_COLORS.get(team, "FFFFFF"),
        "races": len(races),
        "wins": wins,
        "podiums": podiums,
        "points": points,
        "bestFinish": best_finish,
        "fastestLaps": fastest_laps,
        "dnfs": dnfs,
        "avgFinish": avg_finish,
    }