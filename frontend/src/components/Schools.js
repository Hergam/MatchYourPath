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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import IconButton from '@mui/material/IconButton';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CommentIcon from '@mui/icons-material/Comment';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [openRate, setOpenRate] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [reviewAuthors, setReviewAuthors] = useState({}); // {AuthorID: Nom}
  const [userNoteIds, setUserNoteIds] = useState({}); // {ecoleId: noteID}
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      setError('');
      try {
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
      navigate(`/messages/${selectedSchool.UserID}`);
    }
  };

  // --- Rating dialog ---
  const handleOpenRate = (school) => {
    // Check if user already rated this school
    const alreadyRated = reviews.find(r => r.AuthorID === user.UserID);
    if (alreadyRated) {
      setSuccessMsg('Vous avez déjà donné un avis pour cette école.');
      setOpenRate(false);
      return;
    }
    setSelectedSchool(school);
    setRatingValue(0);
    setRatingComment('');
    setSuccessMsg('');
    setOpenRate(true);
  };

  const handleCloseRate = () => {
    setOpenRate(false);
    setSuccessMsg('');
  };

  const handleSubmitRating = async () => {
    if (!ratingValue || !selectedSchool) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await axios.post(`/ecoles/${selectedSchool.UserID}/notes`, {
        valeur: ratingValue,
        commentaire: ratingComment,
        AuthorID: user.UserID
      });
      setSuccessMsg('Votre avis a été enregistré.');
      setTimeout(() => {
        setOpenRate(false);
      }, 1000);
    } catch (err) {
      setSuccessMsg("Erreur lors de l'envoi de la note.");
    }
    setSubmitting(false);
  };

  // --- Reviews dialog ---
  const handleOpenReviews = async (school) => {
    setSelectedSchool(school);
    setReviews([]);
    setReviewsError('');
    setReviewsLoading(true);
    setOpenReviews(true);
    try {
      const res = await axios.get(`/ecoles/${school.UserID}/notes`);
      setReviews(res.data);

      // Fetch author names for each review (if not already fetched)
      const uniqueAuthorIds = [...new Set(res.data.map(r => r.AuthorID).filter(Boolean))];
      const authors = {};
      await Promise.all(
        uniqueAuthorIds.map(async (id) => {
          if (!reviewAuthors[id]) {
            try {
              const userRes = await axios.get(`/users/${id}`);
              authors[id] = userRes.data.Nom;
            } catch {
              authors[id] = `Utilisateur #${id}`;
            }
          }
        })
      );
      setReviewAuthors(prev => ({ ...prev, ...authors }));

      // Find if current user has already rated this school
      const myNote = res.data.find(r => r.AuthorID === user.UserID);
      setUserNoteIds(prev => ({ ...prev, [school.UserID]: myNote ? myNote.noteID : null }));
    } catch (err) {
      setReviewsError("Erreur lors du chargement des avis.");
    }
    setReviewsLoading(false);
  };

  const handleCloseReviews = () => {
    setOpenReviews(false);
    setReviews([]);
    setReviewsError('');
  };

  // Prevent opening rate dialog if already rated
  const canRate = (school) => {
    const schoolId = school.UserID;
    // If we have loaded userNoteIds for this school, use it, else allow rating (button enabled)
    if (userNoteIds.hasOwnProperty(schoolId)) {
      return !userNoteIds[schoolId];
    }
    return true;
  };

  // Delete a review (admin only)
  const handleDeleteReview = async (noteID, ecoleID) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
    try {
      await axios.delete(`/notes/${noteID}`);
      // Refresh reviews after deletion
      handleOpenReviews({ UserID: ecoleID });
    } catch {
      alert('Erreur lors de la suppression de l\'avis');
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
            {schools.map((school) => (
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
                        height: 180,
                        background: `url(${school.BannerImagePath}) center/cover no-repeat`,
                        borderRadius: 1,
                        mb: 1
                      }}
                    />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Tooltip title="Donner une note et un avis">
                        <span>
                          <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            startIcon={<RateReviewIcon />}
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              ...(userNoteIds.hasOwnProperty(school.UserID) && userNoteIds[school.UserID]
                                ? { bgcolor: '#e0e0e0', color: '#888', pointerEvents: 'none' }
                                : {})
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              if (canRate(school)) handleOpenRate(school);
                            }}
                            disabled={userNoteIds.hasOwnProperty(school.UserID) && !!userNoteIds[school.UserID]}
                          >
                            {userNoteIds.hasOwnProperty(school.UserID) && userNoteIds[school.UserID]
                              ? "Avis déjà donné"
                              : "Noter cette école"}
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="Voir les avis des utilisateurs">
                        <Button
                          color="secondary"
                          variant="contained"
                          size="large"
                          startIcon={<CommentIcon />}
                          sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1, borderRadius: 2 }}
                          onClick={e => { e.stopPropagation(); handleOpenReviews(school); }}
                        >
                          Voir les avis
                        </Button>
                      </Tooltip>
                    </Box>
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
              size="large"
              sx={{ fontWeight: 600, fontSize: '1rem', px: 3, py: 1.5, borderRadius: 2 }}
              onClick={handleMessage}
            >
              Envoyer un message
            </Button>
          </Box>
        )}

        {/* Dialog: Noter une école */}
        <Dialog open={openRate} onClose={handleCloseRate} maxWidth="xs" fullWidth>
          <DialogTitle>Noter {selectedSchool?.Nom}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 1 }}>
              <Rating
                name="note"
                value={ratingValue}
                onChange={(_, value) => setRatingValue(value)}
                size="large"
                max={5}
              />
              <TextField
                label="Commentaire (optionnel)"
                multiline
                minRows={2}
                fullWidth
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
              />
              {successMsg && (
                <Typography color={successMsg.startsWith('Erreur') ? 'error' : 'success.main'} sx={{ mt: 1 }}>
                  {successMsg}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRate} disabled={submitting} size="large">Annuler</Button>
            <Button onClick={handleSubmitRating} variant="contained" disabled={submitting || !ratingValue} size="large">
              Envoyer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Voir les avis */}
        <Dialog open={openReviews} onClose={handleCloseReviews} maxWidth="sm" fullWidth>
          <DialogTitle>Avis sur {selectedSchool?.Nom}</DialogTitle>
          <DialogContent dividers>
            {reviewsLoading ? (
              <Typography>Chargement...</Typography>
            ) : reviewsError ? (
              <Typography color="error">{reviewsError}</Typography>
            ) : reviews.length === 0 ? (
              <Typography>Aucun avis pour cette école.</Typography>
            ) : (
              <List>
                {reviews.map((review) => (
                  <ListItem key={review.noteID} alignItems="flex-start" sx={{ mb: 2 }}
                    secondaryAction={
                      user?.Statut === 'admin' && (
                        <IconButton
                          edge="end"
                          color="error"
                          aria-label="supprimer"
                          onClick={() => handleDeleteReview(review.noteID, selectedSchool.UserID)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating value={review.valeur} readOnly size="large" max={5} />
                        <Typography variant="body2" color="text.secondary">
                          {review.commentaire || <span style={{ color: '#888' }}>Aucun commentaire</span>}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5, fontWeight: 600 }}>
                        {review.AuthorID && reviewAuthors[review.AuthorID]
                          ? reviewAuthors[review.AuthorID]
                          : review.AuthorID
                            ? `Utilisateur #${review.AuthorID}`
                            : ''}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReviews} size="large">Fermer</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default Schools;
