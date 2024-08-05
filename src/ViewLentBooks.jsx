import { useState, useEffect } from 'react';
import './ViewLentBooks.css';
import NavBar from './NavBar';

function ViewLentBooks() {
  const [lentBooks, setLentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLentBooks = async () => {
      try {
        const response = await fetch('/api/viewlentbooks', {
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
        setLentBooks(data);
      } catch (err) {
        setError('Failed to fetch lent books');
        console.error('Error fetching lent books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLentBooks();
  }, []);

  const handleReturnBook = async (bookISBN, borrowerName) => {
    try {
      const response = await fetch('/api/returnbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bookISBN, borrowerName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
        return;
      }

      setLentBooks(lentBooks.filter(book => !(book.bookISBN === bookISBN && book.borrowerName === borrowerName)));
    } catch (err) {
      setError('Failed to return book');
      console.error('Error returning book:', err);
    }
  };

  const calculateExpectedReturnDate = (borrowDate) => {
    const borrowDateObj = new Date(borrowDate);
    borrowDateObj.setDate(borrowDateObj.getDate() + 7);
    return borrowDateObj.toISOString().split('T')[0];
  };

  const getActualReturnDate = (expectedReturnDate, returnDate) => {
    if (returnDate) {
      return new Date(returnDate).toISOString().split('T')[0];
    }
    const today = new Date().toISOString().split('T')[0];
    return today > expectedReturnDate ? 'Overdue' : 'Borrowed';
  };

  return (
    <div className="viewlentbooks-container">
      <NavBar />
      <div className="viewlentbooks-content">
        <h2 className="viewlentbooks-heading">Lent Books</h2>
        {loading && <div className="message loading-message">Loading...</div>}
        {error && <div className="message error-message">{error}</div>}
        {!loading && !error && (
          <table className="viewlentbooks-table">
            <thead>
              <tr>
                <th>Book ISBN</th>
                <th>Borrower Name</th>
                <th>Borrow Date</th>
                <th>Expected Return Date</th>
                <th>Actual Return Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lentBooks.map((book, index) => (
                <tr key={index}>
                  <td>{book.bookISBN}</td>
                  <td>{book.borrowerName}</td>
                  <td>{book.borrowDate}</td>
                  <td>{calculateExpectedReturnDate(book.borrowDate)}</td>
                  <td>{getActualReturnDate(calculateExpectedReturnDate(book.borrowDate), book.returnDate)}</td>
                  <td>
                    {book.returnDate ? (
                      'Returned'
                    ) : (
                      <button
                        className="viewbooks-action-button"
                        onClick={() => handleReturnBook(book.bookISBN, book.borrowerName)}
                      >
                        Return Book
                      </button>
                    )}
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

export default ViewLentBooks;
