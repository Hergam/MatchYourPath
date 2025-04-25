const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to MatchYourPath API');
});

// Route to get all publications
app.get('/publications', (req, res) => {
  const query = 'SELECT * FROM Publication';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching publications:', err);
      res.status(500).send('Error fetching publications');
      return;
    }
    res.json(results);
  });
});

// Route to get publications by a specific user
app.get('/publications/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM Publication WHERE UserID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user publications:', err);
      res.status(500).send('Error fetching user publications');
      return;
    }
    res.json(results);
  });
});

// Route to create a new publication
app.post('/publications', (req, res) => {
  const { Titre, Contenu, UserID } = req.body;

  if (!Titre || !Contenu || !UserID) {
    return res.status(400).send('Titre, Contenu, and UserID are required');
  }

  const query = 'INSERT INTO Publication (Titre, Contenu, UserID) VALUES (?, ?, ?)';
  db.query(query, [Titre, Contenu, UserID], (err, results) => {
    if (err) {
      console.error('Error creating publication:', err);
      res.status(500).send('Error creating publication');
      return;
    }
    res.status(201).json({ message: 'Publication created successfully', publicationId: results.insertId });
  });
});

// Route to create a new user
app.post('/users', (req, res) => {
  const { Nom, Password, Email, Statut } = req.body;

  if (!Nom || !Password || !Email || !Statut) {
    return res.status(400).send('Nom, Password, Email, and Statut are required');
  }

  const query = 'INSERT INTO Utilisateur (Nom, Password, Email, Statut) VALUES (?, ?, ?, ?)';
  db.query(query, [Nom, Password, Email, Statut], (err, results) => {
    if (err) {
      console.error('Error creating user:', err);
      res.status(500).send('Error creating user');
      return;
    }
    res.status(201).json({ message: 'User created successfully', userId: results.insertId });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
