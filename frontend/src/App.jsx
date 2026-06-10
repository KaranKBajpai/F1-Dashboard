// Import React hooks: useState for state, useEffect for side effects
// Import the stylesheet so this component's CSS classes work
// Import the RaceCard component so we can use it in the list below
import { useState, useEffect } from 'react'
import './App.css'
import RaceCard from './RaceCard'

// The App component — a function that returns the UI
// React re-runs this whole function whenever its state changes
function App() {

  // State: the selected year (starts at 2024) and the race list (starts empty)
  // Calling setYear / setRaces updates state and triggers a re-render
  const [year, setYear] = useState(2024)
  const [races, setRaces] = useState([])

  // Side effect: fetch the schedule for the selected year from the backend
  // Re-runs whenever `year` changes — that's what the [year] at the end means
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/schedule?year=${year}`)
      .then(res => res.json())
      .then(data => setRaces(data))
  }, [year])

  // The JSX: everything the component draws on screen
  // Must return a single parent element (the wrapping <div>)
  return (
    <div className="app">

      {/* Page heading */}
      {/* Static title at the top of the home page */}
      <h1 className="title">F1 Dashboard</h1>

      {/* Year selector: a controlled dropdown tied to `year` state */}
      {/* Picking a year updates state, which re-triggers the fetch above */}
      <select value={year} onChange={e => setYear(Number(e.target.value))}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
      </select>

      {/* Race grid: one RaceCard per race, laid out in a responsive grid */}
      <div className="race-grid">
        {races.map(race => (
          <RaceCard key={race.round} race={race} />
        ))}
      </div>
    </div>
  )
}

// Export the App component as this file's default export
// main.jsx imports it and renders it into the page
export default App