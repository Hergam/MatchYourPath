import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import Admin from './components/Admin';
import Connections from './components/Connections';
import Messages from './components/Messages';
import Schools from './components/Schools';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';

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

function RequireAdmin({ children }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.Statut === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      navigate('/');
    }
  }, [navigate]);

  if (isAdmin === null) return null;
  return isAdmin ? children : null;
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('user'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  // Fetch latest user info from backend if logged in
  useEffect(() => {
    const fetchUser = async () => {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        try {
          const res = await axios.get(`/users/${parsed.UserID}`);
          localStorage.setItem('user', JSON.stringify(res.data));
          setUser(res.data);
          setIsAuth(true);
        } catch {
          // If user not found, logout
          localStorage.removeItem('user');
          setUser(null);
          setIsAuth(false);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const u = localStorage.getItem('user');
      setIsAuth(!!u);
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Also update user state on login/logout within this tab
  useEffect(() => {
    const interval = setInterval(() => {
      const u = localStorage.getItem('user');
      setIsAuth(!!u);
      setUser(u ? JSON.parse(u) : null);
    }, 500);
    return () => clearInterval(interval);
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
            {isAuth && (
              <>
                <Button color="inherit" component={Link} to="/connections" sx={{ fontWeight: 600 }}>
                  Connections
                </Button>
                <Button color="inherit" component={Link} to="/messages" sx={{ fontWeight: 600 }}>
                  Messages
                </Button>
                <Button color="inherit" component={Link} to="/schools" sx={{ fontWeight: 600 }}>
                  Schools
                </Button>
              </>
            )}
            {isAuth && user?.Statut === 'admin' && (
              <Button color="inherit" component={Link} to="/admin" sx={{ fontWeight: 600 }}>
                Admin
              </Button>
            )}
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
        <Route
          path="/connections"
          element={
            <RequireAuth>
              <Connections />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />
        <Route
          path="/schools"
          element={
            <RequireAuth>
              <Schools />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
