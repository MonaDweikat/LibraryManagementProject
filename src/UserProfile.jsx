import { useState, useEffect } from 'react';
import NavBar from './NavBar';
import './UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [editingField, setEditingField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
  const namePattern = /^[a-zA-Z]+$/;
  const usernamePattern = /^[^.]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/userprofile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            password: '',
          });
        } else {
          const errorMessage = await response.text();
          setError(errorMessage);
        }
      } catch (error) {
        setError('Error fetching user profile');
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    if (formData.email && !emailPattern.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.firstName && !namePattern.test(formData.firstName)) {
      setError('Invalid first name format');
      return false;
    }
    if (formData.lastName && !namePattern.test(formData.lastName)) {
      setError('Invalid last name format');
      return false;
    }
    if (formData.username && !usernamePattern.test(formData.username)) {
      setError('Invalid username format');
      return false;
    }
    if (formData.password && !passwordPattern.test(formData.password)) {
      setError('Invalid password format');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/updateprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setError(null);
        setEditingField(null);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      setError('Error updating profile');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEditClick = (field) => {
    setEditingField(field);
  };

  return (
    <div className="userprofile-container">
      <NavBar />
      
      {user ? (
        <form className="user-info-form" onSubmit={handleSubmit}>
          <h1 className="heading">User Profile</h1>
          <div className="userprofile-content">
            <div className="userprofile-field">
              <strong>First Name:</strong>
              {editingField === 'firstName' ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.firstName}</span>
              )}
              {editingField !== 'firstName' && (
                <button type="button" onClick={() => handleEditClick('firstName')}>Change</button>
              )}
            </div>
            <div className="userprofile-field">
              <strong>Last Name:</strong>
              {editingField === 'lastName' ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.lastName}</span>
              )}
              {editingField !== 'lastName' && (
                <button type="button" onClick={() => handleEditClick('lastName')}>Change</button>
              )}
            </div>
            <div className="userprofile-field">
              <strong>Username:</strong>
              {editingField === 'username' ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.username}</span>
              )}
              {editingField !== 'username' && (
                <button type="button" onClick={() => handleEditClick('username')}>Change</button>
              )}
            </div>
            <div className="userprofile-field">
              <strong>Email:</strong>
              {editingField === 'email' ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.email}</span>
              )}
              {editingField !== 'email' && (
                <button type="button" onClick={() => handleEditClick('email')}>Change</button>
              )}
            </div>
            <div className="userprofile-field">
              <strong>Password:</strong>
              {editingField === 'password' ? (
                <>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </>
              ) : (
                <span>********</span>
              )}
              {editingField !== 'password' && (
                <button type="button" onClick={() => handleEditClick('password')}>Change</button>
              )}
            </div>
            {editingField && (
            <button type="submit" className="update-profile-button">Update Profile</button>
          )}
          {error && <p className="error-message">{error}</p>}
          </div>
          
        </form>
      ) : (
        <p>Loading...</p>
      )}
      
    </div>
  );
}

export default UserProfile;
