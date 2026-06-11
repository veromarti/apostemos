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

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, b.id AS bet_id, b.predicted_score1, b.predicted_score2, b.points_earned
      FROM matches m
      LEFT JOIN bets b ON b.match_id = m.id AND b.user_id = $1
      ORDER BY m.id
    `, [req.user.id]);
    const now = Date.now();
    const rows = result.rows.map(m => {
      let locked = m.status === 'finished';
      if (!locked && m.match_date && m.match_time && m.match_time !== 'TBD') {
        const matchStart = new Date(`${m.match_date}T${m.match_time}:00-05:00`);
        locked = now >= matchStart.getTime();
      }
      return { ...m, locked };
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/result', authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin only' });
  const { score1, score2 } = req.body;
  const matchId = parseInt(req.params.id);
  try {
    await pool.query(
      'UPDATE matches SET score1=$1, score2=$2, status=$3 WHERE id=$4',
      [score1, score2, 'finished', matchId]
    );
    const bets = await pool.query('SELECT * FROM bets WHERE match_id=$1', [matchId]);
    for (const bet of bets.rows) {
      let points = 0;
      const p1 = bet.predicted_score1;
      const p2 = bet.predicted_score2;
      if (p1 === score1 && p2 === score2) {
        points = 5;
      } else if ((p1 > p2 && score1 > score2) || (p1 < p2 && score1 < score2)) {
        points = 3;
      } else if (p1 === p2 && score1 === score2) {
        points = 1;
      }
      await pool.query('UPDATE bets SET points_earned=$1, updated_at=NOW() WHERE id=$2', [points, bet.id]);
    }
    const updated = await pool.query('SELECT * FROM matches WHERE id=$1', [matchId]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
