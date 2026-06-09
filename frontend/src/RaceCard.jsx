// RaceCard: a reusable component that displays a single race
// It receives one `race` object as a prop, passed in from App
function RaceCard({ race }) {

  // The markup for one race — the same content that used to live in the <li>
  // Shows flag, round, name, and the winner (or "Upcoming" if not yet raced)
  return (
    <li>
      {race.flag} Round {race.round}: {race.raceName} -{' '}
      {race.winner ? `Winner: ${race.winner.name}` : 'Upcoming'}
    </li>
  )
}

// Make RaceCard importable from other files (App.jsx uses it)
export default RaceCard