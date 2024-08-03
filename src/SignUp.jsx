import './SignUp.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
  const namePattern = /^[a-zA-Z]+$/;
  const usernamePattern = /^[^.]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!namePattern.test(firstName) || !namePattern.test(lastName)) {
      setMessage('First and last names must contain only letters.');
      setIsSuccess(false);
      return;
    }

    if (!usernamePattern.test(username)) {
      setMessage('Username should not include periods.');
      setIsSuccess(false);
      return;
    }

    if (!emailPattern.test(email)) {
      setMessage('Please use a valid email address with one of the following domains: gmail.com, yahoo.com, outlook.com, hotmail.com');
      setIsSuccess(false);
      return;
    }

    if (!passwordPattern.test(password)) {
      setMessage('Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.');
      setIsSuccess(false);
      return;
    }

    console.log('Submitting sign up request...');

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, username, email, password }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Result:', result);
      setMessage(result.message || 'Sign up successful!');
      setIsSuccess(true);
      navigate('/home');
    } else {
      const error = await response.text();
      console.log('Server responded with error:', error);
      setMessage(error);
      setIsSuccess(false);
    }
  };

  return (
    <div className="background-container">
      <div className="content">
        <div className="SignUpbox">
          <form className="form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
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
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
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
            <div className="button-container">
              <button style={{ backgroundColor: '#758467' }} type="submit">Sign Up</button>
            </div>
            {message && (
              <p className={`message ${isSuccess ? 'success-message' : 'error-message'}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
