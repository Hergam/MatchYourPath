import React, { useState, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user.ProfileImagePath || '');
  const [bannerImage, setBannerImage] = useState(user.BannerImagePath || '');
  const fileInputRef = useRef();
  const bannerInputRef = useRef();
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
        Biographie: bio,
        ProfileImagePath: profileImage,
        BannerImagePath: bannerImage
      });
      // Update local user
      const updated = { ...user, Biographie: bio, ProfileImagePath: profileImage, BannerImagePath: bannerImage };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  // Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(res.data.url);
      // Optionally update immediately in backend
      await axios.put(`/users/${user.UserID}`, {
        Nom: user.Nom,
        Email: user.Email,
        Password: 'dummy',
        Statut: user.Statut,
        Biographie: bio,
        ProfileImagePath: res.data.url,
        BannerImagePath: bannerImage
      });
      const updated = { ...user, ProfileImagePath: res.data.url };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      setError('Erreur lors du téléchargement de la photo');
    }
    setUploading(false);
  };

  // Handle banner image upload
  const handleBannerChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBannerImage(res.data.url);
      // Optionally update immediately in backend
      await axios.put(`/users/${user.UserID}`, {
        Nom: user.Nom,
        Email: user.Email,
        Password: 'dummy',
        Statut: user.Statut,
        Biographie: bio,
        ProfileImagePath: profileImage,
        BannerImagePath: res.data.url
      });
      const updated = { ...user, BannerImagePath: res.data.url };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      setError('Erreur lors du téléchargement de la bannière');
    }
    setUploading(false);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleBannerClick = () => {
    if (bannerInputRef.current) bannerInputRef.current.click();
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 3, px: { xs: 1, sm: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {user.Statut === 'ecole' && (
          <Box sx={{ position: 'relative', mb: 2, width: '100%', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                width: '100%',
                height: 120,
                background: bannerImage ? `url(${bannerImage}) center/cover no-repeat` : '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={handleBannerClick}
              title="Changer la bannière"
            >
              {!bannerImage && (
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  Ajouter une bannière
                </Typography>
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={bannerInputRef}
              style={{ display: 'none' }}
              onChange={handleBannerChange}
              disabled={uploading}
            />
            <Button
              variant="text"
              size="small"
              onClick={handleBannerClick}
              sx={{ mt: 1 }}
              disabled={uploading}
            >
              {uploading ? 'Téléchargement...' : 'Changer la bannière'}
            </Button>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profileImage ? profileImage : undefined}
              sx={{ bgcolor: 'primary.main', width: 80, height: 80, fontSize: 36, cursor: 'pointer', mx: 'auto' }}
              onClick={handleAvatarClick}
              title="Changer la photo de profil"
            >
              {!profileImage && (user.Nom ? user.Nom[0].toUpperCase() : 'U')}
            </Avatar>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={uploading}
            />
            <Button
              variant="text"
              size="small"
              onClick={handleAvatarClick}
              sx={{ mt: 1 }}
              disabled={uploading}
            >
              {uploading ? 'Téléchargement...' : 'Changer la photo'}
            </Button>
          </Box>
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