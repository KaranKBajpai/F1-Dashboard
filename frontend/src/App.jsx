import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [year, setYear] = useState(2024)
  const [races, setRaces] = useState([])

  // Fetch sessions whenever year changes
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/schedule?year=${year}`)
      .then(res => res.json())
      .then(data => setRaces(data))
  }, [year])

  return (
    <div className="app">
      <h1 className="title">F1 Dashboard</h1>

      <select value={year} onChange={e => setYear(Number(e.target.value))}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
      </select>

      <ul>
        {races.map(race => (
          <li key={race.round}>
            {race.flag} Round {race.round}: {race.raceName} -{' '}
            {race.winner ? `Winner: ${race.winner.name}` : 'Upcoming'}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App