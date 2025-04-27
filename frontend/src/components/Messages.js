import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import { useLocation } from 'react-router-dom';

function Messages() {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [conversers, setConversers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

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

  // Fetch messages when a user is selected
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

  // Select user from navigation state (e.g., from Schools page)
  useEffect(() => {
    if (location.state && location.state.user) {
      setSelectedUser(location.state.user);
    }
    // eslint-disable-next-line
  }, [location.state]);

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

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, display: 'flex', gap: 3 }}>
      <Paper elevation={3} sx={{ p: 2, minWidth: 250, maxHeight: 600, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
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
              onClick={() => setSelectedUser(admin)}
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
                selected={selectedUser && selectedUser.UserID === user.UserID}
                onClick={() => setSelectedUser(user)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.Nom ? user.Nom[0].toUpperCase() : '?'}
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
      <Paper elevation={3} sx={{ flex: 1, p: 3, minHeight: 400 }}>
        {selectedUser ? (
          <>
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
          </>
        ) : (
          <Typography sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
            Sélectionnez une conversation pour commencer à discuter.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default Messages;
