// RaceDetail: Shows one race's full finishing order
// Reads year + round from the URL, fetches the race, renders the table
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function RaceDetail () {

    // Pull year and round out of the URL (/race/:year/:round)
    // useParams returns an object with whatever the route named
    const { year, round } = useParams()

    // Hold the fetched race data; null until it arrives
    const [race, setRace] = useState(null)

    // Fetch this race's results whenever year or round changes
    // Same fetch-into-state pattern as Home, just for one race
    useEffect(() => {
        fetch (`http://localhost:8000/race?year=${year}&round=${round}`)
            .then((res) => res.json())
            .then((data) => setRace(data))
    }, [year, round])

    // Before data arrives, show a simple loading state
    // race is null on the first render, before the fetch finishes

    if (!race) {
        return <p className='loading'>Loading race...</p>
    }

    if (!race.hasResults) {
        return (
            <div className='app'>
                <h1 className='title'>Race hasn't happened yet</h1>
                <p className='subtitle'>{race.season} Season - Round {race.round}</p>
            </div>
        )
    }

    return (
        <div className='app'>
            {/* Header: race name + season */}
            <h1 className='title'>{race.raceName}</h1>
            <p className='subtitle'>{race.season} Season - Round {race.round}</p>

            {/* Finishing Order Table */}
            <table className='results-table'>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Time</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {/* One row per driver in the results list */}
                    {race.results.map((r) => (
                        <tr key={r.position}>
                            <td>{r.position}</td>
                            <td>{r.driver}</td>
                            <td style={{ color: `#${r.teamColor}` }}>{r.team}</td>
                            <td>{r.time}</td>
                            <td>{r.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RaceDetail