import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowsClockwise,
  HardDrive
} from '@phosphor-icons/react';
import { fetchDataInspector } from '../services/truthOrDareApi';

type Tab = 'overview' | 'answers' | 'sessions' | 'turns' | 'evidence';

export const DataInspector: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const loadData = async () => {
    setLoading(true);
    const res = await fetchDataInspector();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <span className="badge badge-cobalt" style={{ marginBottom: '6px' }}>SYSTEM & DATA INSPECTOR</span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Stored Data Explorer
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Yahan par aap database ke saare records, answer trees aur uploaded evidence live dekh sakte hain:
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn btn-outline"
          style={{ padding: '8px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowsClockwise size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Storage Path Location Box */}
      <div
        className="card"
        style={{
          padding: '16px',
          backgroundColor: '#FFFFFF',
          marginBottom: '18px',
          borderLeft: '5px solid var(--color-cobalt)',
          boxShadow: 'var(--shadow-retro)'
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} weight="bold" color="var(--color-cobalt)" />
          <span>Physical Storage Locations On Your Computer</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontWeight: 800, display: 'block', color: 'var(--color-graphite)' }}>
              1. SQLite Database:
            </span>
            <code style={{ fontSize: '0.78rem', color: 'var(--color-cobalt)', wordBreak: 'break-all' }}>
              server/data/truth_or_dare.db
            </code>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontWeight: 800, display: 'block', color: 'var(--color-graphite)' }}>
              2. Private Media Recordings:
            </span>
            <code style={{ fontSize: '0.78rem', color: 'var(--color-coral)', wordBreak: 'break-all' }}>
              server/uploads/private/tod/
            </code>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--color-ivory)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontWeight: 800, display: 'block', color: 'var(--color-graphite)' }}>
              3. Browser Client Storage:
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              IndexedDB (Notebook, Diary & Court verdicts)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '18px', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          Overview & Stats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('answers')}
          className={`btn ${activeTab === 'answers' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          🌳 Answer Trees ({data?.counts?.answerTreeNodes || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          🎮 Sessions ({data?.counts?.gameSessions || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('turns')}
          className={`btn ${activeTab === 'turns' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          🎲 Turns ({data?.counts?.gameTurns || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`btn ${activeTab === 'evidence' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          🎥 Media Evidence ({data?.counts?.evidenceFiles || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div className="card" style={{ padding: '16px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL SESSIONS</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-cobalt)', margin: '4px 0' }}>
              {data?.counts?.gameSessions || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solo & Multiplayer</span>
          </div>

          <div className="card" style={{ padding: '16px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TREE ANSWER NODES</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-lime)', margin: '4px 0' }}>
              {data?.counts?.answerTreeNodes || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tree Branches</span>
          </div>

          <div className="card" style={{ padding: '16px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TURNS PLAYED</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-graphite)', margin: '4px 0' }}>
              {data?.counts?.gameTurns || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded in SQLite</span>
          </div>

          <div className="card" style={{ padding: '16px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>MEDIA RECORDINGS</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-coral)', margin: '4px 0' }}>
              {data?.counts?.evidenceFiles || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audio & Video Files</span>
          </div>
        </div>
      )}

      {/* TAB 2: ANSWER TREES */}
      {activeTab === 'answers' && (
        <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitFork size={20} weight="bold" color="var(--color-cobalt)" />
            <span>Recorded Answer Nodes & Branches</span>
          </h2>

          {data?.recentAnswers?.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              Abhi tak koi text answer save nahi hua hai. Truth or Dare mein card ka answer submit karein!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data?.recentAnswers?.map((ans: any) => (
                <div
                  key={ans.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--color-ivory)',
                    marginLeft: ans.parent_id ? '16px' : '0px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-cobalt">{ans.prompt_type.toUpperCase()}</span>
                      <span className="badge badge-lime">Branch L{ans.branch_level}</span>
                      <strong style={{ fontSize: '0.85rem' }}>{ans.player_name}</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(ans.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>
                    Prompt: "{ans.prompt_text}"
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--color-graphite)', fontWeight: 600 }}>
                    👉 {ans.answer_text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GAME SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
            Recent Game Sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentSessions?.map((s: any) => (
              <div
                key={s.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.84rem'
                }}
              >
                <div>
                  <span className="badge badge-lime" style={{ marginRight: '6px' }}>{s.mode.toUpperCase()}</span>
                  <span style={{ fontWeight: 800 }}>Rounds: {s.total_rounds}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '10px' }}>
                    Status: {s.status}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(s.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TURNS */}
      {activeTab === 'turns' && (
        <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
            Turn Actions & Scores
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentTurns?.map((t: any) => (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge badge-cobalt">{t.prompt_type.toUpperCase()}</span>
                  <span className="badge badge-lime">+{t.awarded_points} Pts</span>
                </div>
                <div>Status: <strong>{t.submitted_status}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EVIDENCE FILES */}
      {activeTab === 'evidence' && (
        <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
            Uploaded Media Evidence Files
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.recentEvidence?.map((e: any) => (
              <div
                key={e.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--color-ivory)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-coral">{e.evidence_type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {Math.round(e.file_size / 1024)} KB • {e.duration}s
                  </span>
                </div>

                {e.evidence_type === 'video' ? (
                  <video
                    src={e.viewUrl}
                    controls
                    style={{ width: '100%', maxHeight: '200px', borderRadius: '4px', marginTop: '6px' }}
                  />
                ) : (
                  <audio src={e.viewUrl} controls style={{ width: '100%', marginTop: '6px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
