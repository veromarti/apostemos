import React, { useState, useEffect } from 'react'

export default function BetModal({ match, existingBet, isResult, onSave, onClose }) {
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')

  useEffect(() => {
    if (existingBet) {
      setScore1(String(existingBet.predicted_score1))
      setScore2(String(existingBet.predicted_score2))
    } else {
      setScore1('0')
      setScore2('0')
    }
  }, [existingBet])

  function handleSave() {
    const s1 = parseInt(score1)
    const s2 = parseInt(score2)
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert('Please enter valid scores (0 or higher)')
      return
    }
    onSave(s1, s2)
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const title = isResult ? 'Enter Match Result' : (existingBet ? 'Edit Your Bet' : 'Place Your Bet')
  const subtitle = `${match.team1} vs ${match.team2}`

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-title">{title}</div>
        <div className="modal-subtitle">{subtitle}</div>

        <div className="score-inputs">
          <div className="score-input-group">
            <div className="score-input-label">{match.team1}</div>
            <input
              className="score-input"
              type="number"
              min="0"
              max="20"
              value={score1}
              onChange={e => setScore1(e.target.value)}
              onFocus={e => e.target.select()}
            />
          </div>
          <div className="score-dash">—</div>
          <div className="score-input-group">
            <div className="score-input-label">{match.team2}</div>
            <input
              className="score-input"
              type="number"
              min="0"
              max="20"
              value={score2}
              onChange={e => setScore2(e.target.value)}
              onFocus={e => e.target.select()}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isResult ? 'Save Result' : 'Save Bet'}
          </button>
        </div>
      </div>
    </div>
  )
}
