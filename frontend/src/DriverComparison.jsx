// DriverComparison: pick two drivers and compare their season stats
import { useState, useEffect } from 'react'

// Stat rows to display, in order: [label, key]
const STAT_ROWS = [
  ['Races', 'races'],
  ['Wins', 'wins'],
  ['Podiums', 'podiums'],
  ['Points', 'points'],
  ['Best Finish', 'bestFinish'],
  ['Fastest Laps', 'fastestLaps'],
  ['DNFs', 'dnfs'],
  ['Avg Finish', 'avgFinish'],
]

// For each stat, is a LOWER or HIGHER number better?
// DNFs and Avg Finish: lower is better. Everything else: higher is better.
const LOWER_IS_BETTER = new Set(['dnfs', 'avgFinish'])

function DriverComparison() {

  // The list of drivers for the season (fills both dropdowns)
  const [drivers, setDrivers] = useState([])

  // Which driver is picked in each dropdown (stored by driverId)
  const [driver1, setDriver1] = useState('')
  const [driver2, setDriver2] = useState('')

  // The fetched stat lines for each pick; null until a driver is chosen
  const [stats1, setStats1] = useState(null)
  const [stats2, setStats2] = useState(null)

  // The season we're comparing within (hardcoded for now)
  const year = 2024

  // Fetch the season's drivers once, when the page loads
  useEffect(() => {
    fetch(`http://localhost:8000/drivers?year=${year}`)
      .then((res) => res.json())
      .then((data) => setDrivers(data))
  }, [year])

  // Fetch driver 1's stats whenever the first selection changes
  useEffect(() => {
    if (!driver1) {
      setStats1(null)
      return
    }
    fetch(`http://localhost:8000/driver-stats?year=${year}&driverId=${driver1}`)
      .then((res) => res.json())
      .then((data) => setStats1(data))
  }, [year, driver1])

  // Same for driver 2
  useEffect(() => {
    if (!driver2) {
      setStats2(null)
      return
    }
    fetch(`http://localhost:8000/driver-stats?year=${year}&driverId=${driver2}`)
      .then((res) => res.json())
      .then((data) => setStats2(data))
  }, [year, driver2])

  return (
    <div className="app">
      <h1 className="title">Driver Comparison</h1>
      <p className="subtitle">{year} Season</p>

      {/* Two dropdowns, one per driver to compare */}
      <div className="compare-selectors">
        <select value={driver1} onChange={(e) => setDriver1(e.target.value)}>
          <option value="">Select a driver</option>
          {drivers.map((d) => (
            <option key={d.driverId} value={d.driverId}>{d.name}</option>
          ))}
        </select>

        <select value={driver2} onChange={(e) => setDriver2(e.target.value)}>
          <option value="">Select a driver</option>
          {drivers.map((d) => (
            <option key={d.driverId} value={d.driverId}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Head-to-head table: only renders once both drivers are picked */}
      {stats1 && stats2 ? (
        <div className="compare-table">

          {/* Header row: driver names in team color */}
          <div className="compare-row compare-header">
            <span style={{ color: `#${stats1.teamColor}` }}>{stats1.name}</span>
            <span className="compare-label"></span>
            <span style={{ color: `#${stats2.teamColor}` }}>{stats2.name}</span>
          </div>

          {/* One row per stat, label in the middle */}
          {STAT_ROWS.map(([label, key]) => {
            const v1 = stats1[key]
            const v2 = stats2[key]
            const lowerBetter = LOWER_IS_BETTER.has(key)

            let winner = null
            if (v1 != null && v2 != null && v1 !== v2) {
              winner = lowerBetter
                ? (v1 < v2 ? 1 : 2)
                : (v1 > v2 ? 1 : 2)
            }

            return (
              <div className="compare-row" key={key}>
                <span className={winner === 1 ? 'stat-winner' : ''}>
                  {key === 'bestFinish' && v1 != null ? `P${v1}` : v1}
                </span>
                <span className="compare-label">{label}</span>
                <span className={winner === 2 ? 'stat-winner' : ''}>
                  {key === 'bestFinish' && v2 != null ? `P${v2}` : v2}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="compare-prompt">Pick two drivers to compare their season.</p>
      )}
    </div>
  )
}

export default DriverComparison