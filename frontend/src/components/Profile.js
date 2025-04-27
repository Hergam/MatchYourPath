import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [bio, setBio] = useState(user.Biographie || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/users/${user.UserID}`, {
        Nom: user.Nom,
        Email: user.Email,
        Password: 'dummy', // Backend requires password, should be improved
        Statut: user.Statut,
        Biographie: bio
      });
      // Update local user
      const updated = { ...user, Biographie: bio };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mb: 2, fontSize: 36 }}>
            {user.Nom ? user.Nom[0].toUpperCase() : 'U'}
          </Avatar>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {user.Nom || 'Unknown User'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {user.Email || 'No email'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user.Statut || 'No status'}
          </Typography>
          {/* School biographie section */}
          {user.Statut === 'ecole' && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Biographie
              </Typography>
              {editing ? (
                <>
                  <TextField
                    multiline
                    minRows={3}
                    fullWidth
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    disabled={saving}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => { setEditing(false); setBio(user.Biographie || ''); }}
                      disabled={saving}
                    >
                      Annuler
                    </Button>
                  </Box>
                  {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography sx={{ whiteSpace: 'pre-line', minHeight: 48, mb: 1 }}>
                    {user.Biographie || <span style={{ color: '#888' }}>Aucune biographie</span>}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleEdit}
                  >
                    Modifier la biographie
                  </Button>
                </>
              )}
            </Box>
          )}
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 3 }}
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Profile;