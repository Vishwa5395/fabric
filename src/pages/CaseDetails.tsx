import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Gavel,
  FolderOpen,
  MagnifyingGlass,
  ChatCircleDots,
  ShieldCheck,
  SealCheck,
  CheckCircle,
  Lock,
  LockOpen,
  WarningCircle,
  Sparkle,
  Quotes,
  Smiley
} from '@phosphor-icons/react';
import { CASE_FILES, CaseFile } from '../data/caseFiles';
import { achievementEngine } from '../services/achievements';
import { audioManager } from '../services/audioManager';

export const CaseDetails: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const currentCase: CaseFile | undefined = CASE_FILES.find(c => c.id === caseId);

  // Investigative state
  const [examinedExhibitIds, setExaminedExhibitIds] = useState<string[]>([]);
  const [scanningExhibitId, setScanningExhibitId] = useState<string | null>(null);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);
  const [activeInterrogationId, setActiveInterrogationId] = useState<string | null>(null);
  const [showVerdict, setShowVerdict] = useState<boolean>(false);
  const [selectedPenalty, setSelectedPenalty] = useState<string>('default');
  const [reactedJokeIds, setReactedJokeIds] = useState<Record<string, number>>({});

  const handleReactJoke = (jokeId: string) => {
    audioManager.playSfx('ding');
    setReactedJokeIds(prev => ({ ...prev, [jokeId]: (prev[jokeId] || 0) + 1 }));
  };

  useEffect(() => {
    if (caseId === 'case-001') {
      achievementEngine.emit('dora_case_opened');
    }
  }, [caseId]);

  if (!currentCase) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div className="card">
          <h2>Ye case file nahi mili.</h2>
          <button
            type="button"
            onClick={() => navigate('/museum')}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            Museum Wapas Jao
          </button>
        </div>
      </div>
    );
  }

  const totalClues = currentCase.evidence.length;
  const examinedCount = examinedExhibitIds.length;
  const totalQuestions = currentCase.interrogation?.length || 0;
  const questionsAskedCount = askedQuestionIds.length;

  // Criteria to unlock verdict: At least 2 clues examined OR (1 clue + 1 interrogation)
  const isVerdictUnlocked = examinedCount >= 2 || (examinedCount >= 1 && questionsAskedCount >= 1);
  const progressPercent = Math.min(100, Math.round(((examinedCount + questionsAskedCount) / (totalClues + totalQuestions)) * 100));

  const handleExamineClue = (exhibitId: string) => {
    if (examinedExhibitIds.includes(exhibitId)) return;
    setScanningExhibitId(exhibitId);
    audioManager.playSfx('ding');

    setTimeout(() => {
      setExaminedExhibitIds(prev => [...prev, exhibitId]);
      setScanningExhibitId(null);
      audioManager.playSfx('achievement');
    }, 600);
  };

  const handleAskQuestion = (qId: string) => {
    setActiveInterrogationId(qId);
    if (!askedQuestionIds.includes(qId)) {
      setAskedQuestionIds(prev => [...prev, qId]);
      audioManager.playSfx('ding');
    }
  };

  const handleDeliverVerdict = () => {
    setShowVerdict(true);
    audioManager.playSfx('badge');
    achievementEngine.emit('dora_case_opened');
  };

  return (
    <div style={{ padding: '20px 16px 80px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/museum')}
        className="btn btn-outline"
        style={{ marginBottom: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Museum Archives Wapas</span>
      </button>

      {/* Chief Investigator Badge Header */}
      <div
        className="card"
        style={{
          marginBottom: '18px',
          borderTop: '6px solid var(--color-cobalt)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-retro)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="badge badge-lime">CASE #{currentCase.caseNo}</span>
          <span className="badge badge-coral">{currentCase.status}</span>
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.25 }}>
          {currentCase.title}
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '14px' }}>
          {currentCase.premise}
        </p>

        {/* Dossier Meta Table */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '8px',
            fontSize: '0.8rem',
            marginBottom: '14px',
            backgroundColor: 'var(--color-ivory)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>LEAD INVESTIGATOR</span>
            <strong>{currentCase.investigator}</strong>
          </div>
          {currentCase.suspect && (
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>PRIMARY SUSPECT</span>
              <strong style={{ color: 'var(--color-coral)' }}>{currentCase.suspect}</strong>
            </div>
          )}
          {currentCase.missingPerson && (
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>MISSING PERSON</span>
              <strong>{currentCase.missingPerson}</strong>
            </div>
          )}
        </div>

        {/* Investigation Live Progress Meter */}
        <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} weight="bold" color="var(--color-cobalt)" />
              Investigation Meter
            </span>
            <span style={{ fontWeight: 800, color: isVerdictUnlocked ? 'var(--color-graphite)' : 'var(--color-coral)' }}>
              {examinedCount}/{totalClues} Clues Scanned ({progressPercent}%)
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--color-ivory)',
              borderRadius: '999px',
              border: '1px solid var(--color-graphite)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: isVerdictUnlocked ? 'var(--color-lime)' : 'var(--color-coral)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 0: ASLI INSIDE JOKES & ROAST VAULT */}
      {currentCase.actualJokes && currentCase.actualJokes.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Quotes size={20} weight="fill" color="var(--color-coral)" />
              <span>Asli Inside Jokes & Roasts ({currentCase.actualJokes.length})</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              100% Real Banter Vault
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentCase.actualJokes.map((joke) => {
              const laughCount = reactedJokeIds[joke.id] || 0;

              return (
                <div
                  key={joke.id}
                  className="card"
                  style={{
                    padding: '14px',
                    borderLeft: '6px solid var(--color-lime)',
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'var(--shadow-retro)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span className="badge badge-coral" style={{ fontSize: '0.72rem' }}>
                      {joke.laughterTag}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {joke.speakerOrContext}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-graphite)', marginBottom: '10px', lineHeight: 1.4 }}>
                    "{joke.setup}"
                  </p>

                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-ivory)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '4px solid var(--color-cobalt)',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-cobalt)', marginBottom: '3px' }}>
                      💥 THE PUNCHLINE:
                    </span>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-graphite)', lineHeight: 1.4, margin: 0 }}>
                      {joke.punchline}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleReactJoke(joke.id)}
                      className="btn btn-outline"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: laughCount > 0 ? 'var(--color-lime)' : '#FAFAF6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Smiley size={16} weight={laughCount > 0 ? 'fill' : 'bold'} />
                      <span>{laughCount > 0 ? `Hahaha! (${laughCount})` : 'Hanso 😂'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 1: INTERACTIVE FORENSIC EVIDENCE BOARD */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} weight="bold" color="var(--color-cobalt)" />
            <span>Forensic Evidence Lab ({totalClues})</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tap clue to analyze
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentCase.evidence.map((ev, idx) => {
            const isExamined = examinedExhibitIds.includes(ev.id);
            const isScanning = scanningExhibitId === ev.id;

            return (
              <div
                key={ev.id}
                className="card"
                style={{
                  padding: '14px',
                  borderLeft: `6px solid ${isExamined ? 'var(--color-lime)' : 'var(--color-coral)'}`,
                  backgroundColor: isExamined ? '#FAFAF6' : '#FFFFFF',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        backgroundColor: 'var(--color-graphite)',
                        color: '#FFFFFF',
                        borderRadius: '4px'
                      }}
                    >
                      EXHIBIT #{idx + 1}
                    </span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      {ev.label}
                    </h3>
                  </div>

                  {isExamined ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-graphite)',
                        backgroundColor: 'var(--color-lime)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    >
                      <SealCheck size={14} weight="fill" />
                      VERIFIED
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        backgroundColor: 'var(--color-coral)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    >
                      <WarningCircle size={14} weight="bold" />
                      SEALED
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '10px' }}>
                  {ev.description}
                </p>

                {/* Forensic Reveal Area */}
                {!isExamined ? (
                  <button
                    type="button"
                    onClick={() => handleExamineClue(ev.id)}
                    disabled={isScanning}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      padding: '8px',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--color-ivory)',
                      fontWeight: 700
                    }}
                  >
                    <MagnifyingGlass size={16} weight="bold" />
                    <span>{isScanning ? '🔍 Forensic Lab Scan Chal Raha Hai...' : `Forensic Scan Chalao (${ev.forensicTool || 'DNA & Audio Analysis'})`}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-ivory)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      marginTop: '6px'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-cobalt)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} weight="fill" color="var(--color-cobalt)" />
                      FORENSIC LAB REPORT ({ev.forensicTool}):
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-graphite)', fontWeight: 600, lineHeight: 1.35, margin: 0 }}>
                      {ev.forensicFinding || 'Decrypted forensic data aligns with suspect suspicion.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SUSPECT INTERROGATION ROOM */}
      {currentCase.interrogation && currentCase.interrogation.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChatCircleDots size={20} weight="bold" color="var(--color-coral)" />
              <span>Suspect Interrogation Chamber</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cross-examine {currentCase.suspect || 'Suspect'}
            </span>
          </div>

          <div className="card" style={{ padding: '14px', backgroundColor: '#FFFFFF' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Chief Investigator Mausami Ji, suspect kursi par baitha hai. Apna sawaal chunein:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {currentCase.interrogation.map((q, qIdx) => {
                const isAsked = askedQuestionIds.includes(q.id);
                const isActive = activeInterrogationId === q.id;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleAskQuestion(q.id)}
                    className="btn btn-outline"
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      justifyContent: 'flex-start',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: isActive ? 'var(--color-lime)' : isAsked ? '#F3F0E9' : '#FFFFFF',
                      borderColor: isActive ? 'var(--color-graphite)' : 'var(--border-light)'
                    }}
                  >
                    <span style={{ fontWeight: 800, marginRight: '6px' }}>Q{qIdx + 1}:</span>
                    <span style={{ flex: 1 }}>{q.question}</span>
                    {isAsked && <CheckCircle size={16} weight="fill" color="var(--color-graphite)" />}
                  </button>
                );
              })}
            </div>

            {/* Suspect's Live Confession Box */}
            {activeInterrogationId && (() => {
              const activeQ = currentCase.interrogation?.find(q => q.id === activeInterrogationId);
              if (!activeQ) return null;

              return (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--color-ivory)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--color-graphite)',
                    borderLeft: '6px solid var(--color-coral)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-coral)', marginBottom: '4px' }}>
                    SUSPECT REACTION:
                  </div>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {activeQ.suspectReaction}
                  </p>

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-graphite)', marginBottom: '4px' }}>
                    SUSPECT CONFESSION ON RECORD:
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-graphite)', lineHeight: 1.4, margin: 0 }}>
                    {activeQ.confession}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SECTION 3: OFFICIAL JUDICIAL VERDICT CHAMBER */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '20px 16px',
          backgroundColor: '#FFFDF9',
          border: 'var(--border-width) solid var(--color-graphite)',
          boxShadow: 'var(--shadow-retro)'
        }}
      >
        {!isVerdictUnlocked ? (
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-coral)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <Lock size={24} weight="bold" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
              Adaalat Ka Faisla Abhi Locked Hai!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 12px' }}>
              Chief Investigator Mausami Ji, faisla sunane ke liye kam se kam <strong>2 forensic clues scan karein</strong> ya <strong>suspect se 1 sawaal poochhein</strong>!
            </p>
            <span className="badge badge-coral">INSUFFICIENT FORENSIC EVIDENCE ({examinedCount}/2)</span>
          </div>
        ) : !showVerdict ? (
          <div>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-graphite)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: 'var(--border-width) solid var(--color-graphite)'
              }}
            >
              <LockOpen size={26} weight="bold" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
              Forensic Investigation Complete!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Sabhi saboot aur bayaan darj ho chuke hain. Chief Inquisitor Mausami Ji, antim faisla sunane ke liye hathoda chalayein!
            </p>
            <button
              type="button"
              onClick={handleDeliverVerdict}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 18px',
                justifyContent: 'center',
                backgroundColor: 'var(--color-cobalt)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 800
              }}
            >
              <Gavel size={22} weight="bold" />
              <span>Hathoda Bajao • Faisla Suno!</span>
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-lime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkle size={14} weight="fill" />
                OFFICIAL JUDICIAL ORDER
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                BENCH: MAUSAMI JI
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-graphite)' }}>
              Adaalat Ka Antim Faisla
            </h3>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-ivory)',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--color-graphite)',
                marginBottom: '16px'
              }}
            >
              <p style={{ fontSize: '0.95rem', color: 'var(--color-graphite)', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                {currentCase.verdict}
              </p>
            </div>

            {/* Interactive Penalty Decision by Mausami Ji */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-graphite)' }}>
                CHIEF INVESTIGATOR KA EXTRA SAZA ORDER (CHOOSE PENALTY):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPenalty('tea')}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 12px',
                    justifyContent: 'flex-start',
                    fontSize: '0.8rem',
                    backgroundColor: selectedPenalty === 'tea' ? 'var(--color-lime)' : '#FFFFFF'
                  }}
                >
                  ☕ Saza 1: Suspect ko roz subah adrak wali chai banani padegi!
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPenalty('momos')}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 12px',
                    justifyContent: 'flex-start',
                    fontSize: '0.8rem',
                    backgroundColor: selectedPenalty === 'momos' ? 'var(--color-lime)' : '#FFFFFF'
                  }}
                >
                  🥟 Saza 2: Mausami Ji ko kurkure momos treat karwayi jaye!
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPenalty('paratha')}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 12px',
                    justifyContent: 'flex-start',
                    fontSize: '0.8rem',
                    backgroundColor: selectedPenalty === 'paratha' ? 'var(--color-lime)' : '#FFFFFF'
                  }}
                >
                  🫓 Saza 3: Lifetime unconditional appreciation & parathas!
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowVerdict(false)}
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Faisla Re-Review Karo
              </button>
              <button
                type="button"
                onClick={() => navigate('/museum')}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Agla Case Kholo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
