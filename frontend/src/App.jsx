import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/drivers')
      .then(res => res.json())
      .then(data => setDrivers(data))
  }, [])

  return (
    <div className="app">
      <h1 className="title">🏎️ F1 Dashboard</h1>
      <p className="subtitle">2024 Monaco Grand Prix</p>
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
              <p
                className="team-name"
                style={{ color: `#${driver.team_colour}` }}
              >
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