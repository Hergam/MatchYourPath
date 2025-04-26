import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuth(!!user);
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  if (isAuth === null) return null; // or a loading spinner
  return isAuth ? children : null;
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('user'));
  const user = isAuth ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const handleStorage = () => setIsAuth(!!localStorage.getItem('user'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          {isAuth && (
            <Button
              color="inherit"
              component={Link}
              to="/profile"
              sx={{ minWidth: 0, p: 0, mr: 2 }}
            >
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                {user?.Nom ? user.Nom[0].toUpperCase() : 'U'}
              </Avatar>
            </Button>
          )}
          <Box sx={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 600 }}>
              Home
            </Button>
            {!isAuth && (
              <>
                <Button color="inherit" component={Link} to="/login" sx={{ fontWeight: 600 }}>
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register" sx={{ fontWeight: 600 }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
