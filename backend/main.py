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


@app.get("/drivers")
def get_drivers(session_key: int):
    response = requests.get(
        "https://api.openf1.org/v1/drivers",
        params={"session_key": session_key},
    )
    return response.json()


@app.get("/sessions")
def get_sessions(year: int):
    response = requests.get(
        "https://api.openf1.org/v1/sessions",
        params={"year": year, "session_name": "Race"},
    )
    return response.json()
