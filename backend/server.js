const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // Add this line
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

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

// --- Utilisateur ---
// Create user
app.post('/users', async (req, res) => {
  const { Nom, Password, Email, Statut } = req.body;
  if (
    typeof Nom !== 'string' || !Nom.trim() ||
    typeof Password !== 'string' || !Password.trim() ||
    typeof Email !== 'string' || !Email.trim() ||
    typeof Statut !== 'string' || !Statut.trim()
  ) {
    return res.status(400).send('Nom, Password, Email, and Statut are required and must be non-empty strings');
  }
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const query = 'INSERT INTO Utilisateur (Nom, Password, Email, Statut) VALUES (?, ?, ?, ?)';
    db.query(query, [Nom, hashedPassword, Email, Statut], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send('Email already exists');
        }
        console.error('Error creating user:', err);
        return res.status(500).send('Error creating user');
      }
      res.status(201).json({ message: 'User created successfully', userId: results.insertId });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).send('Error creating user');
  }
});

// User login route
app.post('/login', (req, res) => {
  const { Email, Password } = req.body;
  if (typeof Email !== 'string' || !Email.trim() || typeof Password !== 'string' || !Password.trim()) {
    return res.status(400).send('Email and Password are required');
  }
  const query = 'SELECT * FROM Utilisateur WHERE Email = ?';
  db.query(query, [Email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }
    if (results.length === 0) {
      return res.status(401).send('Invalid credentials');
    }
    const user = results[0];
    const match = await bcrypt.compare(Password, user.Password);
    if (!match) {
      return res.status(401).send('Invalid credentials');
    }
    delete user.Password;
    res.json({ message: 'Login successful', user });
  });
});

// Get, update, delete user
// (Add GET /users/:userId if needed)
app.get('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  const query = 'SELECT UserID, Nom, Email, Statut FROM Utilisateur WHERE UserID = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(results[0]);
  });
});

app.put('/users/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { Nom, Password, Email, Statut } = req.body;
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  if (
    typeof Nom !== 'string' || !Nom.trim() ||
    typeof Password !== 'string' || !Password.trim() ||
    typeof Email !== 'string' || !Email.trim() ||
    typeof Statut !== 'string' || !Statut.trim()
  ) {
    return res.status(400).send('Nom, Password, Email, and Statut are required and must be non-empty strings');
  }
  try {
    let hashedPassword = Password;
    if (Password) {
      hashedPassword = await bcrypt.hash(Password, 10);
    }
    const query = 'UPDATE Utilisateur SET Nom = ?, Password = ?, Email = ?, Statut = ? WHERE UserID = ?';
    db.query(query, [Nom, hashedPassword, Email, Statut, userId], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send('Email already exists');
        }
        console.error('Error updating user:', err);
        return res.status(500).send('Error updating user');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
      res.json({ message: 'User updated successfully' });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).send('Error updating user');
  }
});

app.delete('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  db.query('DELETE FROM Utilisateur WHERE UserID = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send('Error deleting user');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('User not found');
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// --- Publication ---
// Create publication
app.post('/publications', (req, res) => {
  const { Titre, Contenu, UserID } = req.body;
  if (
    typeof Titre !== 'string' || !Titre.trim() ||
    typeof Contenu !== 'string' || !Contenu.trim() ||
    !Number.isInteger(UserID) || UserID < 1
  ) {
    return res.status(400).send('Titre, Contenu, and valid UserID are required');
  }
  const query = 'INSERT INTO Publication (Titre, Contenu, UserID) VALUES (?, ?, ?)';
  db.query(query, [Titre, Contenu, UserID], (err, results) => {
    if (err) {
      console.error('Error creating publication:', err);
      return res.status(500).send('Error creating publication');
    }
    res.status(201).json({ message: 'Publication created successfully', publicationId: results.insertId });
  });
});
// Get all publications
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
// Get publications by user
app.get('/publications/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
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
// Update, delete publication
app.put('/publications/:postId', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const { Titre, Contenu } = req.body;
  if (!postId || postId < 1) {
    return res.status(400).send('Invalid postId');
  }
  if (typeof Titre !== 'string' || !Titre.trim() || typeof Contenu !== 'string' || !Contenu.trim()) {
    return res.status(400).send('Titre and Contenu are required');
  }
  const query = 'UPDATE Publication SET Titre = ?, Contenu = ? WHERE PostID = ?';
  db.query(query, [Titre, Contenu, postId], (err, results) => {
    if (err) {
      console.error('Error updating publication:', err);
      return res.status(500).send('Error updating publication');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Publication not found');
    }
    res.json({ message: 'Publication updated successfully' });
  });
});
app.delete('/publications/:postId', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (!postId || postId < 1) {
    return res.status(400).send('Invalid postId');
  }
  db.query('DELETE FROM Publication WHERE PostID = ?', [postId], (err, results) => {
    if (err) {
      console.error('Error deleting publication:', err);
      return res.status(500).send('Error deleting publication');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Publication not found');
    }
    res.json({ message: 'Publication deleted successfully' });
  });
});

// --- Commentaire ---
// Create comment for a publication
app.post('/publications/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const { Contenu, UserID } = req.body;
  if (!postId || postId < 1) {
    return res.status(400).send('Invalid postId');
  }
  if (typeof Contenu !== 'string' || !Contenu.trim() || !Number.isInteger(UserID) || UserID < 1) {
    return res.status(400).send('Contenu and valid UserID are required');
  }
  const query = 'INSERT INTO Commentaire (Contenu, PostID, UserID) VALUES (?, ?, ?)';
  db.query(query, [Contenu, postId, UserID], (err, results) => {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).send('Error creating comment');
    }
    res.status(201).json({ message: 'Comment created successfully', commentId: results.insertId });
  });
});
// Get comments for a publication
app.get('/publications/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (!postId || postId < 1) {
    return res.status(400).send('Invalid postId');
  }
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
// Update, delete comment
app.put('/commentaires/:commentaireId', (req, res) => {
  const commentaireId = parseInt(req.params.commentaireId, 10);
  const { Contenu } = req.body;
  if (!commentaireId || commentaireId < 1) {
    return res.status(400).send('Invalid commentaireId');
  }
  if (typeof Contenu !== 'string' || !Contenu.trim()) {
    return res.status(400).send('Contenu is required');
  }
  const query = 'UPDATE Commentaire SET Contenu = ? WHERE CommentaireID = ?';
  db.query(query, [Contenu, commentaireId], (err, results) => {
    if (err) {
      console.error('Error updating comment:', err);
      return res.status(500).send('Error updating comment');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Comment not found');
    }
    res.json({ message: 'Comment updated successfully' });
  });
});
app.delete('/commentaires/:commentaireId', (req, res) => {
  const commentaireId = parseInt(req.params.commentaireId, 10);
  if (!commentaireId || commentaireId < 1) {
    return res.status(400).send('Invalid commentaireId');
  }
  db.query('DELETE FROM Commentaire WHERE CommentaireID = ?', [commentaireId], (err, results) => {
    if (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).send('Error deleting comment');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Comment not found');
    }
    res.json({ message: 'Comment deleted successfully' });
  });
});

// --- Note ---
// Create note for a given EcoleID
app.post('/ecoles/:ecoleId/notes', (req, res) => {
  const ecoleId = parseInt(req.params.ecoleId, 10);
  const { valeur, commentaire, AuthorID } = req.body;
  if (!ecoleId || ecoleId < 1) {
    return res.status(400).send('Invalid ecoleId');
  }
  if (!Number.isInteger(valeur) || !Number.isInteger(AuthorID) || AuthorID < 1) {
    return res.status(400).send('valeur and valid AuthorID are required');
  }
  const query = 'INSERT INTO Note (valeur, commentaire, AuthorID, EcoleID) VALUES (?, ?, ?, ?)';
  db.query(query, [valeur, commentaire || null, AuthorID, ecoleId], (err, results) => {
    if (err) {
      console.error('Error creating note:', err);
      return res.status(500).send('Error creating note');
    }
    res.status(201).json({ message: 'Note created successfully', noteId: results.insertId });
  });
});
// Get all notes for a given EcoleID
app.get('/ecoles/:ecoleId/notes', (req, res) => {
  const ecoleId = parseInt(req.params.ecoleId, 10);
  if (!ecoleId || ecoleId < 1) {
    return res.status(400).send('Invalid ecoleId');
  }
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
// Delete note
app.delete('/notes/:noteId', (req, res) => {
  const noteId = parseInt(req.params.noteId, 10);
  if (!noteId || noteId < 1) {
    return res.status(400).send('Invalid noteId');
  }
  db.query('DELETE FROM Note WHERE noteID = ?', [noteId], (err, results) => {
    if (err) {
      console.error('Error deleting note:', err);
      return res.status(500).send('Error deleting note');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Note not found');
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

// --- Message ---
// Create message from sender to receiver
app.post('/users/:senderId/messages/:receiverId', (req, res) => {
  const senderId = parseInt(req.params.senderId, 10);
  const receiverId = parseInt(req.params.receiverId, 10);
  const { message } = req.body;
  if (!senderId || senderId < 1 || !receiverId || receiverId < 1) {
    return res.status(400).send('Invalid senderId or receiverId');
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).send('message is required');
  }
  const query = 'INSERT INTO Message (message, SenderID, ReceiverID) VALUES (?, ?, ?)';
  db.query(query, [message, senderId, receiverId], (err, results) => {
    if (err) {
      console.error('Error creating message:', err);
      return res.status(500).send('Error creating message');
    }
    res.status(201).json({ message: 'Message created successfully', messageId: results.insertId });
  });
});
// Get all messages between two users
app.get('/users/:userId1/messages/:userId2', (req, res) => {
  const userId1 = parseInt(req.params.userId1, 10);
  const userId2 = parseInt(req.params.userId2, 10);
  if (!userId1 || userId1 < 1 || !userId2 || userId2 < 1) {
    return res.status(400).send('Invalid userId(s)');
  }
  const query = `
    SELECT * FROM Message
    WHERE (SenderID = ? AND ReceiverID = ?)
       OR (SenderID = ? AND ReceiverID = ?)
    ORDER BY date_message ASC
  `;
  db.query(query, [userId1, userId2, userId2, userId1], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).send('Error fetching messages');
      return;
    }
    res.json(results);
  });
});
// Update, delete message
app.put('/messages/:messageId', (req, res) => {
  const messageId = parseInt(req.params.messageId, 10);
  const { message } = req.body;
  if (!messageId || messageId < 1) {
    return res.status(400).send('Invalid messageId');
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).send('message is required');
  }
  const query = 'UPDATE Message SET message = ? WHERE messageID = ?';
  db.query(query, [message, messageId], (err, results) => {
    if (err) {
      console.error('Error updating message:', err);
      return res.status(500).send('Error updating message');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Message not found');
    }
    res.json({ message: 'Message updated successfully' });
  });
});
app.delete('/messages/:messageId', (req, res) => {
  const messageId = parseInt(req.params.messageId, 10);
  if (!messageId || messageId < 1) {
    return res.status(400).send('Invalid messageId');
  }
  db.query('DELETE FROM Message WHERE messageID = ?', [messageId], (err, results) => {
    if (err) {
      console.error('Error deleting message:', err);
      return res.status(500).send('Error deleting message');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Message not found');
    }
    res.json({ message: 'Message deleted successfully' });
  });
});

// --- Connexion ---
// Create connexion between two users
app.post('/users/:userId0/connexions/:userId1', (req, res) => {
  const userId0 = parseInt(req.params.userId0, 10);
  const userId1 = parseInt(req.params.userId1, 10);
  if (!userId0 || userId0 < 1 || !userId1 || userId1 < 1) {
    return res.status(400).send('Invalid userId(s)');
  }
  const query = 'INSERT INTO Connexion (UserID_0, UserID_1) VALUES (?, ?)';
  db.query(query, [userId0, userId1], (err, results) => {
    if (err) {
      console.error('Error creating connexion:', err);
      return res.status(500).send('Error creating connexion');
    }
    res.status(201).json({ message: 'Connexion created successfully', connexionId: results.insertId });
  });
});
// Delete connexion
app.delete('/connexions/:connexionId', (req, res) => {
  const connexionId = parseInt(req.params.connexionId, 10);
  if (!connexionId || connexionId < 1) {
    return res.status(400).send('Invalid connexionId');
  }
  db.query('DELETE FROM Connexion WHERE ConnexionID = ?', [connexionId], (err, results) => {
    if (err) {
      console.error('Error deleting connexion:', err);
      return res.status(500).send('Error deleting connexion');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Connexion not found');
    }
    res.json({ message: 'Connexion deleted successfully' });
  });
});

// --- Root ---
app.get('/', (req, res) => {
  res.send('Welcome to MatchYourPath API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
