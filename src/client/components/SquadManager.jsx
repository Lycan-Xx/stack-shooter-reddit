import { useState, useEffect } from 'react';
import './SquadManager.css';

export default function SquadManager({ onClose }) {
  const [view, setView] = useState('main'); // main, create, squad, leaderboard
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create squad form
  const [squadName, setSquadName] = useState('');
  const [squadTag, setSquadTag] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadSquadData();
  }, []);

  const loadSquadData = async () => {
    setLoading(true);
    try {
      const [squadRes, leaderboardRes] = await Promise.all([
        fetch('/api/squad/my'),
        fetch('/api/squad/leaderboard'),
      ]);

      const squadData = await squadRes.json();
      const leaderboardData = await leaderboardRes.json();

      if (squadData.success && squadData.squad) {
        setSquad(squadData.squad);
        loadSquadMembers(squadData.squad.id);
      }

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error('Error loading squad data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSquadMembers = async (squadId) => {
    try {
      const response = await fetch(`/api/squad/${squadId}/members`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error loading squad members:', error);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!squadName || !squadTag) {
      setCreateError('Please fill in all fields');
      return;
    }

    if (!/^[A-Z]{3,4}$/.test(squadTag)) {
      setCreateError('Tag must be 3-4 uppercase letters');
      return;
    }

    try {
      const response = await fetch('/api/squad/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: squadName, tag: squadTag }),
      });

      const data = await response.json();

      if (data.success) {
        setSquad(data.squad);
        setView('squad');
        loadSquadData();
      } else {
        setCreateError(data.error || 'Failed to create squad');
      }
    } catch (error) {
      console.error('Error creating squad:', error);
      setCreateError('Failed to create squad');
    }
  };

  const handleLeaveSquad = async () => {
    if (!confirm('Are you sure you want to leave your squad?')) return;

    try {
      const response = await fetch('/api/squad/leave', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSquad(null);
        setMembers([]);
        setView('main');
      }
    } catch (error) {
      console.error('Error leaving squad:', error);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="squad-overlay">
        <div className="squad-modal">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="squad-overlay">
      <div className="squad-modal">
        <div className="squad-header">
          <h2>👥 Squads</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="squad-tabs">
          <button
            className={`tab-btn ${view === 'main' || view === 'squad' ? 'active' : ''}`}
            onClick={() => setView(squad ? 'squad' : 'main')}
          >
            {squad ? 'My Squad' : 'Join/Create'}
          </button>
          <button
            className={`tab-btn ${view === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setView('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        <div className="squad-content">
          {/* Main View - No Squad */}
          {view === 'main' && !squad && (
            <div className="no-squad-view">
              <div className="info-section">
                <h3>What are Squads?</h3>
                <p>
                  Join forces with friends! Create or join a squad to combine your scores and
                  compete on the squad leaderboard. Every game you play contributes to your
                  squad's total score.
                </p>
              </div>

              <div className="action-buttons">
                <button className="btn primary-btn" onClick={() => setView('create')}>
                  ➕ Create Squad
                </button>
                <p className="hint">Or ask a friend for a squad invite link!</p>
              </div>
            </div>
          )}

          {/* Create Squad View */}
          {view === 'create' && (
            <div className="create-squad-view">
              <h3>Create Your Squad</h3>
              <form onSubmit={handleCreateSquad}>
                <div className="form-group">
                  <label>Squad Name</label>
                  <input
                    type="text"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    placeholder="Enter squad name"
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label>Squad Tag (3-4 letters)</label>
                  <input
                    type="text"
                    value={squadTag}
                    onChange={(e) => setSquadTag(e.target.value.toUpperCase())}
                    placeholder="TAG"
                    maxLength={4}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <small>Example: VAMP, HUNT, SLYR</small>
                </div>

                {createError && <div className="error-message">{createError}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn primary-btn">
                    Create Squad
                  </button>
                  <button
                    type="button"
                    className="btn secondary-btn"
                    onClick={() => setView('main')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Squad View */}
          {view === 'squad' && squad && (
            <div className="squad-view">
              <div className="squad-info-card">
                <div className="squad-tag">[{squad.tag}]</div>
                <div className="squad-name">{squad.name}</div>
                <div className="squad-stats">
                  <div className="stat">
                    <span className="stat-label">Total Score</span>
                    <span className="stat-value">{squad.totalScore.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Kills</span>
                    <span className="stat-value">{squad.totalKills.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{squad.members.length}/{squad.memberLimit}</span>
                  </div>
                </div>
              </div>

              <div className="members-section">
                <h3>Squad Members</h3>
                <div className="members-list">
                  {members.map((member, index) => (
                    <div key={member.username} className="member-card">
                      <div className="member-rank">#{index + 1}</div>
                      <div className="member-info">
                        <div className="member-name">
                          {member.username}
                          {member.username === squad.creator && (
                            <span className="creator-badge">👑</span>
                          )}
                        </div>
                        <div className="member-stats">
                          {member.contribution.toLocaleString()} pts • {member.kills} kills
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn danger-btn" onClick={handleLeaveSquad}>
                Leave Squad
              </button>
            </div>
          )}

          {/* Leaderboard View */}
          {view === 'leaderboard' && (
            <div className="leaderboard-view">
              <h3>🏆 Squad Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <div className="empty-state">
                  <p>No squads yet. Be the first to create one!</p>
                </div>
              ) : (
                <div className="squad-leaderboard-list">
                  {leaderboard.map((entry) => (
                    <div key={entry.squad.id} className="squad-leaderboard-entry">
                      <div className="entry-rank">{getMedalEmoji(entry.rank)}</div>
                      <div className="entry-info">
                        <div className="entry-name">
                          <span className="entry-tag">[{entry.squad.tag}]</span>
                          {entry.squad.name}
                        </div>
                        <div className="entry-members">{entry.squad.members.length} members</div>
                      </div>
                      <div className="entry-score">{entry.squad.totalScore.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
