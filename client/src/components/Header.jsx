import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

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
          <button className="nav-link points-guide-btn" onClick={() => setShowGuide(v => !v)}>
            🏅 Puntos
          </button>
        </nav>
        <div className="header-user">
          <span className="user-name">{user?.username}</span>
          {user?.is_admin && <span className="admin-badge">Admin</span>}
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </div>
      {showGuide && (
        <div className="points-guide">
          <button className="points-guide-close" onClick={() => setShowGuide(false)}>✕</button>
          <h3>Sistema de Puntos</h3>
          <table className="points-guide-table">
            <tbody>
              <tr><td>⚽</td><td>Marcador exacto</td><td className="pts-val">12 pts</td></tr>
              <tr><td>✅</td><td>Ganador + un marcador exacto</td><td className="pts-val">7 pts</td></tr>
              <tr><td>👍</td><td>Ganador/empate correcto</td><td className="pts-val">5 pts</td></tr>
              <tr><td>🎯</td><td>Un gol exacto (ganador incorrecto)</td><td className="pts-val">2 pts</td></tr>
              <tr><td>❌</td><td>Sin aciertos</td><td className="pts-val">0 pts</td></tr>
            </tbody>
          </table>
          <p className="points-guide-example">Ej. resultado 3-1 &nbsp;→&nbsp; 3-1: 12 · 3-0: 7 · 2-0: 5 · 0-1: 2 · 0-0: 0</p>
        </div>
      )}
    </header>
  );
}
