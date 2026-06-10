// RaceCard: displays a single race as a styled card
// Receives one `race` object as a prop from App
function RaceCard({ race }) {
  return (
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
  )
}

export default RaceCard