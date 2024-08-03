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
