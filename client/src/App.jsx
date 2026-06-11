import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Schedule from './pages/Schedule.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getStoredUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const user = decodeToken(token);
  if (!user) localStorage.removeItem('token');
  return user;
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());

  const handleSetUser = useCallback((u) => setUser(u), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/schedule" replace /> : <Login setUser={handleSetUser} />} />
        <Route path="/schedule" element={<PrivateRoute user={user}><Schedule user={user} setUser={handleSetUser} /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute user={user}><Leaderboard user={user} setUser={handleSetUser} /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/schedule" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
