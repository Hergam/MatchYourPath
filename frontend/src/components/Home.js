import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [commentError, setCommentError] = useState({});
  const [commentAuthors, setCommentAuthors] = useState({}); // {UserID: Nom}
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  // Fetch publications from backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/publications');
        setPosts(res.data.reverse()); // Show newest first
      } catch (err) {
        setError('Failed to load posts');
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Handle new post creation
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !newTitle.trim()) return;
    setError('');
    setPosting(true);
    try {
      await axios.post('/publications', {
        Titre: newTitle,
        Contenu: newPost,
        UserID: user.UserID
      });
      // Fetch the new list of posts after posting
      const updated = await axios.get('/publications');
      setPosts(updated.data.reverse());
      setNewPost('');
      setNewTitle('');
    } catch (err) {
      setError('Failed to create post');
    }
    setPosting(false);
  };

  // Fetch comments for a post, and fetch author names
  const fetchComments = async (postId) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    setCommentError(prev => ({ ...prev, [postId]: '' }));
    try {
      const res = await axios.get(`/publications/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res.data }));

      // Fetch author names for each comment (if not already fetched)
      const uniqueUserIds = [...new Set(res.data.map(c => c.UserID).filter(Boolean))];
      const authors = {};
      await Promise.all(
        uniqueUserIds.map(async (id) => {
          if (!commentAuthors[id]) {
            try {
              const userRes = await axios.get(`/users/${id}`);
              authors[id] = userRes.data.Nom;
            } catch {
              authors[id] = `Utilisateur #${id}`;
            }
          }
        })
      );
      setCommentAuthors(prev => ({ ...prev, ...authors }));
    } catch {
      setCommentError(prev => ({ ...prev, [postId]: 'Erreur lors du chargement des commentaires' }));
    }
    setCommentLoading(prev => ({ ...prev, [postId]: false }));
  };

  // Toggle comments section
  const handleToggleComments = (postId) => {
    setOpenComments(prev => {
      const isOpen = !!prev[postId];
      if (!isOpen) fetchComments(postId);
      return { ...prev, [postId]: !isOpen };
    });
  };

  // Handle comment input change
  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  // Submit a comment
  const handleSubmitComment = async (postId) => {
    const content = (commentInputs[postId] || '').trim();
    if (!content) return;
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    setCommentError(prev => ({ ...prev, [postId]: '' }));
    try {
      await axios.post(`/publications/${postId}/comments`, {
        Contenu: content,
        UserID: user.UserID
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch {
      setCommentError(prev => ({ ...prev, [postId]: 'Erreur lors de l\'envoi du commentaire' }));
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Delete a post (admin only)
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    try {
      await axios.delete(`/publications/${postId}`);
      setPosts(posts => posts.filter(p => p.PostID !== postId));
    } catch {
      alert('Erreur lors de la suppression du post');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 2, px: { xs: 1, sm: 2, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2, background: 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          Welcome to MatchYourPath!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#fffde7', mt: 1 }}>
          Connect, share, and discover new opportunities with your peers.
        </Typography>
      </Paper>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box component="form" onSubmit={handlePost} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={user.ProfileImagePath ? user.ProfileImagePath : undefined}
                sx={{ bgcolor: 'primary.main', mr: 1, cursor: 'pointer' }}
                onClick={() => navigate('/profile')}
                title="Go to profile"
              >
                {!user.ProfileImagePath && (user.Nom ? user.Nom[0].toUpperCase() : 'Y')}
              </Avatar>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
                disabled={posting}
              />
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              size="small"
              multiline
              minRows={2}
              disabled={posting}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newPost.trim() || !newTitle.trim() || posting}
              sx={{ mt: 1 }}
            >
              {posting ? 'Posting...' : 'Post'}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      <Divider sx={{ mb: 1 }} />
      <Box>
        {loading ? (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Loading...</Typography>
        ) : posts.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>No posts yet.</Typography>
        ) : (
          posts.map(post => (
            <Card key={post.PostID} sx={{ mb: 1 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={post.ProfileImagePath ? post.ProfileImagePath : undefined}
                    sx={{ bgcolor: 'secondary.main' }}
                  >
                    {!post.ProfileImagePath && (post.Nom ? post.Nom[0].toUpperCase() : '?')}
                  </Avatar>
                }
                title={post.Nom ? post.Nom : <span style={{color:'#888'}}>Unknown</span>}
                subheader={post.date_post ? post.date_post.slice(0, 10) : ''}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => handleToggleComments(post.PostID)}
                      aria-label="commentaires"
                    >
                      <CommentIcon color={openComments[post.PostID] ? 'primary' : 'inherit'} />
                    </IconButton>
                    {user?.Statut === 'admin' && (
                      <Button
                        color="error"
                        size="small"
                        sx={{ ml: 1, minWidth: 0 }}
                        onClick={() => handleDeletePost(post.PostID)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {post.Titre}
                </Typography>
                <Typography variant="body1">{post.Contenu}</Typography>
              </CardContent>
              <Collapse in={!!openComments[post.PostID]} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Commentaires
                  </Typography>
                  {commentLoading[post.PostID] ? (
                    <Typography>Chargement...</Typography>
                  ) : commentError[post.PostID] ? (
                    <Typography color="error">{commentError[post.PostID]}</Typography>
                  ) : (
                    <Box>
                      {(comments[post.PostID] || []).length === 0 ? (
                        <Typography color="text.secondary" sx={{ mb: 1 }}>Aucun commentaire.</Typography>
                      ) : (
                        <Box sx={{ mb: 1 }}>
                          {comments[post.PostID].map(comment => (
                            <Box key={comment.CommentaireID} sx={{ mb: 1, pl: 1, borderLeft: '3px solid #ffb74d' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {comment.UserID && commentAuthors[comment.UserID]
                                  ? commentAuthors[comment.UserID]
                                  : comment.UserID
                                    ? `Utilisateur #${comment.UserID}`
                                    : 'Utilisateur'}
                              </Typography>
                              <Typography variant="body2">{comment.Contenu}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comment.date_commentaire ? comment.date_commentaire.slice(0, 16).replace('T', ' ') : ''}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ajouter un commentaire..."
                      value={commentInputs[post.PostID] || ''}
                      onChange={e => handleCommentInputChange(post.PostID, e.target.value)}
                      disabled={commentLoading[post.PostID]}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment(post.PostID);
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={commentLoading[post.PostID] || !(commentInputs[post.PostID] || '').trim()}
                      onClick={() => handleSubmitComment(post.PostID)}
                    >
                      Envoyer
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

export default Home;