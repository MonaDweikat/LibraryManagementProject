import { useState } from 'react';
import NavBar from './NavBar';
import './AddBook.css';

function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [copies, setCopies] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setPublishDate(date ? formatDate(date) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !author || !isbn || !copies) {
      setResponseMessage('Please fill out all required fields.');
      setMessageType('error');
      return;
    }

    const book = {
      title,
      author,
      isbn,
      copies: parseInt(copies, 10),
      publishDate: publishDate || null
    };

    try {
      const response = await fetch('/api/addbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(book)
      });

      const result = await response.json();

      if (response.ok) {
        setResponseMessage(result.message);
        setMessageType('success');
        setTitle('');
        setAuthor('');
        setIsbn('');
        setCopies('');
        setPublishDate('');

        await incrementBookCounter(isbn);
      } else {
        console.error('Error response:', result);
        setResponseMessage(`Failed to add book: ${result.message || 'Unknown error'}`);
        setMessageType('error'); 
      }
    } catch (error) {
      console.error('Error adding book:', error); 
      setResponseMessage('Error adding book.');
      setMessageType('error');
    }
  };

  const incrementBookCounter = async (isbn) => {
    try {
      const response = await fetch('/api/incrementbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isbn })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.message);
      } else {
        console.error('Error response:', result);
      }
    } catch (error) {
      console.error('Error incrementing book counter:', error);
    }
  };

  return (
    <div className="book-background-container">
      <div className="content">
        <NavBar />
        <div className="add-book-box">
          <h1 className="title">Add a New Book</h1>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author:</label>
              <input 
                type="text" 
                id="author" 
                name="author" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="isbn">ISBN:</label>
              <input 
                type="text" 
                id="isbn" 
                name="isbn" 
                value={isbn} 
                onChange={(e) => setIsbn(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="copies">Number of Copies:</label>
              <input 
                type="number" 
                id="copies" 
                name="copies" 
                value={copies} 
                onChange={(e) => setCopies(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="publish-date">Publish Date (optional):</label>
              <input 
                type="date" 
                id="publish-date" 
                name="publish-date" 
                onChange={handleDateChange} 
                value={publishDate ? publishDate.split('/').reverse().join('-') : ''} 
              />
              {publishDate && <p>Formatted Date: {publishDate}</p>}
            </div>
            <button type="submit">Add Book</button>
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

export default AddBook;
