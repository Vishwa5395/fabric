import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Trophy, ArrowRight, ArrowCounterClockwise, Scales } from '@phosphor-icons/react';
import { SCENARIOS, Scenario, ScenarioOption } from '../data/gameScenarios';
import { calculateCourtTitle, CourtResult } from '../utils/courtScoring';
import { achievementEngine } from '../services/achievements';
import { setKV, getKV } from '../services/storage';

export const Court: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'verdict' | 'finished'>('intro');
  const [rounds, setRounds] = useState<Scenario[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<ScenarioOption | null>(null);
  const [pickedOptions, setPickedOptions] = useState<ScenarioOption[]>([]);
  const [result, setResult] = useState<CourtResult | null>(null);

  // Prepare a new 7-round game
  const startGame = () => {
    // 1. Mandatory Dora hearing scenario
    const doraScenario = SCENARIOS.find(s => s.isSpecial) || SCENARIOS[9];

    // 2. Other scenarios
    const others = SCENARIOS.filter(s => s.id !== doraScenario.id);

    // Shuffle others and pick 6
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const chosenOthers = shuffledOthers.slice(0, 6);

    // Combine all 7 and shuffle round order (or insert Dora round randomly)
    const combined = [...chosenOthers];
    const insertIdx = Math.floor(Math.random() * 7);
    combined.splice(insertIdx, 0, doraScenario);

    setRounds(combined);
    setCurrentRoundIdx(0);
    setPickedOptions([]);
    setSelectedOption(null);
    setGameState('playing');
  };

  const handleSelectOption = (opt: ScenarioOption) => {
    setSelectedOption(opt);
    setGameState('verdict');
  };

  const handleNextRound = async () => {
    if (!selectedOption) return;

    const nextPicked = [...pickedOptions, selectedOption];
    setPickedOptions(nextPicked);
    setSelectedOption(null);

    if (currentRoundIdx + 1 < 7) {
      setCurrentRoundIdx(prev => prev + 1);
      setGameState('playing');
    } else {
      // Game Complete
      const res = calculateCourtTitle(nextPicked);
      setResult(res);
      setGameState('finished');

      // Achievement unlock & progress saving
      await achievementEngine.emit('court_completed');

      const prevPlayed = await getKV<number>('court:games_played', 0);
      const prevBest = await getKV<number>('court:best_kaand', 0);
      await setKV('court:games_played', prevPlayed + 1);
      await setKV('court:last_title', res.title);
      await setKV('court:best_kaand', Math.max(prevBest, res.score));
    }
  };

  const currentScenario = rounds[currentRoundIdx];

  // Running score
  const runningKaand = pickedOptions.reduce((acc, curr) => acc + curr.intensity, 0) + (selectedOption ? selectedOption.intensity : 0);

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <span className="badge badge-coral" style={{ marginBottom: '6px' }}>SUPREME MEME TRIBUNAL</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Aapki adaalat, aapka faisla.
        </h1>
      </div>

      {/* 1. INTRO SCREEN */}
      {gameState === 'intro' && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-coral)',
              border: 'var(--border-width) solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-graphite)'
            }}
          >
            <Gavel size={36} weight="bold" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>
            Swagat Hai Meme Court Mein!
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            Aapke saamne 7 anokhe cases aayenge. Har situation mein aapko faisla sunana hai. Koi galat jawab nahi hai — bas aapka Kaand Meter calculate hoga aur official title milega!
          </p>

          <button
            type="button"
            onClick={startGame}
            className="btn btn-cobalt"
            style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
          >
            <Gavel size={22} weight="bold" />
            <span>Adaalat Shuru Karein</span>
          </button>
        </div>
      )}

      {/* 2. PLAYING / ROUND VERDICT SCREEN */}
      {(gameState === 'playing' || gameState === 'verdict') && currentScenario && (
        <div>
          {/* Header Progress & Kaand Meter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-ivory)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) solid var(--color-graphite)'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              Round {currentRoundIdx + 1} / 7
            </span>
            <span className="badge badge-coral" style={{ fontSize: '0.85rem' }}>
              Kaand Meter: {runningKaand}
            </span>
          </div>

          {/* Scenario Situation Card */}
          <div
            className="card"
            style={{
              marginBottom: '16px',
              borderLeft: currentScenario.isSpecial ? '6px solid var(--color-coral)' : '6px solid var(--color-cobalt)',
              backgroundColor: currentScenario.isSpecial ? '#FFFDF8' : 'var(--bg-card)'
            }}
          >
            {currentScenario.isSpecial && (
              <span className="badge badge-coral" style={{ marginBottom: '8px' }}>
                ⭐ SPECIAL CLASSIFIED HEARING
              </span>
            )}
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.45, color: 'var(--color-graphite)' }}>
              {currentScenario.situation}
            </h2>
          </div>

          {/* 3 Option Buttons (shuffled) */}
          {gameState === 'playing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentScenario.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '1rem',
                    lineHeight: 1.3
                  }}
                >
                  <Scales size={20} weight="bold" color="var(--color-cobalt)" style={{ flexShrink: 0 }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Verdict Card for chosen option */}
          {gameState === 'verdict' && selectedOption && (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <div
                className="card"
                style={{
                  marginBottom: '16px',
                  backgroundColor: 'var(--color-ivory)',
                  borderLeft: '6px solid var(--color-lime)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-lime">FAISLA SUNAYA GAYA</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-graphite)' }}>
                    Intensity: +{selectedOption.intensity}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>
                  "{selectedOption.label}"
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--color-graphite)', lineHeight: 1.45 }}>
                  {selectedOption.verdict}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextRound}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                <span>{currentRoundIdx + 1 === 7 ? 'Antim Nateeja Dekho' : 'Agla Round'}</span>
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. FINISHED / RESULTS SCREEN */}
      {gameState === 'finished' && result && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-lime)',
              border: 'var(--border-width) solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-graphite)'
            }}
          >
            <Trophy size={36} weight="bold" />
          </div>

          <span className="badge badge-coral" style={{ marginBottom: '10px' }}>
            TOTAL KAAND METER: {result.score} / 21
          </span>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '12px', color: 'var(--color-graphite)' }}>
            {result.title}
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            {result.summary}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={startGame}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ArrowCounterClockwise size={18} weight="bold" />
              <span>Phir Se Khelo</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/hq')}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>HQ Par Wapas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
