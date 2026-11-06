import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkle,
  Fire,
  CheckCircle,
  XCircle,
  SkipForward,
  Microphone,
  VideoCamera,
  HandPointing,
  PencilSimple,
  FloppyDisk
} from '@phosphor-icons/react';
import {
  CardType,
  TruthQuestion,
  DareChallenge,
  TurnActionStatus
} from '../../types/truthOrDare';
import { saveAnswer } from '../../services/truthOrDareApi';

interface CardDeckViewProps {
  isMyTurn: boolean;
  activePlayerName: string;
  roundNumber: number;
  totalRounds: number;
  currentScore: number;
  cardRevealed: boolean;
  drawnCardType?: CardType;
  drawnPrompt?: TruthQuestion | DareChallenge;
  onSelectCard: (type: CardType) => void;
  onSubmitTruth: (action: TurnActionStatus, answerText?: string) => void;
  onSubmitDare: (action: TurnActionStatus, openRecorder?: boolean, answerText?: string) => void;
}

export const CardDeckView: React.FC<CardDeckViewProps> = ({
  isMyTurn,
  activePlayerName,
  roundNumber,
  totalRounds,
  currentScore,
  cardRevealed,
  drawnCardType,
  drawnPrompt,
  onSelectCard,
  onSubmitTruth,
  onSubmitDare
}) => {
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [answerText, setAnswerText] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const hasSavedRef = useRef<boolean>(false);

  // Reset input and state whenever a new prompt is revealed
  useEffect(() => {
    setAnswerText('');
    setSaveStatus('idle');
    hasSavedRef.current = false;
  }, [drawnPrompt?.id]);

  const handleCardClick = (type: CardType) => {
    if (!isMyTurn || cardRevealed) return;
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      onSelectCard(type);
    }, 450);
  };

  const handleSaveAnswerToDb = async () => {
    if (!answerText.trim() || !drawnPrompt || saveStatus === 'saving' || hasSavedRef.current) return;
    setSaveStatus('saving');
    try {
      const res = await saveAnswer({
        promptId: drawnPrompt.id,
        promptType: drawnCardType || 'truth',
        question: drawnPrompt.prompt,
        answer: answerText.trim(),
        playerName: activePlayerName || 'Mausami Ji'
      });
      if (res.success) {
        hasSavedRef.current = true;
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const darePrompt = drawnCardType === 'dare' ? (drawnPrompt as DareChallenge) : null;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Turn & Round Status Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '10px 14px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          border: 'var(--border-width) solid var(--color-graphite)',
          boxShadow: 'var(--shadow-retro)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>
            ROUND {roundNumber} / {totalRounds}
          </span>
          <strong style={{ fontSize: '1rem', color: isMyTurn ? 'var(--color-cobalt)' : 'var(--color-graphite)' }}>
            {isMyTurn ? '👉 Aapki Baari Hai!' : `⏳ ${activePlayerName} Ki Baari`}
          </strong>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>
            TOTAL SCORE
          </span>
          <span className="badge badge-lime" style={{ fontSize: '0.9rem', fontWeight: 800 }}>
            {currentScore} Pts
          </span>
        </div>
      </div>

      {/* CARD PICKING AREA (When card has not been drawn yet) */}
      {!cardRevealed ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
            {isMyTurn ? 'Apna Card Chuno!' : `${activePlayerName} card chun rahe hain...`}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {isMyTurn ? 'Sach choose karoge ya Dare?' : 'Thoda intezaar karein, turn chal rahi hai.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* TRUTH DECK CARD */}
            <button
              type="button"
              disabled={!isMyTurn || isShuffling}
              onClick={() => handleCardClick('truth')}
              className={`card ${isShuffling ? 'pulse' : ''}`}
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                border: '3px solid var(--color-graphite)',
                borderTop: '8px solid var(--color-cobalt)',
                cursor: isMyTurn ? 'pointer' : 'not-allowed',
                opacity: isMyTurn ? 1 : 0.6,
                transform: isShuffling ? 'scale(0.96)' : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-ivory)',
                  border: '2px solid var(--color-graphite)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: 'var(--color-cobalt)'
                }}
              >
                <Sparkle size={30} weight="fill" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-graphite)' }}>
                SACH
              </h3>
              <span className="badge badge-cobalt" style={{ marginTop: '6px' }}>
                TRUTH DECK
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Imandari se sach jawab do
              </p>
            </button>

            {/* DARE DECK CARD */}
            <button
              type="button"
              disabled={!isMyTurn || isShuffling}
              onClick={() => handleCardClick('dare')}
              className={`card ${isShuffling ? 'pulse' : ''}`}
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                border: '3px solid var(--color-graphite)',
                borderTop: '8px solid var(--color-coral)',
                cursor: isMyTurn ? 'pointer' : 'not-allowed',
                opacity: isMyTurn ? 1 : 0.6,
                transform: isShuffling ? 'scale(0.96)' : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-ivory)',
                  border: '2px solid var(--color-graphite)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: 'var(--color-coral)'
                }}
              >
                <Fire size={30} weight="fill" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-graphite)' }}>
                DARE
              </h3>
              <span className="badge badge-coral" style={{ marginTop: '6px' }}>
                DARE DECK
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Kaand karo & proof do
              </p>
            </button>
          </div>
        </div>
      ) : (
        /* CARD REVEALED AREA */
        <div style={{ textAlign: 'center' }}>
          <div
            className="card"
            style={{
              padding: '22px 18px',
              backgroundColor: '#FFFFFF',
              border: '3px solid var(--color-graphite)',
              borderTop: `10px solid ${drawnCardType === 'truth' ? 'var(--color-cobalt)' : 'var(--color-coral)'}`,
              boxShadow: 'var(--shadow-retro)',
              marginBottom: '16px'
            }}
          >
            {/* Card Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className={`badge ${drawnCardType === 'truth' ? 'badge-cobalt' : 'badge-coral'}`}>
                {drawnCardType === 'truth' ? 'SACH (TRUTH)' : 'DARE (KAAND)'}
              </span>

              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {drawnPrompt?.id}
              </span>
            </div>

            {/* Prompt Text */}
            <h2
              style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                color: 'var(--color-graphite)',
                lineHeight: 1.4,
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              "{drawnPrompt?.prompt}"
            </h2>

            {/* Dare Evidence Badge if applicable */}
            {darePrompt && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-ivory)',
                  border: '1px solid var(--color-graphite)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '14px'
                }}
              >
                {darePrompt.evidenceType === 'audio' && <Microphone size={16} weight="bold" color="var(--color-coral)" />}
                {darePrompt.evidenceType === 'video' && <VideoCamera size={16} weight="bold" color="var(--color-coral)" />}
                {darePrompt.evidenceType === 'none' && <HandPointing size={16} weight="bold" />}
                <span>
                  {darePrompt.evidenceType === 'audio' && `Audio Evidence Required (Max ${darePrompt.maxDurationSeconds}s)`}
                  {darePrompt.evidenceType === 'video' && `Video Evidence Required (Max ${darePrompt.maxDurationSeconds}s)`}
                  {darePrompt.evidenceType === 'none' && 'Perform Karo & Mark as Done'}
                </span>
              </div>
            )}

            {/* TEXT BOX FOR ANSWER WITH EXPLICIT SAVE BUTTON */}
            {isMyTurn && (
              <div style={{ marginTop: '8px', marginBottom: '14px', textAlign: 'left' }}>
                <label
                  htmlFor="turn-answer-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--color-graphite)',
                    marginBottom: '6px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <PencilSimple size={15} weight="bold" color="var(--color-cobalt)" />
                    {drawnCardType === 'truth' ? 'Apna Sach / Answer Likhie:' : 'Dare Thoughts / Notes:'}
                  </span>
                </label>

                <textarea
                  id="turn-answer-input"
                  rows={3}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder={
                    drawnCardType === 'truth'
                      ? 'Apna imandaar jawab yahan likhein aur neeche "Save" button dabayein...'
                      : 'Dare ke baare mein kuch likhna hai? Likh daalo...'
                  }
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-graphite)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                {/* EXPLICIT SAVE TO DATABASE BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSaveAnswerToDb}
                    disabled={!answerText.trim() || saveStatus === 'saving'}
                    className="btn btn-outline"
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.84rem',
                      backgroundColor: saveStatus === 'saved' ? 'var(--color-lime)' : 'var(--color-ivory)',
                      color: 'var(--color-graphite)',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: answerText.trim() ? 'pointer' : 'not-allowed',
                      opacity: answerText.trim() ? 1 : 0.6
                    }}
                  >
                    <FloppyDisk size={17} weight="bold" />
                    <span>
                      {saveStatus === 'saving' && 'Saving...'}
                      {saveStatus === 'saved' && '✅ Jawab Save Ho Gaya!'}
                      {saveStatus === 'idle' && '💾 Jawab Save Karo (Save to DB)'}
                      {saveStatus === 'error' && '❌ Error Saving, Try Again'}
                    </span>
                  </button>

                  {saveStatus === 'saved' && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B6E3F' }}>
                      Database mein surakshit hai ✓
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RESPONSE CONTROLS (Only visible to active player) */}
          {isMyTurn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drawnCardType === 'truth' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (answerText.trim() && !hasSavedRef.current) {
                        handleSaveAnswerToDb();
                      }
                      onSubmitTruth('answered', answerText);
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: '12px',
                      justifyContent: 'center',
                      backgroundColor: 'var(--color-lime)',
                      color: 'var(--color-graphite)',
                      fontWeight: 800
                    }}
                  >
                    <CheckCircle size={20} weight="bold" />
                    <span>Maine Sach Bata Diya (+10 Pts)</span>
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onSubmitTruth('declined', answerText)}
                      className="btn btn-outline"
                      style={{ padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <XCircle size={18} weight="bold" />
                      <span>Nahi Batana (0 Pts)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSubmitTruth('skipped', answerText)}
                      className="btn btn-outline"
                      style={{ padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <SkipForward size={18} weight="bold" />
                      <span>Skip This Card</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Dare Controls */
                <>
                  {darePrompt?.evidenceType === 'none' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (answerText.trim() && !hasSavedRef.current) {
                          handleSaveAnswerToDb();
                        }
                        onSubmitDare('completed', false, answerText);
                      }}
                      className="btn btn-primary"
                      style={{
                        padding: '12px',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-lime)',
                        color: 'var(--color-graphite)',
                        fontWeight: 800
                      }}
                    >
                      <CheckCircle size={20} weight="bold" />
                      <span>Dare Complete Kar Liya (+20 Pts)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (answerText.trim() && !hasSavedRef.current) {
                          handleSaveAnswerToDb();
                        }
                        onSubmitDare('completed', true, answerText);
                      }}
                      className="btn btn-primary"
                      style={{
                        padding: '12px',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-coral)',
                        color: 'var(--color-graphite)',
                        fontWeight: 800
                      }}
                    >
                      {darePrompt?.evidenceType === 'audio' ? (
                        <>
                          <Microphone size={20} weight="bold" />
                          <span>Audio Record & Upload Proof (+20 Pts)</span>
                        </>
                      ) : (
                        <>
                          <VideoCamera size={20} weight="bold" />
                          <span>Video Record & Upload Proof (+20 Pts)</span>
                        </>
                      )}
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onSubmitDare('declined', false, answerText)}
                      className="btn btn-outline"
                      style={{ padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <XCircle size={18} weight="bold" />
                      <span>Dare Forfeit (0 Pts)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSubmitDare('skipped', false, answerText)}
                      className="btn btn-outline"
                      style={{ padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      <SkipForward size={18} weight="bold" />
                      <span>Skip This Dare</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--color-ivory)',
                border: '1.5px dashed var(--color-graphite)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--text-muted)'
              }}
            >
              ⏳ {activePlayerName} is prompt ka jawab de rahe hain...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
