import { Link } from 'react-router-dom';
import './NavBar.css';
import profileIcon from './assets/user.png';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
      <Link to="/home" className="navbar-link">Home</Link>
        <Link to="/" className="navbar-link">Log Out</Link>
        <Link to="/userprofile" className="navbar-link">
          <img src={profileIcon} alt="Profile" className="navbar-profile-icon" />
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
