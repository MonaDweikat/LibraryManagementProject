import { useState } from 'react';
import NavBar from './NavBar';
import './AddStudent.css';

function AddStudent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [membershipPlan, setMembershipPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const membershipPlans = ['Basic', 'Standard', 'Premium'];
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

  const planFees = {
    Basic: 10,
    Standard: 20,
    Premium: 30
  };

  const isValidEmailDomain = (email) => {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName || !lastName || !email || !membershipPlan || !startDate) {
      setResponseMessage('Please fill out all required fields.');
      setMessageType('error');
      return;
    }

    if (!isValidEmailDomain(email)) {
      setResponseMessage('Please enter an email address with a valid domain (e.g., gmail.com, yahoo.com).');
      setMessageType('error');
      return;
    }

    const student = {
      firstName,
      lastName,
      email,
      membershipPlan,
      startDate,
      fee: planFees[membershipPlan]
    };

    try {
      const response = await fetch('/api/addstudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(student)
      });

      const result = await response.json();

      if (response.ok) {
        setResponseMessage(result.message);
        setMessageType('success');
        setFirstName('');
        setLastName('');
        setEmail('');
        setMembershipPlan('');
        setStartDate('');
      } else {
        setResponseMessage(`Failed to add student: ${result.message || 'Unknown error'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setResponseMessage('Error adding student.');
      setMessageType('error');
    }
  };

  return (
    <div className="student-background-container">
      <div className="content">
        <NavBar />
        <div className="add-student-box">
          <h1 className="title">Add a New Student</h1>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
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
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@gmail.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="membershipPlan">Membership Plan:</label>
              <select
                id="membershipPlan"
                name="membershipPlan"
                value={membershipPlan}
                onChange={(e) => setMembershipPlan(e.target.value)}
                required
              >
                <option value="">Select a plan</option>
                {membershipPlans.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Membership Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <button type="submit">Add Student</button>
            {responseMessage && (
              <p className={messageType === 'success' ? 'success-message' : 'error-message'}>
                {responseMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
