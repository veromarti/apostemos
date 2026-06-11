import React, { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { getLeaderboard } from '../api.js'

export default function Leaderboard({ user, setUser }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    setError('')
    try {
      const data = await getLeaderboard()
      if (Array.isArray(data)) {
        setRows(data)
      } else {
        setError(data.error || 'Failed to load leaderboard')
      }
    } catch {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  function rankDisplay(i) {
    if (i === 0) return { label: '🥇', cls: 'rank-1' }
    if (i === 1) return { label: '🥈', cls: 'rank-2' }
    if (i === 2) return { label: '🥉', cls: 'rank-3' }
    return { label: `${i + 1}`, cls: '' }
  }

  return (
    <div className="app">
      <Header user={user} setUser={setUser} />
      <main className="page-content">
        <div className="leaderboard-header">
          <div className="leaderboard-title">🏆 Clasificación</div>
          <div className="leaderboard-subtitle">¡La apuesta es un viaje!</div>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        )}

        {error && !loading && (
          <div className="error-msg">{error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="no-data">No players yet</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Points</th>
                  <th title="Exact score — 5 pts each">⭐ 5pts</th>
                  <th title="Correct winner — 3 pts each">✅ 3pts</th>
                  <th title="Correct draw — 1 pt each">🤝 1pt</th>
                  <th>Bets</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const { label, cls } = rankDisplay(i)
                  return (
                    <tr key={row.username} className={i === 0 ? 'leader' : ''}>
                      <td className={`rank-cell ${cls}`}>{label}</td>
                      <td className="username-cell">{row.username}</td>
                      <td className="points-cell">{row.totalPoints}</td>
                      <td className="stat-cell">{row.correctScores}</td>
                      <td className="stat-cell">{row.correctWinners}</td>
                      <td className="stat-cell">{row.correctDraws}</td>
                      <td className="stat-cell">{row.totalBets}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
