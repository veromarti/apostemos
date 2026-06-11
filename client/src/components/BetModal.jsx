import React, { useState } from 'react';
import { placeBet } from '../api.js';

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

export default function BetModal({ match, onClose, onSave }) {
  const [score1, setScore1] = useState(match.predicted_score1 ?? 0);
  const [score2, setScore2] = useState(match.predicted_score2 ?? 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await placeBet(match.id, parseInt(score1), parseInt(score2));
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>🎯 Tu Apuesta</h2>
        <p className="modal-match-title">
          {FLAGS[match.team1] || '🏳️'} {match.team1} vs {match.team2} {FLAGS[match.team2] || '🏳️'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="result-inputs">
            <div className="form-group">
              <label>{match.team1}</label>
              <input
                type="number"
                min="0"
                max="20"
                value={score1}
                onChange={e => setScore1(e.target.value)}
                onFocus={e => e.target.select()}
              />
            </div>
            <span className="result-vs">-</span>
            <div className="form-group">
              <label>{match.team2}</label>
              <input
                type="number"
                min="0"
                max="20"
                value={score2}
                onChange={e => setScore2(e.target.value)}
                onFocus={e => e.target.select()}
              />
            </div>
          </div>
          <div className="points-legend">
            <p>⚽ Resultado exacto = 5 pts</p>
            <p>✅ Ganador correcto = 3 pts</p>
            <p>🤝 Empate correcto = 1 pt</p>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Apuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
