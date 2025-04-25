import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <h2>Welcome to MatchYourPath</h2>;
}

function Publications() {
  return <h2>Publications Page</h2>;
}

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/publications">Publications</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publications" element={<Publications />} />
      </Routes>
    </Router>
  );
}

export default App;
