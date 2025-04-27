import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';

function Connections() {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const fetchConnections = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/users/${user.UserID}/connections`);
      setConnections(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des connexions');
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/users/${user.UserID}/connection-requests`);
      setRequests(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (user.UserID) {
      fetchConnections();
      fetchRequests();
    }
    // eslint-disable-next-line
  }, [user.UserID]);

  const handleAddConnection = async (e) => {
    e.preventDefault();
    setError('');
    setAddLoading(true);
    try {
      // Cherche l'utilisateur par email
      const res = await axios.get(`/users-by-email/${encodeURIComponent(addEmail)}`);
      const otherUser = res.data;
      if (!otherUser || !otherUser.UserID) {
        setError("Utilisateur non trouvé");
        setAddLoading(false);
        return;
      }
      // Envoie une demande de connexion
      await axios.post('/connection-requests', {
        senderId: user.UserID,
        receiverId: otherUser.UserID
      });
      setAddEmail('');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data || "Impossible d'envoyer la demande");
    }
    setAddLoading(false);
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`/connection-requests/${requestId}/accept`);
      fetchConnections();
      fetchRequests();
    } catch (err) {
      setError("Erreur lors de l'acceptation");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.delete(`/connection-requests/${requestId}`);
      fetchRequests();
    } catch (err) {
      setError("Erreur lors du refus");
    }
  };

  // Sépare les demandes reçues et envoyées
  const receivedRequests = requests.filter(
    r => r.ReceiverID === user.UserID && r.status === 'pending'
  );
  const sentRequests = requests.filter(
    r => r.SenderID === user.UserID && r.status === 'pending'
  );

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Mes connexions
        </Typography>
        <Box component="form" onSubmit={handleAddConnection} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Email de l'utilisateur à ajouter"
            value={addEmail}
            onChange={e => setAddEmail(e.target.value)}
            size="small"
            variant="outlined"
            fullWidth
            disabled={addLoading}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!addEmail.trim() || addLoading}
          >
            {addLoading ? "Envoi..." : "Ajouter"}
          </Button>
        </Box>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Demandes reçues</Typography>
        {receivedRequests.length === 0 ? (
          <Typography>Aucune demande reçue.</Typography>
        ) : (
          <List>
            {receivedRequests.map(req => (
              <ListItem key={req.RequestID} secondaryAction={
                <>
                  <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleAccept(req.RequestID)}>
                    Accepter
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleReject(req.RequestID)}>
                    Refuser
                  </Button>
                </>
              }>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {req.SenderNom ? req.SenderNom[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={req.SenderNom || 'Utilisateur inconnu'}
                  secondary={req.SenderEmail}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Demandes envoyées</Typography>
        {sentRequests.length === 0 ? (
          <Typography>Aucune demande envoyée.</Typography>
        ) : (
          <List>
            {sentRequests.map(req => (
              <ListItem key={req.RequestID}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {req.ReceiverNom ? req.ReceiverNom[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={req.ReceiverNom || 'Utilisateur inconnu'}
                  secondary={req.ReceiverEmail}
                />
                <Typography color="text.secondary" sx={{ ml: 2 }}>En attente</Typography>
              </ListItem>
            ))}
          </List>
        )}

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Connexions</Typography>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : connections.length === 0 ? (
          <Typography>Aucune connexion trouvée.</Typography>
        ) : (
          <List>
            {connections.map(conn => (
              <ListItem key={conn.ConnexionID}
                secondaryAction={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/messages/${conn.UserID}`)}
                  >
                    Message
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {conn.Nom ? conn.Nom[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conn.Nom || 'Utilisateur inconnu'}
                  secondary={conn.Email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Connections;
