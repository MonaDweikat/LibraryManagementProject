import './App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || 'Login successful!');

        localStorage.setItem('token', result.token);

        navigate('/home');
      } else {
        const error = await response.text();
        setMessage(error);
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const messageClass = message.includes('Error') ? 'message error' : 'message success';

  return (
    <div className="background-container">
      <div className="content">
        <div className="box">
          <form className="form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="login-button-container">
              <button type="submit" className="login-button">Login</button>
              <Link to="/signup" className="signup-link" onClick={handleSignUp}>Do not have an account? Sign Up!</Link>
            </div>
            {message && <p className={messageClass}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
