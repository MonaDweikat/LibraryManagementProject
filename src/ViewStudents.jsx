import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './ViewStudents.css'; 

function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/liststudents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAddStudentClick = () => {
    navigate('/addstudent');
  };

  return (
    <div className="viewstudents-container">
      <NavBar />
      <div className="viewstudents-content">
        <h1 className="viewstudents-heading">All Students</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <table className="viewstudents-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Membership Plan</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.email}>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.membership || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="viewstudents-action-button" onClick={handleAddStudentClick}>
          Add Student
        </button>
      </div>
    </div>
  );
}

export default ViewStudents;
