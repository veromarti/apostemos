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
          <>
          <div className="leaderboard-card">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Puntos</th>
                  <th title="Marcador exacto (12pts)">⚽ Exacto</th>
                  <th title="Ganador + un marcador exacto (7pts)">✅ Ganador+</th>
                  <th title="Ganador/empate correcto (5pts)">👍 Ganador</th>
                  <th title="Un marcador exacto, ganador incorrecto (2pts)">🎯 Un gol</th>
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
                    <td>{player.exactScores}</td>
                    <td>{player.winnerAndScore}</td>
                    <td>{player.correctOutcome}</td>
                    <td>{player.oneScore}</td>
                    <td>{player.totalBets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scoring-guide-card">
            <h2 className="scoring-guide-title">🏅 Sistema de Puntos</h2>
            <div className="scoring-guide-rows">
              <div className="scoring-guide-row"><span className="sg-icon">⚽</span><span className="sg-desc">Marcador exacto</span><span className="sg-pts">12 pts</span></div>
              <div className="scoring-guide-row"><span className="sg-icon">✅</span><span className="sg-desc">Ganador correcto + goles de un equipo exactos</span><span className="sg-pts">7 pts</span></div>
              <div className="scoring-guide-row"><span className="sg-icon">👍</span><span className="sg-desc">Ganador/empate correcto (ningún gol exacto)</span><span className="sg-pts">5 pts</span></div>
              <div className="scoring-guide-row"><span className="sg-icon">🎯</span><span className="sg-desc">Goles de un equipo exactos, ganador incorrecto</span><span className="sg-pts">2 pts</span></div>
              <div className="scoring-guide-row"><span className="sg-icon">❌</span><span className="sg-desc">Sin aciertos</span><span className="sg-pts">0 pts</span></div>
            </div>
            <p className="scoring-guide-example">
              Resultado oficial <strong>3 – 1</strong>: &nbsp;
              3-1 → <strong>12</strong> &nbsp;·&nbsp;
              3-0 → <strong>7</strong> &nbsp;·&nbsp;
              2-0 → <strong>5</strong> &nbsp;·&nbsp;
              0-1 → <strong>2</strong> &nbsp;·&nbsp;
              0-0 → <strong>0</strong>
            </p>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
