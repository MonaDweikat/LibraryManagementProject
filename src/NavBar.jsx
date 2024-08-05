import { Link } from 'react-router-dom';
import './NavBar.css';
import profileIcon from './assets/user.png';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/home" className="navbar-link">Home</Link>
        <Link to="/lendbook" className="navbar-link">Lend a Book</Link>
        <Link to="/viewlentbooks" className="navbar-link">View Lent Books</Link>
        <Link to="/managefees" className="navbar-link">Manage Fees</Link>
        <Link to="/" className="navbar-link" onClick={handleLogOut}>Log Out</Link>
        <Link to="/userprofile" className="navbar-link">
          <img src={profileIcon} alt="Profile" className="navbar-profile-icon" />
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
