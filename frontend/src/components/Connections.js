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
import Autocomplete from '@mui/material/Autocomplete';

function Connections() {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Fetch all users for autocomplete (except self)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use new /users route instead of /admin/users
        const res = await axios.get('/users');
        setUserOptions(res.data.filter(u => u.UserID !== user.UserID));
      } catch {
        setUserOptions([]);
      }
    };
    if (user.UserID) fetchUsers();
    // eslint-disable-next-line
  }, [user.UserID]);

  const handleAddConnection = async (e) => {
    e.preventDefault();
    setError('');
    setAddLoading(true);
    try {
      if (!selectedUser || !selectedUser.UserID) {
        setError("Veuillez sélectionner un utilisateur");
        setAddLoading(false);
        return;
      }
      // Envoie une demande de connexion
      await axios.post('/connection-requests', {
        senderId: user.UserID,
        receiverId: selectedUser.UserID
      });
      setSelectedUser(null);
      setUserSearch('');
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
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, px: { xs: 1, sm: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Mes connexions
        </Typography>
        <Box component="form" onSubmit={handleAddConnection} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Autocomplete
            options={userOptions}
            getOptionLabel={option => `${option.Nom} (${option.Email})`}
            value={selectedUser}
            onChange={(_, value) => setSelectedUser(value)}
            inputValue={userSearch}
            onInputChange={(_, value) => setUserSearch(value)}
            renderOption={(props, option) => (
              <li {...props}>
                <Avatar
                  src={option.ProfileImagePath ? option.ProfileImagePath : undefined}
                  sx={{ bgcolor: 'primary.main', width: 28, height: 28, mr: 1 }}
                >
                  {!option.ProfileImagePath && (option.Nom ? option.Nom[0].toUpperCase() : '?')}
                </Avatar>
                {option.Nom} ({option.Email})
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label="Rechercher un utilisateur"
                variant="outlined"
                size="small"
                fullWidth
                disabled={addLoading}
              />
            )}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedUser || addLoading}
          >
            {addLoading ? "Envoi..." : "Ajouter"}
          </Button>
        </Box>
        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>Demandes reçues</Typography>
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
                  <Avatar
                    src={req.SenderProfileImagePath ? req.SenderProfileImagePath : undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {!req.SenderProfileImagePath && (req.SenderNom ? req.SenderNom[0].toUpperCase() : '?')}
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

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Demandes envoyées</Typography>
        {sentRequests.length === 0 ? (
          <Typography>Aucune demande envoyée.</Typography>
        ) : (
          <List>
            {sentRequests.map(req => (
              <ListItem key={req.RequestID}>
                <ListItemAvatar>
                  <Avatar
                    src={req.ReceiverProfileImagePath ? req.ReceiverProfileImagePath : undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {!req.ReceiverProfileImagePath && (req.ReceiverNom ? req.ReceiverNom[0].toUpperCase() : '?')}
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

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Connexions</Typography>
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
                  <Avatar
                    src={conn.ProfileImagePath ? conn.ProfileImagePath : undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {!conn.ProfileImagePath && (conn.Nom ? conn.Nom[0].toUpperCase() : '?')}
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
