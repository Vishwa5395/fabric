import React, { useState } from 'react';
import { Newspaper, Lightbulb, Heart, Bomb, ArrowClockwise, Sparkle } from '@phosphor-icons/react';
import { BREAKING_NEWS, USELESS_FACTS, COMPLIMENTS, CHAOS_COMBOS, ChaosCombo } from '../data/nonsense';
import { pickNext } from '../utils/shuffle';
import { achievementEngine } from '../services/achievements';
import { audioManager } from '../services/audioManager';
import { useToast } from '../components/common/ToastProvider';

type Tab = 'news' | 'facts' | 'compliments' | 'chaos';

export const Nonsense: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('news');

  const [currentNews, setCurrentNews] = useState(() => pickNext(BREAKING_NEWS));
  const [currentFact, setCurrentFact] = useState(() => pickNext(USELESS_FACTS));
  const [currentCompliment, setCurrentCompliment] = useState(() => pickNext(COMPLIMENTS));

  // Chaos state
  const [activeChaos, setActiveChaos] = useState<ChaosCombo | null>(null);
  const [chaosAnimActive, setChaosAnimActive] = useState<boolean>(false);

  const handleNextNews = () => {
    setCurrentNews(prev => pickNext(BREAKING_NEWS, prev.id));
  };

  const handleNextFact = () => {
    setCurrentFact(prev => pickNext(USELESS_FACTS, prev.id));
  };

  const handleNextCompliment = () => {
    setCurrentCompliment(prev => pickNext(COMPLIMENTS, prev.id));
  };

  const handleTriggerChaos = async () => {
    const combo = pickNext(CHAOS_COMBOS, activeChaos?.id);
    setActiveChaos(combo);

    // 1. Toast
    showToast(combo.toast, 'warning', 3500);

    // 2. Sound effect
    audioManager.playSfx(combo.soundPitch, 'sawtooth', 0.18);

    // 3. Animation trigger
    setChaosAnimActive(true);
    setTimeout(() => {
      setChaosAnimActive(false);
    }, 600);

    // 4. Achievement emit
    await achievementEngine.emit('chaos_used');
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-lime" style={{ marginBottom: '6px' }}>DEPT OF ABSURDITY</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Aaj ki bekaar par zaroori khabrein
        </h1>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'news'}
          onClick={() => setActiveTab('news')}
          style={{
            padding: '8px 4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-graphite)',
            backgroundColor: activeTab === 'news' ? 'var(--color-lime)' : 'var(--bg-card)',
            color: 'var(--color-graphite)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: activeTab === 'news' ? 'var(--shadow-retro-hover)' : 'var(--shadow-retro-sm)'
          }}
        >
          <Newspaper size={18} weight="bold" />
          <span>News</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'facts'}
          onClick={() => setActiveTab('facts')}
          style={{
            padding: '8px 4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-graphite)',
            backgroundColor: activeTab === 'facts' ? 'var(--color-lime)' : 'var(--bg-card)',
            color: 'var(--color-graphite)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: activeTab === 'facts' ? 'var(--shadow-retro-hover)' : 'var(--shadow-retro-sm)'
          }}
        >
          <Lightbulb size={18} weight="bold" />
          <span>Facts</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compliments'}
          onClick={() => setActiveTab('compliments')}
          style={{
            padding: '8px 4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-graphite)',
            backgroundColor: activeTab === 'compliments' ? 'var(--color-lime)' : 'var(--bg-card)',
            color: 'var(--color-graphite)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: activeTab === 'compliments' ? 'var(--shadow-retro-hover)' : 'var(--shadow-retro-sm)'
          }}
        >
          <Heart size={18} weight="bold" />
          <span>Taareef</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'chaos'}
          onClick={() => setActiveTab('chaos')}
          style={{
            padding: '8px 4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-graphite)',
            backgroundColor: activeTab === 'chaos' ? 'var(--color-coral)' : 'var(--bg-card)',
            color: 'var(--color-graphite)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            boxShadow: activeTab === 'chaos' ? 'var(--shadow-retro-hover)' : 'var(--shadow-retro-sm)'
          }}
        >
          <Bomb size={18} weight="bold" />
          <span>Chaos</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'news' && (
        <div>
          <div className="card" style={{ marginBottom: '16px', borderLeft: '6px solid var(--color-coral)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-coral">{currentNews.tag}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px', lineHeight: 1.35 }}>
              {currentNews.headline}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {currentNews.details}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextNews}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ArrowClockwise size={18} weight="bold" />
            <span>Aur ek khabar</span>
          </button>
        </div>
      )}

      {activeTab === 'facts' && (
        <div>
          <div className="card" style={{ marginBottom: '16px', borderLeft: '6px solid var(--color-cobalt)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-lime">{currentFact.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% Real Fact</span>
            </div>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.45, color: 'var(--color-graphite)' }}>
              "{currentFact.fact}"
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextFact}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ArrowClockwise size={18} weight="bold" />
            <span>Aur ek fact</span>
          </button>
        </div>
      )}

      {activeTab === 'compliments' && (
        <div>
          <div className="card" style={{ marginBottom: '16px', borderLeft: '6px solid var(--color-lime)', backgroundColor: '#FCFAF6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkle size={18} weight="bold" color="var(--color-cobalt)" />
              <span className="badge badge-cobalt">{currentCompliment.mood}</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--color-graphite)' }}>
              {currentCompliment.text}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextCompliment}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ArrowClockwise size={18} weight="bold" />
            <span>Aur ek tareef</span>
          </button>
        </div>
      )}

      {activeTab === 'chaos' && (
        <div style={{ textAlign: 'center' }}>
          <div
            className="card"
            style={{
              padding: '24px 16px',
              marginBottom: '20px',
              backgroundColor: chaosAnimActive ? 'var(--color-coral)' : 'var(--bg-card)',
              transition: 'background-color 0.2s ease',
              border: '3px solid var(--color-graphite)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>The Red Panic Button</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Isko dabane se nonsensical energy release hoti hai. Sound effects ON honge toh bleep bhi aayega!
            </p>

            <button
              type="button"
              onClick={handleTriggerChaos}
              className="btn btn-coral"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-retro)'
              }}
            >
              <Bomb size={24} weight="bold" />
              <span>UNLEASH CHAOS!</span>
            </button>
          </div>

          {activeChaos && (
            <div
              className="card"
              style={{
                textAlign: 'left',
                borderLeft: '6px solid var(--color-coral)',
                animation: chaosAnimActive ? 'wiggle 0.3s ease' : 'none'
              }}
            >
              <span className="badge badge-coral" style={{ marginBottom: '8px' }}>CHAOS REACTION</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
                {activeChaos.reactionHeadline}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {activeChaos.reactionBody}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

