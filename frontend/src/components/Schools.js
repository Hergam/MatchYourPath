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
      // Redirect to /messages/<schoolUserID>
      navigate(`/messages/${selectedSchool.UserID}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, px: { xs: 1, sm: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
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
            {schools.map((school, idx) => (
              <React.Fragment key={school.UserID}>
                <ListItem
                  alignItems="flex-start"
                  button
                  selected={selectedSchool && selectedSchool.UserID === school.UserID}
                  onClick={() => handleSelect(school)}
                  sx={{
                    bgcolor: selectedSchool && selectedSchool.UserID === school.UserID ? 'action.selected' : undefined,
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    boxShadow: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'box-shadow 0.2s, border 0.2s',
                  }}
                >
                  {school.BannerImagePath && (
                    <Box
                      sx={{
                        width: '100%',
                        height: 180, // Increased height for the banner
                        background: `url(${school.BannerImagePath}) center/cover no-repeat`,
                        borderRadius: 1,
                        mb: 1
                      }}
                    />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemAvatar>
                      <Avatar
                        src={school.ProfileImagePath ? school.ProfileImagePath : undefined}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {!school.ProfileImagePath && (school.Nom ? school.Nom[0].toUpperCase() : '?')}
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
                  </Box>
                </ListItem>
              </React.Fragment>
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
