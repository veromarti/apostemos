import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ user, setUser }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    if (setUser) setUser(null);
    navigate('/login');
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <span className="header-icon">⚽</span>
          <span className="header-title">Apostemos</span>
        </div>
        <nav className="header-nav">
          <Link to="/schedule" className="nav-link">Partidos</Link>
          <Link to="/leaderboard" className="nav-link">Clasificación</Link>
        </nav>
        <div className="header-user">
          <span className="user-name">{user?.username}</span>
          {user?.is_admin && <span className="admin-badge">Admin</span>}
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </div>
    </header>
  );
}
