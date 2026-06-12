import React from 'react';

const FLAGS = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Czechia': '🇨🇿', 'South Korea': '🇰🇷',
  'Canada': '🇨🇦', 'Bosnia-Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷',
  'Germany': '🇩🇪', 'Ivory Coast': '🇨🇮', 'Curaçao': '🇨🇼', 'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Sweden': '🇸🇪', 'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spain': '🇪🇸', 'Uruguay': '🇺🇾', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦',
  'France': '🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway': '🇳🇴',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Austria': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'Colombia': '🇨🇴', 'Congo DR': '🇨🇩', 'Uzbekistan': '🇺🇿',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croatia': '🇭🇷', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
};

function getFlag(team) {
  return FLAGS[team] || '🏳️';
}

function getPointsBadgeClass(points) {
  if (points === 12) return 'points-badge exact';
  if (points === 7) return 'points-badge winner';
  if (points === 5) return 'points-badge draw';
  if (points === 2) return 'points-badge draw';
  return 'points-badge wrong';
}

export default function MatchCard({ match, user, onBet, onResult }) {
  const finished = match.status === 'finished';
  const locked = match.locked || finished;
  const hasBet = match.predicted_score1 !== null && match.predicted_score1 !== undefined;

  return (
    <div className={`match-card ${finished ? 'finished' : ''}`}>
      <div className="match-meta">
        <span className="match-date">{match.match_date}{match.match_time && match.match_time !== 'TBD' ? ` • ${match.match_time}` : ''}</span>
        {match.venue && match.venue !== 'TBD' && (
          <span className="match-venue">{match.venue}, {match.city}</span>
        )}
      </div>
      <div className="match-teams">
        <div className="team team-left">
          <span className="team-flag">{getFlag(match.team1)}</span>
          <span className="team-name">{match.team1}</span>
        </div>
        <div className="match-score-area">
          {finished ? (
            <span className="actual-score">{match.score1} - {match.score2}</span>
          ) : (
            <span className="vs-text">VS</span>
          )}
        </div>
        <div className="team team-right">
          <span className="team-name">{match.team2}</span>
          <span className="team-flag">{getFlag(match.team2)}</span>
        </div>
      </div>

      <div className="match-footer">
        {hasBet && (
          <div className="bet-info">
            <span className="bet-label">Tu apuesta:</span>
            <span className="bet-score">{match.predicted_score1} - {match.predicted_score2}</span>
            {finished && match.points_earned !== null && (
              <span className={getPointsBadgeClass(match.points_earned)}>
                {match.points_earned === 12 ? '⚽ +12 pts' :
                 match.points_earned === 7 ? '✅ +7 pts' :
                 match.points_earned === 5 ? '👍 +5 pts' :
                 match.points_earned === 2 ? '🎯 +2 pts' : '❌ 0 pts'}
              </span>
            )}
          </div>
        )}
        <div className="match-actions">
          {!locked ? (
            <button className="btn-bet" onClick={onBet}>
              {hasBet ? '✏️ Editar Apuesta' : '🎯 Apostar'}
            </button>
          ) : !finished && (
            <span className="bet-locked">🔒 Cerrado</span>
          )}
          {user?.is_admin && (
            <button className="btn-result" onClick={onResult}>
              {finished ? '✏️ Editar Resultado' : '📋 Resultado'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
