const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('./auth');

const router = express.Router();

// POST /api/bets
router.post('/', authenticate, async (req, res) => {
  const { matchId, predictedScore1, predictedScore2 } = req.body;
  const userId = req.user.id;

  if (matchId === undefined || predictedScore1 === undefined || predictedScore2 === undefined) {
    return res.status(400).json({ error: 'matchId, predictedScore1, predictedScore2 required' });
  }

  const s1 = parseInt(predictedScore1);
  const s2 = parseInt(predictedScore2);

  if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
    return res.status(400).json({ error: 'Scores must be non-negative numbers' });
  }

  try {
    // Check match status
    const matchResult = await pool.query('SELECT status FROM matches WHERE id = $1', [matchId]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    if (matchResult.rows[0].status === 'finished') {
      return res.status(400).json({ error: 'Cannot bet on a finished match' });
    }

    // Upsert bet
    const result = await pool.query(
      `INSERT INTO bets (user_id, match_id, predicted_score1, predicted_score2, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET predicted_score1 = $3, predicted_score2 = $4, updated_at = NOW()
       RETURNING *`,
      [userId, matchId, s1, s2]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Place bet error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/bets/leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.username,
        COALESCE(SUM(b.points_earned), 0) AS "totalPoints",
        COUNT(CASE WHEN b.points_earned = 5 THEN 1 END) AS "correctScores",
        COUNT(CASE WHEN b.points_earned = 3 THEN 1 END) AS "correctWinners",
        COUNT(CASE WHEN b.points_earned = 1 THEN 1 END) AS "correctDraws",
        COUNT(b.id) AS "totalBets"
      FROM users u
      LEFT JOIN bets b ON b.user_id = u.id
      GROUP BY u.id, u.username
      ORDER BY "totalPoints" DESC, "correctScores" DESC, "correctWinners" DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
