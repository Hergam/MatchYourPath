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

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
          Welcome to MatchYourPath!
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#e3f2fd', mt: 1 }}>
          Connect, share, and discover new opportunities with your peers.
        </Typography>
      </Paper>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handlePost} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ bgcolor: 'primary.main', mr: 2, cursor: 'pointer' }}
                onClick={() => navigate('/profile')}
                title="Go to profile"
              >
                {user.Nom ? user.Nom[0].toUpperCase() : 'Y'}
              </Avatar>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                size="small"
                sx={{ mr: 2 }}
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
            >
              {posting ? 'Posting...' : 'Post'}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      <Divider sx={{ mb: 2 }} />
      <Box>
        {loading ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>
        ) : posts.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>No posts yet.</Typography>
        ) : (
          posts.map(post => (
            <Card key={post.PostID} sx={{ mb: 2 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {post.Nom ? post.Nom[0].toUpperCase() : '?'}
                  </Avatar>
                }
                title={post.Nom ? post.Nom : <span style={{color:'#888'}}>Unknown</span>}
                subheader={post.date_post ? post.date_post.slice(0, 10) : ''}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {post.Titre}
                </Typography>
                <Typography variant="body1">{post.Contenu}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

export default Home;