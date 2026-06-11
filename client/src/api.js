const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get user');
  return data;
}

export async function getMatches() {
  const res = await fetch(`${BASE_URL}/api/matches`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get matches');
  return data;
}

export async function placeBet(matchId, predictedScore1, predictedScore2) {
  const res = await fetch(`${BASE_URL}/api/bets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ matchId, predictedScore1, predictedScore2 })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place bet');
  return data;
}

export async function updateResult(matchId, score1, score2) {
  const res = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ score1, score2 })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update result');
  return data;
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/api/bets/leaderboard`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get leaderboard');
  return data;
}
