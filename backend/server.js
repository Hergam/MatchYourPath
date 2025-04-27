const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { jsonParser, isAdmin } = require('./middleware'); // <-- import middleware
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(jsonParser); // <-- use imported middleware

// Serve static files from uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name for uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Upload image endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  // Return the URL to access the uploaded image
  res.json({ url: `/uploads/${req.file.filename}` });
});

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
      return res.status(401).send('Invalid credentials (email not found)');
    }
    const user = results[0];
    // --- FIX: Remove trailing spaces for CHAR(64) hashes (MySQL pads CHAR with spaces) ---
    let passwordHash = user.Password;
    if (Buffer.isBuffer(passwordHash)) {
      passwordHash = passwordHash.toString('utf8');
    }
    passwordHash = passwordHash.trim(); // Remove trailing spaces

    // Defensive: check for empty hash (should never happen)
    if (!passwordHash) {
      return res.status(401).send('Invalid credentials (no password set)');
    }

    try {
      const match = await bcrypt.compare(Password, passwordHash);
      if (!match) {
        return res.status(401).send('Invalid credentials');
      }
      delete user.Password;
      res.json({ message: 'Login successful', user });
    } catch (err2) {
      console.error('Error comparing password:', err2);
      return res.status(500).send('Error checking password');
    }
  });
});

// Get, update, delete user
// (Add GET /users/:userId if needed)
app.get('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  // Include ProfileImagePath in the select
  const query = 'SELECT UserID, Nom, Email, Statut, Biographie, ProfileImagePath FROM Utilisateur WHERE UserID = ?';
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
  const { Nom, Password, Email, Statut, Biographie, ProfileImagePath, BannerImagePath } = req.body;
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  if (
    typeof Nom !== 'string' || !Nom.trim() ||
    typeof Email !== 'string' || !Email.trim() ||
    typeof Statut !== 'string' || !Statut.trim()
  ) {
    return res.status(400).send('Nom, Email, and Statut are required and must be non-empty strings');
  }
  try {
    let query, params;
    const fields = ['Nom = ?', 'Email = ?', 'Statut = ?'];
    params = [Nom, Email, Statut];
    if (typeof Biographie === 'string') {
      fields.push('Biographie = ?');
      params.push(Biographie);
    }
    if (typeof ProfileImagePath === 'string') {
      fields.push('ProfileImagePath = ?');
      params.push(ProfileImagePath);
    }
    if (typeof BannerImagePath === 'string') {
      fields.push('BannerImagePath = ?');
      params.push(BannerImagePath);
    }
    if (typeof Password === 'string' && Password.trim() && Password !== 'dummy') {
      const hashedPassword = await bcrypt.hash(Password, 10);
      fields.push('Password = ?');
      params.push(hashedPassword);
    }
    query = `UPDATE Utilisateur SET ${fields.join(', ')} WHERE UserID = ?`;
    params.push(userId);

    db.query(query, params, (err, results) => {
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
  const query = `
    SELECT p.*, u.Nom, u.ProfileImagePath
    FROM Publication p
    LEFT JOIN Utilisateur u ON p.UserID = u.UserID
    ORDER BY p.date_post DESC
  `;
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
  // Check if user already rated this school
  const checkQuery = 'SELECT noteID FROM Note WHERE AuthorID = ? AND EcoleID = ?';
  db.query(checkQuery, [AuthorID, ecoleId], (err, results) => {
    if (err) {
      console.error('Error checking note:', err);
      return res.status(500).send('Error checking note');
    }
    if (results.length > 0) {
      return res.status(409).send('Vous avez déjà donné un avis pour cette école.');
    }
    const query = 'INSERT INTO Note (valeur, commentaire, AuthorID, EcoleID) VALUES (?, ?, ?, ?)';
    db.query(query, [valeur, commentaire || null, AuthorID, ecoleId], (err2, results2) => {
      if (err2) {
        console.error('Error creating note:', err2);
        return res.status(500).send('Error creating note');
      }
      res.status(201).json({ message: 'Note created successfully', noteId: results2.insertId });
    });
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

// Get all connections for a user (with other user's info)
app.get('/users/:userId/connections', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  // Also fetch ProfileImagePath
  const query = `
    SELECT c.ConnexionID, u.UserID, u.Nom, u.Email, u.ProfileImagePath
    FROM Connexion c
    JOIN Utilisateur u ON (u.UserID = IF(c.UserID_0 = ?, c.UserID_1, c.UserID_0))
    WHERE c.UserID_0 = ? OR c.UserID_1 = ?
    ORDER BY c.date_connexion DESC
  `;
  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching connections:', err);
      return res.status(500).send('Error fetching connections');
    }
    res.json(results);
  });
});

// Get user by email (for connection creation)
app.get('/users-by-email/:email', (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).send('Email required');
  }
  const query = 'SELECT UserID, Nom, Email FROM Utilisateur WHERE Email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user by email:', err);
      return res.status(500).send('Error fetching user');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(results[0]);
  });
});

// Example public route: Get all users (was /admin/users, now /users)
app.get('/users', (req, res) => {
  // Include ProfileImagePath in the select
  db.query('SELECT UserID, Nom, Email, Statut, ProfileImagePath FROM Utilisateur', (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }
    res.json(results);
  });
});

// --- ConnectionRequest ---
// Table: ConnectionRequest (RequestID, SenderID, ReceiverID, status, date_request)
// status: 'pending', 'accepted', 'rejected'

// Envoyer une demande de connexion
app.post('/connection-requests', (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!Number.isInteger(senderId) || !Number.isInteger(receiverId) || senderId < 1 || receiverId < 1 || senderId === receiverId) {
    return res.status(400).send('Invalid senderId or receiverId');
  }

  // Vérifie si une demande existe déjà
  const checkRequest = `
    SELECT 1 FROM ConnectionRequest 
    WHERE ((SenderID = ? AND ReceiverID = ?) OR (SenderID = ? AND ReceiverID = ?))
      AND status = 'pending'
    LIMIT 1
  `;
  db.query(checkRequest, [senderId, receiverId, receiverId, senderId], (err, reqResults) => {
    if (err) return res.status(500).send('Error checking existing requests');
    if (reqResults.length > 0) return res.status(409).send('Request already exists');

    // Vérifie si déjà connectés
    const checkConn = `
      SELECT 1 FROM Connexion 
      WHERE (UserID_0 = ? AND UserID_1 = ?) OR (UserID_0 = ? AND UserID_1 = ?)
      LIMIT 1
    `;
    db.query(checkConn, [senderId, receiverId, receiverId, senderId], (err2, connResults) => {
      if (err2) return res.status(500).send('Error checking existing connections');
      if (connResults.length > 0) return res.status(409).send('Connection already exists');

      // Crée la demande
      const insertQuery = 'INSERT INTO ConnectionRequest (SenderID, ReceiverID, status) VALUES (?, ?, "pending")';
      db.query(insertQuery, [senderId, receiverId], (err3, results3) => {
        if (err3) return res.status(500).send('Error creating connection request');
        res.status(201).json({ message: 'Connection request sent', requestId: results3.insertId });
      });
    });
  });
});

// Voir les demandes reçues et envoyées
app.get('/users/:userId/connection-requests', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) return res.status(400).send('Invalid userId');
  const query = `
    SELECT cr.RequestID, cr.SenderID, cr.ReceiverID, cr.status, cr.date_request, 
           u1.Nom as SenderNom, u1.Email as SenderEmail, u1.ProfileImagePath as SenderProfileImagePath,
           u2.Nom as ReceiverNom, u2.Email as ReceiverEmail, u2.ProfileImagePath as ReceiverProfileImagePath
    FROM ConnectionRequest cr
    JOIN Utilisateur u1 ON cr.SenderID = u1.UserID
    JOIN Utilisateur u2 ON cr.ReceiverID = u2.UserID
    WHERE cr.SenderID = ? OR cr.ReceiverID = ?
    ORDER BY cr.date_request DESC
  `;
  db.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).send('Error fetching requests');
    res.json(results);
  });
});

// Accepter une demande de connexion
app.post('/connection-requests/:requestId/accept', (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  if (!requestId || requestId < 1) return res.status(400).send('Invalid requestId');
  // Récupère la demande
  db.query('SELECT * FROM ConnectionRequest WHERE RequestID = ?', [requestId], (err, results) => {
    if (err) return res.status(500).send('Error fetching request');
    if (results.length === 0) return res.status(404).send('Request not found');
    const reqRow = results[0];
    if (reqRow.status !== 'pending') return res.status(400).send('Request already handled');
    // Crée la connexion
    db.query('INSERT INTO Connexion (UserID_0, UserID_1) VALUES (?, ?)', [reqRow.SenderID, reqRow.ReceiverID], (err2) => {
      if (err2) return res.status(500).send('Error creating connection');
      // Met à jour la demande
      db.query('UPDATE ConnectionRequest SET status = "accepted" WHERE RequestID = ?', [requestId], (err3) => {
        if (err3) return res.status(500).send('Error updating request');
        res.json({ message: 'Connection accepted' });
      });
    });
  });
});

// Refuser une demande de connexion
app.delete('/connection-requests/:requestId', (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  if (!requestId || requestId < 1) return res.status(400).send('Invalid requestId');
  db.query('UPDATE ConnectionRequest SET status = "rejected" WHERE RequestID = ?', [requestId], (err, results) => {
    if (err) return res.status(500).send('Error rejecting request');
    res.json({ message: 'Connection request rejected' });
  });
});

// Get all users with statut "ecole"
app.get('/schools', (req, res) => {
  db.query('SELECT UserID, Nom, Email, Biographie, ProfileImagePath, BannerImagePath FROM Utilisateur WHERE Statut = "ecole"', (err, results) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).send('Error fetching schools');
    }
    res.json(results);
  });
});

// Public route: get all admin users (for frontend "contact admin" button)
app.get('/users-admin', (req, res) => {
  db.query('SELECT UserID, Nom, Email, Statut FROM Utilisateur WHERE Statut = "admin"', (err, results) => {
    if (err) {
      console.error('Error fetching admins:', err);
      return res.status(500).send('Error fetching admins');
    }
    res.json(results);
  });
});

// Get all users with whom the user has exchanged messages (either sent or received)
app.get('/users/:userId/conversers', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || userId < 1) {
    return res.status(400).send('Invalid userId');
  }
  // Also fetch ProfileImagePath
  const query = `
    SELECT DISTINCT u.UserID, u.Nom, u.Email, u.ProfileImagePath
    FROM Utilisateur u
    WHERE u.UserID != ?
      AND (
        u.UserID IN (SELECT ReceiverID FROM Message WHERE SenderID = ?)
        OR
        u.UserID IN (SELECT SenderID FROM Message WHERE ReceiverID = ?)
      )
  `;
  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching conversers:', err);
      return res.status(500).send('Error fetching conversers');
    }
    res.json(results);
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
