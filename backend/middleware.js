const express = require('express');
const mysql = require('mysql2');

const jsonParser = express.json();

// Setup a database connection for middleware (reuse config as in server.js)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Admin middleware
function isAdmin(req, res, next) {
  const userId = parseInt(req.header('x-user-id'), 10);
  if (!userId) {
    return res.status(401).send('User ID required');
  }
  db.query('SELECT Statut FROM Utilisateur WHERE UserID = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    if (!results.length || results[0].Statut !== 'admin') {
      return res.status(403).send('Admin access required');
    }
    next();
  });
}

module.exports = {
  jsonParser,
  isAdmin,
};
