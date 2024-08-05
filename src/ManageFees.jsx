import { useState, useEffect } from 'react';
import './ManageFees.css';
import NavBar from './NavBar';

function ManageFees() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentsWithFees = async () => {
      try {
        const response = await fetch('/api/liststudentswithfees', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'An error occurred');
          return;
        }

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError('Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsWithFees();
  }, []);

  const handleUpdateFee = async (email, fee, lastPaymentDate) => {
    try {
      const response = await fetch('/api/managefees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email, fee, lastPaymentDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
        return;
      }

      const updatedStudents = students.map(student => 
        student.email === email ? { ...student, fee, lastPaymentDate, overdue: new Date() > new Date(new Date(lastPaymentDate).setMonth(new Date(lastPaymentDate).getMonth() + 1)) } : student
      );
      setStudents(updatedStudents);
    } catch (err) {
      setError('Failed to update fee');
      console.error('Error updating fee:', err);
    }
  };

  return (
    <div className="managefees-container">
      <NavBar />
      <div className="managefees-content">
        <h2 className="managefees-heading">Manage Fees</h2>
        {loading && <div className="message loading-message">Loading...</div>}
        {error && <div className="message error-message">{error}</div>}
        {!loading && !error && (
          <table className="managefees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Fee</th>
                <th>Last Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.membershipPlan}</td>
                  <td>{student.fee}</td>
                  <td>{student.lastPaymentDate}</td>
                  <td>
                    {student.overdue ? <span className="overdue-warning">Fee Due</span> : 'Paid'}
                  </td>
                  <td>
                    <button
                      className="update-fee-button"
                      onClick={() => handleUpdateFee(student.email, student.fee, student.lastPaymentDate)}
                    >
                      Update Fee
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageFees;
