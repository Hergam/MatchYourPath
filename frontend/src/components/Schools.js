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
import { useNavigate } from 'react-router-dom';

function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Biographie as well
        const res = await axios.get('/schools');
        setSchools(res.data);
      } catch (err) {
        setError('Erreur lors du chargement des écoles');
      }
      setLoading(false);
    };
    fetchSchools();
  }, []);

  const handleSelect = (school) => {
    setSelectedSchool(school);
  };

  const handleMessage = () => {
    if (selectedSchool) {
      // Go to messages page and pass school UserID as state
      navigate('/messages', { state: { user: selectedSchool } });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Écoles
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : schools.length === 0 ? (
          <Typography>Aucune école trouvée.</Typography>
        ) : (
          <List>
            {schools.map(school => (
              <ListItem
                key={school.UserID}
                alignItems="flex-start"
                button
                selected={selectedSchool && selectedSchool.UserID === school.UserID}
                onClick={() => handleSelect(school)}
                sx={{
                  bgcolor: selectedSchool && selectedSchool.UserID === school.UserID ? 'action.selected' : undefined,
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {school.Nom ? school.Nom[0].toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6">{school.Nom}</Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {school.Email}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                        {school.Biographie
                          ? school.Biographie
                          : <span style={{ color: '#888' }}>Aucune biographie</span>}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        {selectedSchool && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMessage}
            >
              Envoyer un message
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Schools;
