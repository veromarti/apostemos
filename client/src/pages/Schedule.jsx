import React, { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import MatchCard from '../components/MatchCard.jsx'
import BetModal from '../components/BetModal.jsx'
import { getMatches, placeBet, updateResult } from '../api.js'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const KNOCKOUT_STAGES = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', '3rd Place', 'Final']

export default function Schedule({ user, setUser }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mainTab, setMainTab] = useState('group')
  const [activeGroup, setActiveGroup] = useState('A')
  const [betModal, setBetModal] = useState(null) // { match }
  const [resultModal, setResultModal] = useState(null) // { match }

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    setLoading(true)
    setError('')
    try {
      const data = await getMatches()
      if (Array.isArray(data)) {
        setMatches(data)
      } else {
        setError(data.error || 'Failed to load matches')
      }
    } catch {
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBet(score1, score2) {
    if (!betModal) return
    try {
      const result = await placeBet(betModal.match.id, score1, score2)
      if (result.error) {
        alert(result.error)
        return
      }
      setBetModal(null)
      loadMatches()
    } catch (err) {
      alert('Failed to save bet')
    }
  }

  async function handleSaveResult(score1, score2) {
    if (!resultModal) return
    try {
      const result = await updateResult(resultModal.match.id, score1, score2)
      if (result.error) {
        alert(result.error)
        return
      }
      setResultModal(null)
      loadMatches()
    } catch {
      alert('Failed to update result')
    }
  }

  const groupMatches = matches.filter(m => m.stage === 'Group Stage' && m.group_name === activeGroup)

  const knockoutByStage = {}
  for (const stage of KNOCKOUT_STAGES) {
    knockoutByStage[stage] = matches.filter(m => m.stage === stage)
  }

  return (
    <div className="app">
      <Header user={user} setUser={setUser} />
      <main className="page-content">
        <div className="tabs">
          <button
            className={`tab ${mainTab === 'group' ? 'active' : ''}`}
            onClick={() => setMainTab('group')}
          >
            Group Stage
          </button>
          <button
            className={`tab ${mainTab === 'knockout' ? 'active' : ''}`}
            onClick={() => setMainTab('knockout')}
          >
            Knockout
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        )}

        {error && !loading && (
          <div className="error-msg">{error}</div>
        )}

        {!loading && !error && mainTab === 'group' && (
          <>
            <div className="group-tabs">
              {GROUPS.map(g => (
                <button
                  key={g}
                  className={`group-pill ${activeGroup === g ? 'active' : ''}`}
                  onClick={() => setActiveGroup(g)}
                >
                  Grupo {g}
                </button>
              ))}
            </div>
            <div className="section-label">Group {activeGroup} Matches</div>
            {groupMatches.length === 0 && (
              <div className="no-data">No matches found for Group {activeGroup}</div>
            )}
            {groupMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                user={user}
                onBet={() => setBetModal({ match })}
                onResult={() => setResultModal({ match })}
              />
            ))}
          </>
        )}

        {!loading && !error && mainTab === 'knockout' && (
          <>
            {KNOCKOUT_STAGES.map(stage => {
              const stageMatches = knockoutByStage[stage] || []
              if (stageMatches.length === 0) return null
              return (
                <div key={stage} className="knockout-section">
                  <div className="knockout-section-title">{stage}</div>
                  {stageMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      user={user}
                      onBet={() => setBetModal({ match })}
                      onResult={() => setResultModal({ match })}
                    />
                  ))}
                </div>
              )
            })}
          </>
        )}
      </main>

      {betModal && (
        <BetModal
          match={betModal.match}
          existingBet={
            betModal.match.bet_id
              ? {
                  predicted_score1: betModal.match.predicted_score1,
                  predicted_score2: betModal.match.predicted_score2,
                }
              : null
          }
          onSave={handleSaveBet}
          onClose={() => setBetModal(null)}
        />
      )}

      {resultModal && (
        <BetModal
          match={resultModal.match}
          existingBet={
            resultModal.match.score1 !== null
              ? {
                  predicted_score1: resultModal.match.score1,
                  predicted_score2: resultModal.match.score2,
                }
              : null
          }
          isResult={true}
          onSave={handleSaveResult}
          onClose={() => setResultModal(null)}
        />
      )}
    </div>
  )
}
