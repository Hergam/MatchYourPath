import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  // Example posts (replace with API data in real app)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Alice',
      avatar: 'A',
      date: '2024-05-01',
      content: 'Excited to join MatchYourPath! 🚀'
    },
    {
      id: 2,
      author: 'Bob',
      avatar: 'B',
      date: '2024-05-02',
      content: 'Anyone interested in collaborating on a project?'
    }
  ]);
  const [newPost, setNewPost] = useState('');

  const navigate = useNavigate();

  const handlePost = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      setPosts([
        {
          id: posts.length + 1,
          author: 'You',
          avatar: 'Y',
          date: new Date().toISOString().slice(0, 10),
          content: newPost
        },
        ...posts
      ]);
      setNewPost('');
    }
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
          <Box component="form" onSubmit={handlePost} sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ bgcolor: 'primary.main', mr: 2, cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
              title="Go to profile"
            >
              Y
            </Avatar>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              size="small"
              sx={{ mr: 2 }}
            />
            <Button type="submit" variant="contained" disabled={!newPost.trim()}>
              Post
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Divider sx={{ mb: 2 }} />
      <Box>
        {posts.map(post => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{post.avatar}</Avatar>}
              title={post.author}
              subheader={post.date}
            />
            <CardContent>
              <Typography variant="body1">{post.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default Home;