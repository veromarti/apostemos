import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import MatchCard from '../components/MatchCard.jsx';
import BetModal from '../components/BetModal.jsx';
import { getMatches, placeBet, updateResult } from '../api.js';

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function Schedule({ user, setUser }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('group');
  const [activeGroup, setActiveGroup] = useState('A');
  const [betModal, setBetModal] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [resultScore, setResultScore] = useState({ score1: 0, score2: 0 });
  const [error, setError] = useState('');

  async function loadMatches() {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMatches(); }, []);

  async function handleResultSubmit(e) {
    e.preventDefault();
    try {
      await updateResult(resultModal.id, parseInt(resultScore.score1), parseInt(resultScore.score2));
      setResultModal(null);
      loadMatches();
    } catch (err) {
      setError(err.message);
    }
  }

  const groupMatches = matches.filter(m => m.stage === 'Group Stage' && m.group_name === activeGroup);
  const knockoutMatches = matches.filter(m => m.stage !== 'Group Stage');
  const knockoutStages = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', '3rd Place', 'Final'];

  return (
    <div className="page">
      <Header user={user} setUser={setUser} />
      <div className="container">
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Fase de Grupos
          </button>
          <button
            className={`tab-btn ${activeTab === 'knockout' ? 'active' : ''}`}
            onClick={() => setActiveTab('knockout')}
          >
            Eliminatorias
          </button>
        </div>

        {activeTab === 'group' && (
          <>
            <div className="group-tab-bar">
              {GROUPS.map(g => (
                <button
                  key={g}
                  className={`group-tab-btn ${activeGroup === g ? 'active' : ''}`}
                  onClick={() => setActiveGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="loading-container"><div className="loading-spinner"></div></div>
            ) : (
              <div className="matches-list">
                <h2 className="group-heading">Grupo {activeGroup}</h2>
                {groupMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    user={user}
                    onBet={() => setBetModal(match)}
                    onResult={() => {
                      setResultModal(match);
                      setResultScore({ score1: match.score1 ?? 0, score2: match.score2 ?? 0 });
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'knockout' && (
          <div className="matches-list">
            {loading ? (
              <div className="loading-container"><div className="loading-spinner"></div></div>
            ) : (
              knockoutStages.map(stage => {
                const stageMatches = knockoutMatches.filter(m => m.stage === stage);
                if (stageMatches.length === 0) return null;
                return (
                  <div key={stage}>
                    <h2 className="group-heading">{stage}</h2>
                    {stageMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        user={user}
                        onBet={() => setBetModal(match)}
                        onResult={() => {
                          setResultModal(match);
                          setResultScore({ score1: match.score1 ?? 0, score2: match.score2 ?? 0 });
                        }}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>

      {betModal && (
        <BetModal
          match={betModal}
          existingBet={betModal.bet_id ? { predicted_score1: betModal.predicted_score1, predicted_score2: betModal.predicted_score2 } : null}
          onClose={() => setBetModal(null)}
          onSave={async (s1, s2) => {
            try {
              await placeBet(betModal.id, s1, s2);
              setBetModal(null);
              loadMatches();
            } catch (err) {
              setError(err.message);
            }
          }}
        />
      )}

      {resultModal && user?.is_admin && (
        <div className="modal-overlay" onClick={() => setResultModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Ingresar Resultado</h2>
            <p className="modal-match-title">{resultModal.team1} vs {resultModal.team2}</p>
            <form onSubmit={handleResultSubmit}>
              <div className="result-inputs">
                <div className="form-group">
                  <label>{resultModal.team1}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={resultScore.score1}
                    onChange={e => setResultScore(s => ({ ...s, score1: e.target.value }))}
                  />
                </div>
                <span className="result-vs">-</span>
                <div className="form-group">
                  <label>{resultModal.team2}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={resultScore.score2}
                    onChange={e => setResultScore(s => ({ ...s, score2: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setResultModal(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
