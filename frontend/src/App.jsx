import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [year, setYear] = useState(2024)
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [drivers, setDrivers] = useState([])

  // Fetch sessions whenever year changes
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/sessions?year=${year}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data)
        setSelectedSession(null)
        setDrivers([])
      })
  }, [year])

  // Fetch drivers whenever selectedSession changes
  useEffect(() => {
    if (!selectedSession) return
    fetch(`http://127.0.0.1:8000/drivers?session_key=${selectedSession}`)
      .then(res => res.json())
      .then(data => setDrivers(data))
  }, [selectedSession])

  return (
    <div className="app">
      <h1 className="title">🏎️ F1 Dashboard</h1>

      <div className="selectors">
        <select value={year} onChange={e => setYear(Number(e.target.value))}>
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>

        <select
          value={selectedSession || ''}
          onChange={e => setSelectedSession(Number(e.target.value))}
        >
          <option value="">Select a race</option>
          {sessions.map(session => (
            <option key={session.session_key} value={session.session_key}>
              {session.location} — {new Date(session.date_start).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div className="drivers-grid">
        {drivers.map(driver => (
          <div
            key={driver.driver_number}
            className="driver-card"
            style={{ borderLeft: `4px solid #${driver.team_colour}` }}
          >
            {driver.headshot_url && (
              <img
                src={driver.headshot_url}
                alt={driver.full_name}
                className="driver-photo"
              />
            )}
            <div className="driver-info">
              <span className="driver-number">#{driver.driver_number}</span>
              <h2 className="driver-name">{driver.full_name}</h2>
              <p className="team-name" style={{ color: `#${driver.team_colour}` }}>
                {driver.team_name}
              </p>
              <p className="country">{driver.country_code}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App