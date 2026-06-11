import React from 'react'

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
  'TBD': '🏳️',
}

function flag(team) {
  return FLAGS[team] || '🏳️'
}

function PointsBadge({ points }) {
  if (points === null || points === undefined) return null
  const cls = points === 5 ? 'points-5' : points === 3 ? 'points-3' : points === 1 ? 'points-1' : 'points-0'
  const label = points === 5 ? '⭐ 5pts' : points === 3 ? '✅ 3pts' : points === 1 ? '🤝 1pt' : '❌ 0pts'
  return <span className={`points-badge ${cls}`}>{label}</span>
}

export default function MatchCard({ match, user, onBet, onResult }) {
  const finished = match.status === 'finished'
  const hasBet = match.bet_id !== null && match.bet_id !== undefined
  const isAdmin = user && user.is_admin

  return (
    <div className={`match-card ${finished ? 'finished' : ''}`}>
      <div className="match-header">
        <div className="match-teams">
          <div className="team">
            <span className="team-flag">{flag(match.team1)}</span>
            <span className="team-name">{match.team1}</span>
          </div>
          {finished ? (
            <div className="score-display">
              <span>{match.score1}</span>
              <span className="score-divider">—</span>
              <span>{match.score2}</span>
            </div>
          ) : (
            <span className="match-vs">vs</span>
          )}
          <div className="team">
            <span className="team-flag">{flag(match.team2)}</span>
            <span className="team-name">{match.team2}</span>
          </div>
        </div>
      </div>

      <div className="match-meta">
        {match.match_date && match.match_date !== 'TBD' && (
          <span>📅 {match.match_date}</span>
        )}
        {match.match_time && match.match_time !== 'TBD' && (
          <span>🕐 {match.match_time}</span>
        )}
        {match.venue && match.venue !== 'TBD' && (
          <span>🏟️ {match.venue}</span>
        )}
        {match.city && match.city !== 'TBD' && (
          <span>📍 {match.city}{match.country && match.country !== 'TBD' ? `, ${match.country}` : ''}</span>
        )}
      </div>

      <div className="match-footer">
        <div className="bet-display">
          {hasBet && (
            <>
              <span className="bet-label">Your bet:</span>
              <span className="bet-score">
                {match.predicted_score1} — {match.predicted_score2}
              </span>
              {finished && <PointsBadge points={match.points_earned} />}
            </>
          )}
          {!hasBet && !finished && (
            <span className="bet-label" style={{ fontStyle: 'italic' }}>No bet placed</span>
          )}
          {!hasBet && finished && (
            <span className="bet-label" style={{ fontStyle: 'italic' }}>No bet</span>
          )}
        </div>

        <div className="match-actions">
          {!finished && (
            <button className="btn btn-primary btn-sm" onClick={onBet}>
              {hasBet ? '✏️ Edit Bet' : '+ Place Bet'}
            </button>
          )}
          {finished && !hasBet && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Finished</span>
          )}
          {isAdmin && (
            <button className="btn btn-admin btn-sm" onClick={onResult}>
              {finished ? '✏️ Edit Result' : '⚡ Enter Result'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
