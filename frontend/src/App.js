import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';

function Publications() {
  return <h2>Publications Page</h2>;
}

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

  useEffect(() => {
    const handleStorage = () => setIsAuth(!!localStorage.getItem('user'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/publications">Publications</Link>
        {!isAuth && (
          <>
            {' '}| <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="/publications" element={<Publications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
