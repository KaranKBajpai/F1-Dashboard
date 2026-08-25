// NavBar: links to the app's pages, rendered on every route
import { Link } from 'react-router-dom'

function NavBar() {
    return (
        <nav className='navbar'>
            <Link to="/" className="nav-link">Races</Link>
            <Link to="/compare" className="nav-link">Compare Drivers</Link>
        </nav>
    )
}

export default NavBar