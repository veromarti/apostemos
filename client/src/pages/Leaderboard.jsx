import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { getLeaderboard } from '../api.js';

export default function Leaderboard({ user, setUser }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Header user={user} setUser={setUser} />
      <div className="container">
        <div className="leaderboard-header">
          <h1>🏆 Clasificación</h1>
          <p className="leaderboard-subtitle">¡La apuesta es un viaje!</p>
        </div>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div></div>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : (
          <div className="leaderboard-card">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Puntos</th>
                  <th title="Resultado Exacto (5pts)">⚽ Exactos</th>
                  <th title="Ganador Correcto (3pts)">✅ Ganador</th>
                  <th title="Empate Correcto (1pt)">🤝 Empate</th>
                  <th>Apuestas</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={player.username} className={player.username === user?.username ? 'current-user' : ''}>
                    <td className="rank-cell">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="player-cell">{player.username}</td>
                    <td className="points-cell">{player.totalPoints}</td>
                    <td>{player.correctScores}</td>
                    <td>{player.correctWinners}</td>
                    <td>{player.correctDraws}</td>
                    <td>{player.totalBets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
