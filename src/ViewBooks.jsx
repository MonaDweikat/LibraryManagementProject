import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './ViewBooks.css'; 

function ViewBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/listbooks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleAddBookClick = () => {
    navigate('/addbook');
  };

  return (
    <div className="viewbooks-container">
      <NavBar />
      <div className="viewbooks-content">
        <h1 className="viewbooks-heading">All Books</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <table className="viewbooks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Publish Date</th>
                <th>Copies</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.isbn}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.publishDate || 'N/A'}</td>
                  <td>{book.counter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="viewbooks-action-button" onClick={handleAddBookClick}>
          Add Book
        </button>
      </div>
    </div>
  );
}

export default ViewBooks;
