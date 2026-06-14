const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

router.post('/', authenticate, async (req, res) => {
  const { matchId, predictedScore1, predictedScore2 } = req.body;
  try {
    const match = await pool.query('SELECT * FROM matches WHERE id=$1', [matchId]);
    if (!match.rows[0]) return res.status(404).json({ error: 'Match not found' });
    if (match.rows[0].status === 'finished') return res.status(400).json({ error: 'El partido ya terminó' });
    // Lock bets once match has started (times stored as local North American time, treated as UTC-5)
    const m = match.rows[0];
    if (m.match_date && m.match_time && m.match_time !== 'TBD') {
      const matchStart = new Date(`${m.match_date}T${m.match_time}:00-05:00`);
      const deadline = matchStart.getTime() + 10 * 60 * 1000;
      if (Date.now() >= deadline) {
        return res.status(400).json({ error: 'El plazo para apostar en este partido ya venció' });
      }
    }

    const result = await pool.query(`
      INSERT INTO bets (user_id, match_id, predicted_score1, predicted_score2)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, match_id) DO UPDATE
      SET predicted_score1=$3, predicted_score2=$4, updated_at=NOW()
      RETURNING *
    `, [req.user.id, matchId, predictedScore1, predictedScore2]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.username,
        COALESCE(SUM(b.points_earned), 0) as "totalPoints",
        COUNT(CASE WHEN b.points_earned = 12 THEN 1 END) as "exactScores",
        COUNT(CASE WHEN b.points_earned = 7 THEN 1 END) as "winnerAndScore",
        COUNT(CASE WHEN b.points_earned = 5 THEN 1 END) as "correctOutcome",
        COUNT(CASE WHEN b.points_earned = 2 THEN 1 END) as "oneScore",
        COUNT(b.id) as "totalBets"
      FROM users u
      LEFT JOIN bets b ON b.user_id = u.id
      GROUP BY u.id, u.username
      ORDER BY "totalPoints" DESC, u.username ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
