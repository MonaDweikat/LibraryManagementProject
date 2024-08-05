import { useState } from 'react';
import './LendBook.css';
import NavBar from './NavBar';

function LendBook() {
  const [bookISBN, setBookISBN] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(borrowDateObj);
    returnDateObj.setDate(borrowDateObj.getDate() + 7);
    const returnDate = returnDateObj.toISOString().split('T')[0]; 

    try {
      const response = await fetch('/api/lendbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bookISBN, borrowerName, borrowDate, returnDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
        return;
      }

      const responseData = await response.json();
      setMessage(responseData.message || 'Success');
      setBookISBN('');
      setBorrowerName('');
      setBorrowDate('');
    } catch (err) {
      setError('Failed to contact server');
      console.error('Error lending book:', err);
    }
  };

  return (
    <div className="lendbook-background-container">
      <NavBar />
      <div className="content">
        <div className="lendbook-box">
          <h2 className="title">Lend a Book</h2>
          <form className="lendbook-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bookISBN">Book ISBN</label>
              <input
                type="text"
                id="bookISBN"
                value={bookISBN}
                onChange={(e) => setBookISBN(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="borrowerName">Borrower Email</label>
              <input
                type="text"
                id="borrowerName"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="borrowDate">Date of Borrowing</label>
              <input
                type="date"
                id="borrowDate"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="lend-button">Lend Book</button>
            {message && <div className="message success-message">{message}</div>}
            {error && <div className="message error-message">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LendBook;
