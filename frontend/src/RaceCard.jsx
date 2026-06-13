// RaceCard: displays a single race as a styled card
// Receives one `race` object as a prop from App
// Wrapped in a Link so clicking navigates to that race's detail page
import { Link } from "react-router-dom"

function RaceCard({ race }) {
  return (
    <Link to={`/race/${race.round}`} className="race-card-link">
        <div className="race-card">

        {/* Top row: round label on the left, flag on the right */}
        <div className="race-card-top">
            <span className="race-round">Round {race.round}</span>
            <span className="race-flag">{race.flag}</span>
        </div>

        {/* Race name and date */}
        <h2 className="race-name">{race.raceName}</h2>
        <p className="race-date">{race.date}</p>

        {/* Winner in their team color, or "Upcoming" if it hasn't happened */}
        {race.winner ? (
            <p className="race-winner" style={{ color: `#${race.winner.teamColor}` }}>
            🏆 {race.winner.name}
            </p>
        ) : (
            <p className="race-upcoming">Upcoming</p>
        )}

        </div>
    </Link>
  )
}

export default RaceCard