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
    <div>
      <h1>F1 Dashboard</h1>
      <div>
        {drivers.map(driver => (
          <div key={driver.driver_number}>
            <p>{driver.full_name}</p>
            <p>{driver.team_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App