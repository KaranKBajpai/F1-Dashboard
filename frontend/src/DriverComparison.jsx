// DriverComparison: pick two drivers and compare their season stats
// Step 1: load the season's drivers and fill two dropdowns
import { useState, useEffect } from 'react'

// StatColumn: renders one driver's stat line, or a prompt if none picked
function StatColumn({ stats }) {

  // Nothing selected yet for this side
  if (!stats) {
    return <div className="stat-column"><p>Pick a driver</p></div>
  }

  return (
    <div className="stat-column">
      {/* Driver name in team color */}
      <h2 style={{ color: `#${stats.teamColor}` }}>{stats.name}</h2>
      <p className="stat-team">{stats.team}</p>

      {/* One row per stat */}
      <p>Races: {stats.races}</p>
      <p>Wins: {stats.wins}</p>
      <p>Podiums: {stats.podiums}</p>
      <p>Points: {stats.points}</p>
      <p>Best Finish: P{stats.bestFinish}</p>
      <p>Fastest Laps: {stats.fastestLaps}</p>
      <p>DNFs: {stats.dnfs}</p>
      <p>Avg Finish: {stats.avgFinish}</p>
    </div>
  )
}

function DriverComparison () {

    // The List of drivers for the season (Fills both dropdowns)
    // Starts Empty: filled after we fetch /drivers
    const [drivers, setDrivers] = useState([])

    // Which driver is picked in each dropdown (stored by driverId)
    // Empty string means "nothing has been selected yet"
    const [driver1, setDriver1] = useState('')
    const [driver2, setDriver2] = useState('')

    // The fetched stat lines for each pick; null until a driver is chosen
    const [stats1, setStats1] = useState(null)
    const [stats2, setStats2] = useState(null)

    // The season we're comparing within (hardcoded for now)
    const year = 2024

    // Fetch the season's drivers once, when the page loads
    // Same fetch-into-state pattern as Home, filling the dropdown list
    useEffect (() => {
        fetch(`http://localhost:8000/drivers?year=${year}`)
            .then ((res) => res.json())
            .then ((data) => setDrivers(data))
    }, [year])

    // Fetch driver 1's stats whenever the first selection changes
    // The guard skips the fetch when nothing is selected yet
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
        <div className='app'>
            <h1 className='title'>Driver Comparison</h1>
            <p className='subtitle'>{year} Season</p>

            {/* Two dropdowns, one per driver to compare */}
            <div className='compare-selectors'>

                {/* Dropdown 1 - Pick the first driver */}
                <select value={driver1} onChange={(e) => setDriver1(e.target.value)}>
                    <option value="">Select a driver</option>
                    {drivers.map((d) => (
                        <option key={d.driverId} value={d.driverId}>{d.name}</option>
                    ))}
                </select>

                {/* Dropdown 2 - Pick the second driver */}
                <select value={driver2} onChange={(e) => setDriver2(e.target.value)}>
                    <option value="">Select a driver</option>
                    {drivers.map((d) => (
                        <option key={d.driverId} value={d.driverId}>{d.name}</option>
                    ))}
                </select>

            </div>
                {/* Two stat columns, one per selected driver */}
                <div className="compare-columns">
                    <StatColumn stats={stats1} />
                    <StatColumn stats={stats2} />
                </div>
        </div>
    )
}

export default DriverComparison