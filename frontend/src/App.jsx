// App: the routing shell — decides which page to show based on the URL
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './Home'
import RaceDetail from './RaceDetail'
import DriverComparison from './DriverComparison'
import './App.css'
import NavBar from './NavBar'

function App () {
  return (
    // BrowserRouter turns on URL-based routing for everything inside it
    <BrowserRouter>
      {/* Routes holds all the URL-to-page mappings */}
      <NavBar />
      <Routes>
        {/* URL "/" shows the Home page */}
        <Route path="/" element={<Home />} />
        {/* "/race/:year/:round" — both season and round captured from the URL */}
        <Route path="/race/:year/:round" element={<RaceDetail />}/>
        {/* "/compare" shows the Driver Comparison Page */}
        <Route path="/compare" element={<DriverComparison />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App