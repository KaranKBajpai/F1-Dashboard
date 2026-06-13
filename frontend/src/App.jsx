// App: the routing shell — decides which page to show based on the URL
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './Home'
import RaceDetail from './RaceDetail'
import './App.css'

function App () {
  return (
    // BrowserRouter turns on URL-based routing for everything inside it
    <BrowserRouter>
      {/* Routes holds all the URL-to-page mappings */}
      <Routes>
        {/* URL "/" shows the Home page */}
        <Route path="/" element={<Home />} />
        {/* "/race/:round" shows RaceDetail; :round is a placeholder matching any round number */}
        <Route path="/race/:round" element={<RaceDetail />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App