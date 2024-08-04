import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import NavBar from './NavBar';
import homepageimage from './assets/homepageimage.jpg';

function HomePage() {
  const navigate = useNavigate();

  const goToAddBook = () => navigate('/addbook');
  const goToViewAllBooks = () => navigate('/viewbooks');
  const goToAddStudent = () => navigate('/addstudent');
  const goToViewAllStudents = () => navigate('/viewstudents');
  return (
    <div className="homepage-container">
      <NavBar />
      <div className="content">
        <img
          src={homepageimage}
          alt="Library"
          className="rounded-image"
        />
        <div className="button-container">
          <button onClick={goToAddBook} className="action-button">Add Book</button>
          <button onClick={goToViewAllBooks} className="action-button">View All Books</button>
          <button onClick={goToAddStudent} className="action-button">Add Student</button>
          <button onClick={goToViewAllStudents} className="action-button">View All Students</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
