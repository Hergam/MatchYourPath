import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

function Conversation({ userId, conversers, currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Try to find user in conversers first for better UX
    const found = conversers.find(u => String(u.UserID) === String(userId));
    if (found) {
      setSelectedUser(found);
    } else {
      // Fetch user from backend if not present in conversers
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/users/${userId}`);
          setSelectedUser(res.data);
        } catch {
          setSelectedUser(null);
        }
      };
      fetchUser();
    }
    // eslint-disable-next-line
  }, [userId, conversers]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      setLoading(true);
      try {
        const res = await axios.get(`/users/${currentUser.UserID}/messages/${selectedUser.UserID}`);
        setMessages(res.data);
        setOtherUser(selectedUser);
      } catch {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedUser, currentUser.UserID]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    setSending(true);
    try {
      await axios.post(`/users/${currentUser.UserID}/messages/${selectedUser.UserID}`, { message: newMsg });
      setNewMsg('');
      // Refresh messages
      const res = await axios.get(`/users/${currentUser.UserID}/messages/${selectedUser.UserID}`);
      setMessages(res.data);
    } catch {
      // ignore
    }
    setSending(false);
  };

  if (!selectedUser) {
    return (
      <Typography sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
        Utilisateur introuvable.
      </Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ flex: 1, p: 3, minHeight: 400 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Conversation avec {otherUser ? otherUser.Nom : ''}
      </Typography>
      <Box sx={{ mb: 2, maxHeight: 350, overflowY: 'auto' }}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <List>
            {messages.map(msg => (
              <ListItem
                key={msg.messageID}
                sx={{
                  justifyContent: msg.SenderID === currentUser.UserID ? 'flex-end' : 'flex-start'
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.SenderID === currentUser.UserID ? 'primary.light' : 'grey.200',
                    color: 'text.primary',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '70%',
                    wordBreak: 'break-word'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {msg.SenderID === currentUser.UserID ? 'Moi' : otherUser?.Nom || 'Lui/Elle'}
                  </Typography>
                  <Typography variant="body1">{msg.message}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {msg.date_message ? msg.date_message.slice(0, 16).replace('T', ' ') : ''}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Votre message..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          disabled={sending}
        />
        <Button type="submit" variant="contained" disabled={!newMsg.trim() || sending}>
          Envoyer
        </Button>
      </Box>
    </Paper>
  );
}

function Messages() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [conversers, setConversers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  // Get the userId param from the URL for subroutes
  const { userId } = useParams();

  // Fetch all users with whom the user has exchanged messages
  useEffect(() => {
    const fetchConversers = async () => {
      try {
        const res = await axios.get(`/users/${currentUser.UserID}/conversers`);
        setConversers(res.data);
      } catch {
        setConversers([]);
      }
    };
    if (currentUser.UserID) fetchConversers();

    // Fetch admin user (public, not via /admin/users)
    const fetchAdmin = async () => {
      setAdminLoading(true);
      try {
        const res = await axios.get('/users-admin');
        const adminUser = Array.isArray(res.data) ? res.data[0] : null;
        setAdmin(adminUser || null);
      } catch {
        setAdmin(null);
      }
      setAdminLoading(false);
    };
    if (currentUser.Statut !== 'admin') fetchAdmin();
    // eslint-disable-next-line
  }, [currentUser.UserID, currentUser.Statut]);

  // For admin button
  const handleAdminMessage = () => {
    if (admin) {
      navigate(`/messages/${admin.UserID}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, display: 'flex', gap: 2, px: { xs: 1, sm: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 2, minWidth: 250, maxHeight: 600, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Mes conversations
        </Typography>
        {/* Button to message admin if not admin */}
        {currentUser.Statut !== 'admin' && (
          adminLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : admin ? (
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mb: 2 }}
              fullWidth
              onClick={handleAdminMessage}
            >
              Contacter un admin
            </Button>
          ) : (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              Aucun admin trouvé
            </Typography>
          )
        )}
        <List>
          {conversers.length === 0 ? (
            <Typography>Aucune conversation.</Typography>
          ) : (
            conversers.map(user => (
              <ListItem
                key={user.UserID}
                button
                selected={String(userId) === String(user.UserID)}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/messages/${user.UserID}`)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.ProfileImagePath ? user.ProfileImagePath : undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {!user.ProfileImagePath && (user.Nom ? user.Nom[0].toUpperCase() : '?')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.Nom || 'Utilisateur inconnu'}
                  secondary={user.Email}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
      {/* Always render the Conversation component for the current userId param */}
      {userId ? (
        <Conversation
          userId={userId}
          conversers={conversers}
          currentUser={currentUser}
        />
      ) : (
        <Paper elevation={3} sx={{ flex: 1, p: 3, minHeight: 400 }}>
          <Typography sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
            Sélectionnez une conversation pour commencer à discuter.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default Messages;
