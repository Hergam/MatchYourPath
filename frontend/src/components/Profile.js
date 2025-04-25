import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
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
          <Typography variant="body2" color="text.secondary">
            {user.Statut || 'No status'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Profile;