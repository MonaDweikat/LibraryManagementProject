import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const JWT_SECRET = '123';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Forbidden');
    }
    req.user = user;
    next();
  });
};

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const db = client.db('LibraryDB');
    const librariansCollection = db.collection('librarians');
    const booksCollection = db.collection('books');
    const studentsCollection = db.collection('students');

    // Login endpoint
    app.post('/api/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        const librarian = await librariansCollection.findOne({ username });
        
        if (librarian && bcrypt.compareSync(password, librarian.password)) {
          const token = jwt.sign({ id: librarian._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
          res.json({ message: 'Login successful', token });
        } else {
          res.status(401).send('Invalid username or password');
        }
      } catch (err) {
        console.error('Error processing login:', err);
        res.status(500).send('Error processing login');
      }
    });

    // Signup endpoint
    app.post('/api/signup', async (req, res) => {
      try {
        const { firstName, lastName, username, email, password } = req.body;

        const existingUser = await librariansCollection.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
          if (existingUser.username === username) {
            return res.status(400).send('Username already taken.');
          }
          if (existingUser.email === email) {
            return res.status(400).send('Email already registered.');
          }
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const result = await librariansCollection.insertOne({ firstName, lastName, username, email, password: hashedPassword });

        console.log('User inserted with id:', result.insertedId);

        res.json({ message: 'Sign up successful!' });
      } catch (err) {
        console.error('Error processing signup:', err);
        res.status(500).send('Error processing signup');
      }
    });

    // User profile endpoint
    app.get('/api/userprofile', authenticate, async (req, res) => {
      try {
        const librarian = await librariansCollection.findOne({ _id: new ObjectId(req.user.id) });

        if (librarian) {
          res.json({
            firstName: librarian.firstName,
            lastName: librarian.lastName,
            username: librarian.username,
            email: librarian.email
          });
        } else {
          res.status(404).send('User not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
      }
    });

    // Update user profile endpoint
    app.post('/api/updateprofile', authenticate, async (req, res) => {
      const { firstName, lastName, username, email, password } = req.body;

      const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;
      const namePattern = /^[a-zA-Z]+$/;
      const usernamePattern = /^[^.]+$/;
      const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      try {
        const updates = {};
        if (email && emailPattern.test(email)) updates.email = email;
        if (firstName && namePattern.test(firstName)) updates.firstName = firstName;
        if (lastName && namePattern.test(lastName)) updates.lastName = lastName;
        if (username && usernamePattern.test(username)) updates.username = username;
        if (password && passwordPattern.test(password)) {
          updates.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
          return res.status(400).send('No valid fields to update');
        }

        const conflictingUser = await librariansCollection.findOne({
          $and: [
            { _id: { $ne: new ObjectId(req.user.id) } },
            { $or: [{ username }, { email }] }
          ]
        });

        if (conflictingUser) {
          if (conflictingUser.username === username) {
            return res.status(400).send('Username already taken.');
          }
          if (conflictingUser.email === email) {
            return res.status(400).send('Email already registered.');
          }
        }

        const result = await librariansCollection.updateOne({ _id: new ObjectId(req.user.id) }, { $set: updates });

        if (result.modifiedCount > 0) {
          const updatedUser = await librariansCollection.findOne({ _id: new ObjectId(req.user.id) });
          res.json(updatedUser);
        } else {
          res.status(404).send('User not found');
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).send('Error updating profile');
      }
    });

    // Adding book endpoint
    app.post('/api/addbook', authenticate, async (req, res) => {
      try {
        const { title, author, isbn, publishDate, copies } = req.body;

        console.log('Received request to add book with:', { title, author, isbn, publishDate, copies });

        if (!title || !author || !isbn || !copies) {
          console.log('Validation failed: Missing required fields');
          return res.status(400).json({ message: 'Title, author, ISBN, and number of copies are required.' });
        }

        const existingBook = await booksCollection.findOne({ isbn });

        if (existingBook) {
          await booksCollection.updateOne(
            { isbn },
            {
              $set: { title, author, publishDate: publishDate || null },
              $inc: { counter: copies }
            }
          );
          res.status(200).json({ message: 'Book updated successfully' });
        } else {
          await booksCollection.insertOne({
            title,
            author,
            isbn,
            publishDate: publishDate || null,
            counter: copies 
          });
          res.status(201).json({ message: 'Book added successfully' });
        }
      } catch (err) {
        console.error('Error adding book:', err.message);
        res.status(500).send(`Error adding book: ${err.message}`);
      }
    });

    // Increment book counter endpoint
    app.post('/api/incrementbook', authenticate, async (req, res) => {
      try {
        const { isbn, copies } = req.body;

        if (!isbn || !copies) {
          return res.status(400).json({ message: 'ISBN and number of copies are required.' });
        }

        const result = await booksCollection.updateOne(
          { isbn },
          { $inc: { counter: copies } }
        );

        if (result.modifiedCount > 0) {
          res.json({ message: 'Book counter incremented successfully' });
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      } catch (err) {
        console.error('Error incrementing book counter:', err.message);
        res.status(500).send(`Error incrementing book counter: ${err.message}`);
      }
    });
    // List all books endpoint
    app.get('/api/listbooks', authenticate, async (req, res) => {
      try {
        const books = await booksCollection.find().toArray();
        res.json(books);
      } catch (err) {
        console.error('Error listing books:', err.message);
        res.status(500).send(`Error listing books: ${err.message}`);
      }
    });

      // Add student endpoint
    app.post('/api/addstudent', authenticate, async (req, res) => {
      try {
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);

        const { firstName, lastName, email, membershipPlan } = req.body;

        const validMemberships = ['Basic', 'Standard', 'Premium'];

        if (!firstName || !lastName || !email || !membershipPlan) {
          console.log('Validation failed: Missing required fields');
          return res.status(400).json({ message: 'All fields (firstName, lastName, email, membershipPlan) are required.' });
        }

        if (!validMemberships.includes(membershipPlan)) {
          console.log('Validation failed: Invalid membership choice');
          return res.status(400).json({ message: 'Invalid membership choice.' });
        }

        const existingStudent = await studentsCollection.findOne({ email });

        if (existingStudent) {
          return res.status(400).json({ message: 'Student with this email already exists.' });
        }

        const result = await studentsCollection.insertOne({
          firstName,
          lastName,
          email,
          membership: membershipPlan
        });

        console.log('Student inserted with id:', result.insertedId);

        res.status(201).json({ message: 'Student added successfully!' });
      } catch (err) {
        console.error('Error adding student:', err.message);
        res.status(500).send(`Error adding student: ${err.message}`);
      }
    });

    // List all students endpoint
    app.get('/api/liststudents', authenticate, async (req, res) => {
      try {
        const students = await studentsCollection.find().toArray();
        res.json(students);
      } catch (err) {
        console.error('Error listing students:', err.message);
        res.status(500).send(`Error listing students: ${err.message}`);
      }
    });
    // Serve the home page
    app.get('/api/homepage', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
