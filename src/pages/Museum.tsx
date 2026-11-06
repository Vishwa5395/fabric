import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkle,
  ArrowsClockwise,
  Quotes
} from '@phosphor-icons/react';
import { CASE_FILES, CaseFile } from '../data/caseFiles';
import { audioManager } from '../services/audioManager';

export const Museum: React.FC = () => {
  const navigate = useNavigate();

  // All actual jokes pooled together for the random Joke Jukebox
  const allActualJokes = CASE_FILES.flatMap(c =>
    c.actualJokes.map(j => ({ ...j, caseTitle: c.title, caseNo: c.caseNo }))
  );

  const [currentJokeIndex, setCurrentJokeIndex] = useState<number>(0);
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('all');

  const filteredJokes = selectedCaseFilter === 'all'
    ? allActualJokes
    : allActualJokes.filter(j => j.caseNo === selectedCaseFilter);

  const activeJoke = filteredJokes[currentJokeIndex % filteredJokes.length] || allActualJokes[0];

  const handleNextJoke = () => {
    audioManager.playSfx('ding');
    setCurrentJokeIndex(prev => (prev + 1) % filteredJokes.length);
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '18px' }}>
        <span className="badge badge-cobalt" style={{ marginBottom: '6px' }}>RESTRICTED ACCESS</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Inside Joke Museum
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Kuch raaz toh raaz hi rehne chahiye... par ye wale nahi.
        </p>
      </div>

      {/* FEATURED: ASLI INSIDE JOKE JUKEBOX / STANDUP CORNER */}
      <div
        className="card"
        style={{
          marginBottom: '22px',
          borderLeft: '6px solid var(--color-lime)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-retro)',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="badge badge-lime" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkle size={14} weight="fill" />
            STANDUP VAULT • ASLI JOKES
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            CASE #{activeJoke.caseNo}
          </span>
        </div>

        {/* Filter Tabs for Jokes */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => { setSelectedCaseFilter('all'); setCurrentJokeIndex(0); }}
            className="btn btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: selectedCaseFilter === 'all' ? 'var(--color-lime)' : '#F5F3EF',
              borderColor: selectedCaseFilter === 'all' ? 'var(--color-graphite)' : 'transparent',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Sabhi Jokes (16)
          </button>
          <button
            type="button"
            onClick={() => { setSelectedCaseFilter('001'); setCurrentJokeIndex(0); }}
            className="btn btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: selectedCaseFilter === '001' ? 'var(--color-lime)' : '#F5F3EF',
              borderColor: selectedCaseFilter === '001' ? 'var(--color-graphite)' : 'transparent',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Dora Ki Mummy
          </button>
          <button
            type="button"
            onClick={() => { setSelectedCaseFilter('002'); setCurrentJokeIndex(0); }}
            className="btn btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: selectedCaseFilter === '002' ? 'var(--color-lime)' : '#F5F3EF',
              borderColor: selectedCaseFilter === '002' ? 'var(--color-graphite)' : 'transparent',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Boyfriend / Papa
          </button>
          <button
            type="button"
            onClick={() => { setSelectedCaseFilter('003'); setCurrentJokeIndex(0); }}
            className="btn btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: selectedCaseFilter === '003' ? 'var(--color-lime)' : '#F5F3EF',
              borderColor: selectedCaseFilter === '003' ? 'var(--color-graphite)' : 'transparent',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Choti Moti
          </button>
          <button
            type="button"
            onClick={() => { setSelectedCaseFilter('004'); setCurrentJokeIndex(0); }}
            className="btn btn-outline"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: selectedCaseFilter === '004' ? 'var(--color-lime)' : '#F5F3EF',
              borderColor: selectedCaseFilter === '004' ? 'var(--color-graphite)' : 'transparent',
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            Mumma's Boy
          </button>
        </div>

        {/* Joke Card */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-ivory)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-coral)' }}>
              {activeJoke.laughterTag}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {activeJoke.speakerOrContext}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-graphite)', marginBottom: '8px', lineHeight: 1.4 }}>
            "{activeJoke.setup}"
          </p>

          <div
            style={{
              padding: '8px 10px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--color-cobalt)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-graphite)',
              lineHeight: 1.35
            }}
          >
            👉 <strong>Punchline:</strong> {activeJoke.punchline}
          </div>
        </div>

        {/* Next Joke Button */}
        <button
          type="button"
          onClick={handleNextJoke}
          className="btn btn-outline"
          style={{
            width: '100%',
            padding: '8px 12px',
            justifyContent: 'center',
            fontSize: '0.85rem',
            backgroundColor: '#FAFAF6',
            fontWeight: 800
          }}
        >
          <ArrowsClockwise size={16} weight="bold" />
          <span>Agla Inside Joke Sunao (Next Banter) 🎲</span>
        </button>
      </div>

      {/* Case Files Heading */}
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
          Classified Investigation Files (4)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Har dossier mein 4 asli inside jokes, forensic saboot aur suspect interrogation shaamil hai:
        </p>
      </div>

      {/* Case Files List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {CASE_FILES.map((c: CaseFile) => {
          const isFeatured = c.featured;

          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/museum/${c.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/museum/${c.id}`);
                }
              }}
              className="card"
              style={{
                cursor: 'pointer',
                borderLeft: isFeatured ? '6px solid var(--color-coral)' : '6px solid var(--color-cobalt)',
                backgroundColor: isFeatured ? '#FFFDF9' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-lime">CASE NO. {c.caseNo}</span>
                <span className="badge badge-coral">{c.status}</span>
              </div>

              <h2 style={{ fontSize: isFeatured ? '1.25rem' : '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
                {c.title}
              </h2>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                {c.premise}
              </p>

              {/* Headline Joke Teaser */}
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  color: 'var(--color-graphite)',
                  marginBottom: '12px',
                  border: '1px dashed var(--border-light)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'flex-start'
                }}
              >
                <Quotes size={16} weight="fill" color="var(--color-coral)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Punchline:</strong> "{c.headlineJoke}"</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cobalt)' }}>
                  {c.actualJokes.length} Asli Jokes • {c.evidence.length} Forensic Clues
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-graphite)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Dossier Kholo</span>
                  <ArrowRight size={14} weight="bold" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
