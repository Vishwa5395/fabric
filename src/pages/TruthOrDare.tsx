import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  ArrowLeft,
  Key,
  Play,
  WarningCircle
} from '@phosphor-icons/react';
import {
  GameMode,
  SessionLength,
  CardType,
  TruthQuestion,
  DareChallenge,
  TurnActionStatus,
  GameTurnRecord,
  GameRoomState,
  GameSessionReport
} from '../types/truthOrDare';
import { DeckManager } from '../utils/truthOrDareDeck';
import { calculateTurnPoints } from '../utils/truthOrDareScoring';
import { CardDeckView } from '../components/truthOrDare/CardDeckView';
import { AudioEvidenceRecorder } from '../components/truthOrDare/AudioEvidenceRecorder';
import { VideoEvidenceRecorder } from '../components/truthOrDare/VideoEvidenceRecorder';
import { WaitingLobbyView } from '../components/truthOrDare/WaitingLobbyView';
import { GameReportView } from '../components/truthOrDare/GameReportView';
import { truthOrDareSocket } from '../services/truthOrDareSocket';
import { audioManager } from '../services/audioManager';

type GameScreen =
  | 'mode_select'
  | 'solo_setup'
  | 'mp_setup'
  | 'mp_lobby'
  | 'active_game'
  | 'audio_recording'
  | 'video_recording'
  | 'game_report';

export const TruthOrDare: React.FC = () => {
  const navigate = useNavigate();

  // Screen State
  const [screen, setScreen] = useState<GameScreen>('mode_select');
  const [gameMode, setGameMode] = useState<GameMode>('solo');

  // Solo State
  const [playerName, setPlayerName] = useState<string>('Mausami Ji');
  const [sessionLength, setSessionLength] = useState<SessionLength>(7);
  const [soloRound, setSoloRound] = useState<number>(1);
  const [soloScore, setSoloScore] = useState<number>(0);
  const [soloTurns, setSoloTurns] = useState<GameTurnRecord[]>([]);
  const [soloSessionStartTime, setSoloSessionStartTime] = useState<number>(0);
  const [soloSessionId, setSoloSessionId] = useState<string>('');

  // Active Card State
  const [drawnCardType, setDrawnCardType] = useState<CardType | undefined>();
  const [drawnPrompt, setDrawnPrompt] = useState<TruthQuestion | DareChallenge | undefined>();
  const [cardRevealed, setCardRevealed] = useState<boolean>(false);

  // Multiplayer State
  const [mpTab, setMpTab] = useState<'create' | 'join'>('create');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [mpRoomState, setMpRoomState] = useState<GameRoomState | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [disconnectedNotice, setDisconnectedNotice] = useState<string | null>(null);

  // Final Report
  const [finalReport, setFinalReport] = useState<GameSessionReport | null>(null);

  // Deck Manager for Solo Mode
  const soloDeckRef = useRef<DeckManager>(new DeckManager());

  // Socket.IO event registration for Multiplayer
  useEffect(() => {
    const unsubCreated = truthOrDareSocket.on('room:created', (data: any) => {
      setMyPlayerId(data.playerId);
      setMpRoomState(data.state);
      setScreen('mp_lobby');
      setIsConnecting(false);
    });

    const unsubJoined = truthOrDareSocket.on('room:joined', (data: any) => {
      setMyPlayerId(data.playerId);
      setMpRoomState(data.state);
      setScreen('mp_lobby');
      setIsConnecting(false);
    });

    const unsubState = truthOrDareSocket.on('room:state', (state: GameRoomState) => {
      setMpRoomState(state);
      if (state.status === 'in_progress') {
        setScreen('active_game');
        if (state.currentPrompt) {
          setDrawnPrompt(state.currentPrompt);
          setDrawnCardType(state.currentCardType);
          setCardRevealed(true);
        } else {
          setCardRevealed(false);
          setDrawnPrompt(undefined);
          setDrawnCardType(undefined);
        }
      }
    });

    const unsubGameStarted = truthOrDareSocket.on('game:started', (data: any) => {
      setMpRoomState(data.state);
      setScreen('active_game');
      setCardRevealed(false);
      setDrawnPrompt(undefined);
      setDrawnCardType(undefined);
      audioManager.playSfx('achievement');
    });

    const unsubCardRevealed = truthOrDareSocket.on('card:revealed', (data: any) => {
      setMpRoomState(data.state);
      setDrawnPrompt(data.state.currentPrompt);
      setDrawnCardType(data.state.currentCardType);
      setCardRevealed(true);
      audioManager.playSfx('ding');
    });

    const unsubGameCompleted = truthOrDareSocket.on('game:completed', (data: any) => {
      setMpRoomState(data.state);
      setFinalReport(data.report);
      setScreen('game_report');
      audioManager.playSfx('achievement');
    });

    const unsubDisconnected = truthOrDareSocket.on('player:disconnected', () => {
      setDisconnectedNotice('Doosra player temporarily disconnect ho gaya. Intezaar karein...');
      setTimeout(() => setDisconnectedNotice(null), 5000);
    });

    const unsubReconnected = truthOrDareSocket.on('player:reconnected', (data: any) => {
      setDisconnectedNotice(null);
      setMpRoomState(data.state);
    });

    const unsubError = truthOrDareSocket.on('error:notification', (data: any) => {
      setMpError(data.message || 'Kuch gadbad hui.');
      setIsConnecting(false);
    });

    return () => {
      unsubCreated();
      unsubJoined();
      unsubState();
      unsubGameStarted();
      unsubCardRevealed();
      unsubGameCompleted();
      unsubDisconnected();
      unsubReconnected();
      unsubError();
    };
  }, []);

  // ----------------------------------------------------
  // SOLO MODE LOGIC
  // ----------------------------------------------------
  const handleStartSoloGame = () => {
    soloDeckRef.current.reset();
    setGameMode('solo');
    setSoloRound(1);
    setSoloScore(0);
    setSoloTurns([]);
    setDrawnCardType(undefined);
    setDrawnPrompt(undefined);
    setCardRevealed(false);
    setSoloSessionStartTime(Date.now());
    setSoloSessionId(crypto.randomUUID());
    setScreen('active_game');
    audioManager.playSfx('ding');
  };

  const handleSoloSelectCard = (type: CardType) => {
    const prompt = soloDeckRef.current.drawCard(type);
    setDrawnCardType(type);
    setDrawnPrompt(prompt);
    setCardRevealed(true);
    audioManager.playSfx('ding');
  };

  const handleSoloSubmitTruth = (action: TurnActionStatus, answerText?: string) => {
    const points = calculateTurnPoints('truth', action);
    const newScore = soloScore + points;
    setSoloScore(newScore);

    const turnRecord: GameTurnRecord = {
      id: crypto.randomUUID(),
      sessionId: soloSessionId,
      turnNumber: soloTurns.length + 1,
      roundNumber: soloRound,
      playerId: 'solo-player',
      playerName,
      promptId: drawnPrompt!.id,
      promptType: 'truth',
      promptText: drawnPrompt!.prompt,
      submittedStatus: action,
      awardedPoints: points,
      answerText: answerText?.trim() || undefined,
      submittedAt: new Date().toISOString()
    };

    const updatedTurns = [...soloTurns, turnRecord];
    setSoloTurns(updatedTurns);

    if (points > 0) {
      audioManager.playSfx('badge');
    }

    advanceSoloRound(updatedTurns, newScore);
  };

  const handleSoloSubmitDare = (
    action: TurnActionStatus,
    openRecorder?: boolean,
    answerText?: string
  ) => {
    if (openRecorder) {
      const dare = drawnPrompt as DareChallenge;
      if (dare.evidenceType === 'video') {
        setScreen('video_recording');
      } else {
        setScreen('audio_recording');
      }
      return;
    }

    // Direct dare submission (none or not_performed or skipped)
    const points = calculateTurnPoints('dare', action, {
      evidenceRequired: false,
      hasUploadedEvidence: false
    });
    const newScore = soloScore + points;
    setSoloScore(newScore);

    const turnRecord: GameTurnRecord = {
      id: crypto.randomUUID(),
      sessionId: soloSessionId,
      turnNumber: soloTurns.length + 1,
      roundNumber: soloRound,
      playerId: 'solo-player',
      playerName,
      promptId: drawnPrompt!.id,
      promptType: 'dare',
      promptText: drawnPrompt!.prompt,
      evidenceType: (drawnPrompt as DareChallenge).evidenceType,
      evidenceRequired: (drawnPrompt as DareChallenge).evidenceRequired,
      submittedStatus: action,
      awardedPoints: points,
      answerText: answerText?.trim() || undefined,
      submittedAt: new Date().toISOString()
    };

    const updatedTurns = [...soloTurns, turnRecord];
    setSoloTurns(updatedTurns);

    if (points > 0) {
      audioManager.playSfx('achievement');
    }

    advanceSoloRound(updatedTurns, newScore);
  };

  const handleSoloEvidenceUploadSuccess = (evidenceId: string) => {
    const points = 15;
    const newScore = soloScore + points;
    setSoloScore(newScore);

    const turnRecord: GameTurnRecord = {
      id: crypto.randomUUID(),
      sessionId: soloSessionId,
      turnNumber: soloTurns.length + 1,
      roundNumber: soloRound,
      playerId: 'solo-player',
      playerName,
      promptId: drawnPrompt!.id,
      promptType: 'dare',
      promptText: drawnPrompt!.prompt,
      evidenceType: (drawnPrompt as DareChallenge).evidenceType,
      evidenceRequired: true,
      submittedStatus: 'completed',
      awardedPoints: points,
      evidenceId,
      submittedAt: new Date().toISOString()
    };

    const updatedTurns = [...soloTurns, turnRecord];
    setSoloTurns(updatedTurns);
    audioManager.playSfx('achievement');

    setScreen('active_game');
    advanceSoloRound(updatedTurns, newScore);
  };

  const advanceSoloRound = (turns: GameTurnRecord[], score: number) => {
    if (soloRound >= sessionLength) {
      // Session Completed -> Generate Report
      const durationSeconds = Math.max(0, Math.round((Date.now() - soloSessionStartTime) / 1000));
      const report: GameSessionReport = {
        sessionId: soloSessionId,
        mode: 'solo',
        totalRounds: sessionLength,
        startedAt: new Date(soloSessionStartTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds,
        players: [
          {
            id: 'solo-player',
            displayName: playerName,
            score,
            truthAnsweredCount: turns.filter(t => t.promptType === 'truth' && t.submittedStatus === 'answered').length,
            truthDeclinedCount: turns.filter(t => t.promptType === 'truth' && t.submittedStatus === 'declined').length,
            truthSkippedCount: turns.filter(t => t.promptType === 'truth' && t.submittedStatus === 'skipped').length,
            dareCompletedCount: turns.filter(t => t.promptType === 'dare' && t.submittedStatus === 'completed').length,
            dareNotPerformedCount: turns.filter(t => t.promptType === 'dare' && t.submittedStatus === 'not_performed').length,
            dareSkippedCount: turns.filter(t => t.promptType === 'dare' && t.submittedStatus === 'skipped').length,
            evidenceUploadCount: turns.filter(t => Boolean(t.evidenceId)).length
          }
        ],
        turns
      };

      setFinalReport(report);
      setScreen('game_report');
    } else {
      setSoloRound(prev => prev + 1);
      setCardRevealed(false);
      setDrawnPrompt(undefined);
      setDrawnCardType(undefined);
    }
  };

  // ----------------------------------------------------
  // MULTIPLAYER LOGIC
  // ----------------------------------------------------
  const handleCreateRoom = () => {
    setMpError(null);
    setIsConnecting(true);
    truthOrDareSocket.createRoom(playerName, sessionLength);
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) {
      setMpError('Room code daalna zaroori hai.');
      return;
    }
    setMpError(null);
    setIsConnecting(true);
    truthOrDareSocket.joinRoom(joinCodeInput, playerName);
  };

  const handleMpSelectCard = (type: CardType) => {
    truthOrDareSocket.chooseCard(type);
  };

  const handleMpSubmitTruth = (action: TurnActionStatus, answerText?: string) => {
    truthOrDareSocket.submitTruth(action, answerText);
  };

  const handleMpSubmitDare = (
    action: TurnActionStatus,
    openRecorder?: boolean,
    answerText?: string
  ) => {
    if (openRecorder) {
      const dare = drawnPrompt as DareChallenge;
      if (dare.evidenceType === 'video') {
        setScreen('video_recording');
      } else {
        setScreen('audio_recording');
      }
      return;
    }
    truthOrDareSocket.submitDare(action, undefined, answerText);
  };

  const handleMpEvidenceUploadSuccess = (evidenceId: string) => {
    setScreen('active_game');
    truthOrDareSocket.submitDare('completed', evidenceId);
  };

  // ----------------------------------------------------
  // RENDER CURRENT SCREEN
  // ----------------------------------------------------
  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Disconnection Warning Banner */}
      {disconnectedNotice && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#FFEAEA',
            border: '2px solid var(--color-coral)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          <WarningCircle size={20} weight="fill" color="var(--color-coral)" />
          <span>{disconnectedNotice}</span>
        </div>
      )}

      {/* VIEW 1: MODE SELECTION */}
      {screen === 'mode_select' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="btn btn-outline"
            style={{ marginBottom: '14px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Game Room Wapas</span>
          </button>

          <div
            className="card"
            style={{
              padding: '24px 18px',
              backgroundColor: '#FFFFFF',
              borderTop: '8px solid var(--color-coral)',
              boxShadow: 'var(--shadow-retro)',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <span className="badge badge-coral" style={{ marginBottom: '8px' }}>THE CLASSIC GAME</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '8px' }}>
              TRUTH OR DARE
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Sach bologe ya dare complete karoge? Random card draws, audio & video challenges, aur private real-time rooms.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Solo Mode Button Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setGameMode('solo'); setScreen('solo_setup'); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { setGameMode('solo'); setScreen('solo_setup'); }
              }}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '18px',
                borderLeft: '6px solid var(--color-lime)',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User size={24} weight="bold" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>SOLO MODE</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Akele khelo, cards draw karo, challenges perform karo aur apna score banao.
                  </p>
                </div>
              </div>
            </div>

            {/* Multiplayer Mode Button Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setGameMode('multiplayer'); setScreen('mp_setup'); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { setGameMode('multiplayer'); setScreen('mp_setup'); }
              }}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '18px',
                borderLeft: '6px solid var(--color-cobalt)',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-cobalt)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Users size={24} weight="bold" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>2-PLAYER ONLINE MULTIPLAYER</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Private room code se doosre user ke saath judo aur real-time khelo! hehehehehe :-D
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SOLO SETUP */}
      {screen === 'solo_setup' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button
            type="button"
            onClick={() => setScreen('mode_select')}
            className="btn btn-outline"
            style={{ marginBottom: '14px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Mode Selection Wapas</span>
          </button>

          <div
            className="card"
            style={{
              padding: '20px 16px',
              backgroundColor: '#FFFFFF',
              borderTop: '6px solid var(--color-lime)',
              boxShadow: 'var(--shadow-retro)'
            }}
          >
            <span className="badge badge-lime" style={{ marginBottom: '8px' }}>SOLO CONFIGURATION</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '14px' }}>
              Solo Game Setup
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Aapka Naam:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-graphite)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Kitne Rounds Khelna Chahenge?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[5, 7, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSessionLength(n as SessionLength)}
                    className="btn btn-outline"
                    style={{
                      padding: '10px',
                      justifyContent: 'center',
                      fontWeight: 800,
                      backgroundColor: sessionLength === n ? 'var(--color-lime)' : '#FFFFFF',
                      borderColor: sessionLength === n ? 'var(--color-graphite)' : 'var(--border-light)'
                    }}
                  >
                    {n} Rounds {n === 7 ? '(Best)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartSoloGame}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-graphite)',
                fontWeight: 900,
                fontSize: '1rem'
              }}
            >
              <Play size={20} weight="fill" />
              <span>Chalo, Khel Shuru Karein!</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: MULTIPLAYER SETUP (Create or Join Room) */}
      {screen === 'mp_setup' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button
            type="button"
            onClick={() => setScreen('mode_select')}
            className="btn btn-outline"
            style={{ marginBottom: '14px', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Mode Selection Wapas</span>
          </button>

          <div
            className="card"
            style={{
              padding: '20px 16px',
              backgroundColor: '#FFFFFF',
              borderTop: '6px solid var(--color-cobalt)',
              boxShadow: 'var(--shadow-retro)'
            }}
          >
            {/* Tabs: Create vs Join */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => { setMpTab('create'); setMpError(null); }}
                className="btn btn-outline"
                style={{
                  padding: '10px',
                  justifyContent: 'center',
                  fontWeight: 800,
                  backgroundColor: mpTab === 'create' ? 'var(--color-cobalt)' : '#FFFFFF',
                  color: mpTab === 'create' ? '#FFFFFF' : 'var(--color-graphite)'
                }}
              >
                Create Private Room
              </button>

              <button
                type="button"
                onClick={() => { setMpTab('join'); setMpError(null); }}
                className="btn btn-outline"
                style={{
                  padding: '10px',
                  justifyContent: 'center',
                  fontWeight: 800,
                  backgroundColor: mpTab === 'join' ? 'var(--color-cobalt)' : '#FFFFFF',
                  color: mpTab === 'join' ? '#FFFFFF' : 'var(--color-graphite)'
                }}
              >
                Join Private Room
              </button>
            </div>

            {mpError && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#FFEAEA',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-coral)',
                  fontSize: '0.85rem',
                  marginBottom: '14px',
                  color: 'var(--color-coral)',
                  fontWeight: 700
                }}
              >
                {mpError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Aapka Display Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-graphite)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {mpTab === 'create' ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Total Rounds:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[5, 7, 10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSessionLength(n as SessionLength)}
                        className="btn btn-outline"
                        style={{
                          padding: '10px',
                          justifyContent: 'center',
                          fontWeight: 800,
                          backgroundColor: sessionLength === n ? 'var(--color-lime)' : '#FFFFFF'
                        }}
                      >
                        {n} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isConnecting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-cobalt)',
                    color: '#FFFFFF',
                    fontWeight: 800
                  }}
                >
                  <Key size={18} weight="bold" />
                  <span>{isConnecting ? 'Room Create Ho Raha Hai...' : 'Room Banao (Generate Room Code)'}</span>
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    8-Digit Room Code Daalein:
                  </label>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="E.G. AB72KQ9P"
                    maxLength={8}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-width) solid var(--color-graphite)',
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      fontWeight: 800
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleJoinRoom}
                  disabled={isConnecting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-lime)',
                    color: 'var(--color-graphite)',
                    fontWeight: 800
                  }}
                >
                  <Play size={18} weight="fill" />
                  <span>{isConnecting ? 'Room Se Jud Rahe Hain...' : 'Room Join Karein'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: MULTIPLAYER LOBBY */}
      {screen === 'mp_lobby' && mpRoomState && (
        <WaitingLobbyView
          roomState={mpRoomState}
          myPlayerId={myPlayerId}
          onToggleReady={(isReady) => truthOrDareSocket.setReady(isReady)}
          onStartGame={() => truthOrDareSocket.startGame()}
          onLeaveRoom={() => {
            truthOrDareSocket.disconnect();
            setScreen('mode_select');
          }}
        />
      )}

      {/* VIEW 5: ACTIVE GAME SCREEN */}
      {screen === 'active_game' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {gameMode === 'solo' ? (
            <CardDeckView
              isMyTurn={true}
              activePlayerName={playerName}
              roundNumber={soloRound}
              totalRounds={sessionLength}
              currentScore={soloScore}
              cardRevealed={cardRevealed}
              drawnCardType={drawnCardType}
              drawnPrompt={drawnPrompt}
              onSelectCard={handleSoloSelectCard}
              onSubmitTruth={handleSoloSubmitTruth}
              onSubmitDare={handleSoloSubmitDare}
            />
          ) : (
            mpRoomState && (() => {
              const activePlayer = mpRoomState.players[mpRoomState.activePlayerIndex];
              const isMyTurn = activePlayer?.id === myPlayerId;
              const me = mpRoomState.players.find(p => p.id === myPlayerId);

              return (
                <CardDeckView
                  isMyTurn={isMyTurn}
                  activePlayerName={activePlayer?.displayName || 'Player'}
                  roundNumber={mpRoomState.currentRound}
                  totalRounds={mpRoomState.totalRounds}
                  currentScore={me?.score || 0}
                  cardRevealed={cardRevealed}
                  drawnCardType={drawnCardType}
                  drawnPrompt={drawnPrompt}
                  onSelectCard={handleMpSelectCard}
                  onSubmitTruth={handleMpSubmitTruth}
                  onSubmitDare={handleMpSubmitDare}
                />
              );
            })()
          )}
        </div>
      )}

      {/* VIEW 6: AUDIO EVIDENCE RECORDER */}
      {screen === 'audio_recording' && drawnPrompt && (
        <AudioEvidenceRecorder
          sessionId={gameMode === 'solo' ? soloSessionId : mpRoomState?.sessionId || 'session'}
          roomId={gameMode === 'multiplayer' ? mpRoomState?.roomId : undefined}
          playerId={gameMode === 'solo' ? 'solo-player' : myPlayerId}
          dareId={drawnPrompt.id}
          promptText={drawnPrompt.prompt}
          maxDurationSeconds={(drawnPrompt as DareChallenge).maxDurationSeconds}
          onUploadSuccess={(evidenceId) => {
            if (gameMode === 'solo') {
              handleSoloEvidenceUploadSuccess(evidenceId);
            } else {
              handleMpEvidenceUploadSuccess(evidenceId);
            }
          }}
          onCancel={() => setScreen('active_game')}
        />
      )}

      {/* VIEW 7: VIDEO EVIDENCE RECORDER */}
      {screen === 'video_recording' && drawnPrompt && (
        <VideoEvidenceRecorder
          sessionId={gameMode === 'solo' ? soloSessionId : mpRoomState?.sessionId || 'session'}
          roomId={gameMode === 'multiplayer' ? mpRoomState?.roomId : undefined}
          playerId={gameMode === 'solo' ? 'solo-player' : myPlayerId}
          dareId={drawnPrompt.id}
          promptText={drawnPrompt.prompt}
          maxDurationSeconds={(drawnPrompt as DareChallenge).maxDurationSeconds}
          onUploadSuccess={(evidenceId) => {
            if (gameMode === 'solo') {
              handleSoloEvidenceUploadSuccess(evidenceId);
            } else {
              handleMpEvidenceUploadSuccess(evidenceId);
            }
          }}
          onCancel={() => setScreen('active_game')}
        />
      )}

      {/* VIEW 8: GAME REPORT VIEW */}
      {screen === 'game_report' && finalReport && (
        <GameReportView
          report={finalReport}
          onPlayAgain={() => {
            if (gameMode === 'solo') {
              handleStartSoloGame();
            } else {
              setScreen('mp_setup');
            }
          }}
          onBackToGameRoom={() => navigate('/games')}
        />
      )}
    </div>
  );
};
