const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      match_number INTEGER,
      stage VARCHAR(50),
      group_name VARCHAR(10),
      team1 VARCHAR(100) NOT NULL,
      team2 VARCHAR(100) NOT NULL,
      match_date VARCHAR(30),
      match_time VARCHAR(20),
      venue VARCHAR(100),
      city VARCHAR(100),
      country VARCHAR(50),
      score1 INTEGER DEFAULT NULL,
      score2 INTEGER DEFAULT NULL,
      status VARCHAR(20) DEFAULT 'upcoming'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      match_id INTEGER REFERENCES matches(id),
      predicted_score1 INTEGER NOT NULL,
      predicted_score2 INTEGER NOT NULL,
      points_earned INTEGER DEFAULT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, match_id)
    )
  `);

  // Seed users if not exists
  const saltRounds = 10;

  const veroExists = await pool.query('SELECT id FROM users WHERE username=$1', ['Vero']);
  if (veroExists.rows.length === 0) {
    const hash = await bcrypt.hash('password', saltRounds);
    await pool.query('INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, $3)', ['Vero', hash, true]);
  }

  const joseExists = await pool.query('SELECT id FROM users WHERE username=$1', ['Jose']);
  if (joseExists.rows.length === 0) {
    const hash = await bcrypt.hash('2828jose', saltRounds);
    await pool.query('INSERT INTO users (username, password_hash, is_admin) VALUES ($1, $2, $3)', ['Jose', hash, false]);
  }

  // Seed matches if not exists
  const matchCount = await pool.query('SELECT COUNT(*) FROM matches');
  if (parseInt(matchCount.rows[0].count) === 0) {
    const matches = getAllMatches();
    for (const m of matches) {
      await pool.query(
        'INSERT INTO matches (id, match_number, stage, group_name, team1, team2, match_date, match_time, venue, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [m.id, m.match_number, m.stage, m.group_name, m.team1, m.team2, m.match_date, m.match_time, m.venue, m.city, m.country]
      );
    }
  }

  // Recalculate points for all finished matches using current scoring rules
  const finished = await pool.query("SELECT * FROM matches WHERE status='finished'");
  for (const match of finished.rows) {
    const { id, score1, score2 } = match;
    const bets = await pool.query('SELECT * FROM bets WHERE match_id=$1', [id]);
    for (const bet of bets.rows) {
      const p1 = bet.predicted_score1;
      const p2 = bet.predicted_score2;
      const exactScore = p1 === score1 && p2 === score2;
      const correctOutcome = (p1 > p2 && score1 > score2) || (p1 < p2 && score1 < score2) || (p1 === p2 && score1 === score2);
      const oneScoreMatch = p1 === score1 || p2 === score2;
      let points = 0;
      if (exactScore) points = 12;
      else if (correctOutcome && oneScoreMatch) points = 7;
      else if (correctOutcome) points = 5;
      else if (oneScoreMatch) points = 2;
      await pool.query('UPDATE bets SET points_earned=$1 WHERE id=$2', [points, bet.id]);
    }
  }

  console.log('DB initialized');
}

function getAllMatches() {
  const matches = [];

  // Group stage data: [groupName, [T1, T2, T3, T4], knownMatchData]
  const groups = [
    { name: 'A', teams: ['Mexico', 'South Africa', 'Czechia', 'South Korea'] },
    { name: 'B', teams: ['Canada', 'Bosnia-Herzegovina', 'Qatar', 'Switzerland'] },
    { name: 'C', teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
    { name: 'D', teams: ['USA', 'Paraguay', 'Australia', 'Türkiye'] },
    { name: 'E', teams: ['Germany', 'Ivory Coast', 'Curaçao', 'Ecuador'] },
    { name: 'F', teams: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'] },
    { name: 'G', teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
    { name: 'H', teams: ['Spain', 'Uruguay', 'Cape Verde', 'Saudi Arabia'] },
    { name: 'I', teams: ['France', 'Senegal', 'Iraq', 'Norway'] },
    { name: 'J', teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
    { name: 'K', teams: ['Portugal', 'Colombia', 'Congo DR', 'Uzbekistan'] },
    { name: 'L', teams: ['England', 'Croatia', 'Ghana', 'Panama'] },
  ];

  // Known match details indexed by match ID
  const knownMatches = {
    1:  { match_date: 'June 11, 2026', match_time: '19:00', venue: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico' },
    2:  { match_date: 'June 12, 2026', match_time: '12:00', venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA' },
    7:  { match_date: 'June 12, 2026', match_time: '15:00', venue: 'BMO Field', city: 'Toronto', country: 'Canada' },
    19: { match_date: 'June 12, 2026', match_time: '19:00', venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA' },
    25: { match_date: 'June 14, 2026', match_time: '13:00', venue: 'NRG Stadium', city: 'Houston', country: 'USA' },
    31: { match_date: 'June 14, 2026', match_time: '16:00', venue: 'AT&T Stadium', city: 'Arlington', country: 'USA' },
    37: { match_date: 'June 15, 2026', match_time: '16:00', venue: 'Lumen Field', city: 'Seattle', country: 'USA' },
    38: { match_date: 'June 15, 2026', match_time: '13:00', venue: 'SoFi Stadium', city: 'Los Angeles', country: 'USA' },
    43: { match_date: 'June 15, 2026', match_time: '13:00', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA' },
    44: { match_date: 'June 15, 2026', match_time: '19:00', venue: 'Hard Rock Stadium', city: 'Miami', country: 'USA' },
  };

  // Match order within group: (0-indexed into teams array)
  // 1. T1 vs T2 (0,1)
  // 2. T3 vs T4 (2,3)
  // 3. T1 vs T3 (0,2)
  // 4. T2 vs T4 (1,3)
  // 5. T4 vs T1 (3,0)
  // 6. T2 vs T3 (1,2)
  const matchPairs = [[0,1],[2,3],[0,2],[1,3],[3,0],[1,2]];

  let id = 1;
  groups.forEach(group => {
    const [T1, T2, T3, T4] = group.teams;
    matchPairs.forEach(([i,j], matchIdx) => {
      const teamArr = [T1, T2, T3, T4];
      const known = knownMatches[id] || {};
      matches.push({
        id,
        match_number: matchIdx + 1,
        stage: 'Group Stage',
        group_name: group.name,
        team1: teamArr[i],
        team2: teamArr[j],
        match_date: known.match_date || 'June 11-27, 2026',
        match_time: known.match_time || 'TBD',
        venue: known.venue || 'TBD',
        city: known.city || 'TBD',
        country: known.country || 'TBD',
      });
      id++;
    });
  });

  // Round of 32: IDs 73-88
  for (let i = 73; i <= 88; i++) {
    matches.push({
      id: i, match_number: i - 72, stage: 'Round of 32', group_name: null,
      team1: 'TBD', team2: 'TBD',
      match_date: 'June 28 - July 3, 2026', match_time: 'TBD',
      venue: 'TBD', city: 'TBD', country: 'TBD'
    });
  }

  // Round of 16: IDs 89-96
  for (let i = 89; i <= 96; i++) {
    matches.push({
      id: i, match_number: i - 88, stage: 'Round of 16', group_name: null,
      team1: 'TBD', team2: 'TBD',
      match_date: 'July 5-8, 2026', match_time: 'TBD',
      venue: 'TBD', city: 'TBD', country: 'TBD'
    });
  }

  // Quarter-finals: IDs 97-100
  for (let i = 97; i <= 100; i++) {
    matches.push({
      id: i, match_number: i - 96, stage: 'Quarter-final', group_name: null,
      team1: 'TBD', team2: 'TBD',
      match_date: 'July 11-12, 2026', match_time: 'TBD',
      venue: 'TBD', city: 'TBD', country: 'TBD'
    });
  }

  // Semi-finals: IDs 101-102
  for (let i = 101; i <= 102; i++) {
    matches.push({
      id: i, match_number: i - 100, stage: 'Semi-final', group_name: null,
      team1: 'TBD', team2: 'TBD',
      match_date: 'July 15-16, 2026', match_time: 'TBD',
      venue: 'TBD', city: 'TBD', country: 'TBD'
    });
  }

  // 3rd Place: ID 103
  matches.push({
    id: 103, match_number: 1, stage: '3rd Place', group_name: null,
    team1: 'TBD', team2: 'TBD',
    match_date: 'July 19, 2026', match_time: 'TBD',
    venue: 'TBD', city: 'TBD', country: 'TBD'
  });

  // Final: ID 104
  matches.push({
    id: 104, match_number: 1, stage: 'Final', group_name: null,
    team1: 'TBD', team2: 'TBD',
    match_date: 'July 19, 2026', match_time: 'TBD',
    venue: 'Metlife Stadium', city: 'New Jersey', country: 'USA'
  });

  return matches;
}

module.exports = { pool, initDB };
