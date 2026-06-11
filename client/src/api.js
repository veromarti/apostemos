const BASE = import.meta.env.VITE_API_URL || '';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
});

export const login = (username, password) =>
  fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ username, password }) }).then(r => r.json());

export const getMe = () =>
  fetch(`${BASE}/api/auth/me`, { headers: headers() }).then(r => r.json());

export const getMatches = () =>
  fetch(`${BASE}/api/matches`, { headers: headers() }).then(r => r.json());

export const placeBet = (matchId, predictedScore1, predictedScore2) =>
  fetch(`${BASE}/api/bets`, { method: 'POST', headers: headers(), body: JSON.stringify({ matchId, predictedScore1, predictedScore2 }) }).then(r => r.json());

export const updateResult = (matchId, score1, score2) =>
  fetch(`${BASE}/api/matches/${matchId}/result`, { method: 'PUT', headers: headers(), body: JSON.stringify({ score1, score2 }) }).then(r => r.json());

export const getLeaderboard = () =>
  fetch(`${BASE}/api/bets/leaderboard`, { headers: headers() }).then(r => r.json());
