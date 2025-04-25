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

// Route to fetch comments of a publication
app.get('/publications/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT * FROM Commentaire WHERE PostID = ? ORDER BY date_commentaire ASC';
  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      res.status(500).send('Error fetching comments');
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

// Route to create a new note for a given EcoleID
app.post('/ecoles/:ecoleId/notes', (req, res) => {
  const ecoleId = req.params.ecoleId;
  const { valeur, commentaire, AuthorID } = req.body;

  if (valeur === undefined || !AuthorID) {
    return res.status(400).send('valeur and AuthorID are required');
  }

  const query = 'INSERT INTO Note (valeur, commentaire, AuthorID, EcoleID) VALUES (?, ?, ?, ?)';
  db.query(query, [valeur, commentaire || null, AuthorID, ecoleId], (err, results) => {
    if (err) {
      console.error('Error creating note:', err);
      res.status(500).send('Error creating note');
      return;
    }
    res.status(201).json({ message: 'Note created successfully', noteId: results.insertId });
  });
});

// Route to create a new comment for a publication
app.post('/publications/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const { Contenu, UserID } = req.body;

  if (!Contenu || !UserID) {
    return res.status(400).send('Contenu and UserID are required');
  }

  const query = 'INSERT INTO Commentaire (Contenu, PostID, UserID) VALUES (?, ?, ?)';
  db.query(query, [Contenu, postId, UserID], (err, results) => {
    if (err) {
      console.error('Error creating comment:', err);
      res.status(500).send('Error creating comment');
      return;
    }
    res.status(201).json({ message: 'Comment created successfully', commentId: results.insertId });
  });
});

// Route to create a new message from sender to receiver
app.post('/users/:senderId/messages/:receiverId', (req, res) => {
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;
  const { message } = req.body;

  if (!message) {
    return res.status(400).send('message is required');
  }

  const query = 'INSERT INTO Message (message, SenderID, ReceiverID) VALUES (?, ?, ?)';
  db.query(query, [message, senderId, receiverId], (err, results) => {
    if (err) {
      console.error('Error creating message:', err);
      res.status(500).send('Error creating message');
      return;
    }
    res.status(201).json({ message: 'Message created successfully', messageId: results.insertId });
  });
});

// Route to create a new connexion between two users
app.post('/users/:userId0/connexions/:userId1', (req, res) => {
  const userId0 = req.params.userId0;
  const userId1 = req.params.userId1;

  const query = 'INSERT INTO Connexion (UserID_0, UserID_1) VALUES (?, ?)';
  db.query(query, [userId0, userId1], (err, results) => {
    if (err) {
      console.error('Error creating connexion:', err);
      res.status(500).send('Error creating connexion');
      return;
    }
    res.status(201).json({ message: 'Connexion created successfully', connexionId: results.insertId });
  });
});

// Route to fetch all notes for a given EcoleID
app.get('/ecoles/:ecoleId/notes', (req, res) => {
  const ecoleId = req.params.ecoleId;
  const query = 'SELECT * FROM Note WHERE EcoleID = ? ORDER BY noteID ASC';
  db.query(query, [ecoleId], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      res.status(500).send('Error fetching notes');
      return;
    }
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
