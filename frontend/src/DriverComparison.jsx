// DriverComparison: pick two drivers and compare their season stats
// Step 1: load the season's drivers and fill two dropdowns
import { useState, useEffect } from 'react'

function DriverComparison () {

    // The List of drivers for the season (Fills both dropdowns)
    // Starts Empty: filled after we fetch /drivers
    const [drivers, setDrivers] = useState([])

    // Which driver is picked in each dropdown (stored by driverId)
    // Empty string means "nothing has been selected yet"
    const [driver1, setDriver1] = useState('')
    const [driver2, setDriver2] = useState('')

    // The season we're comparing within (hardcoded for now)
    const year = 2024

    // Fetch the season's drivers once, when the page loads
    // Same fetch-into-state pattern as Home, filling the dropdown list
    useEffect (() => {
        fetch(`http://localhost:8000/drivers?year=${year}`)
            .then ((res) => res.json())
            .then ((data) => setDrivers(data))
    }, [year])

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
        </div>
    )
}

export default DriverComparison