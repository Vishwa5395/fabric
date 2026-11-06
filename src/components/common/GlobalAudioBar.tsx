import React, { useEffect, useState } from 'react';
import { Play, Pause, Stop, SpeakerHigh, SpeakerSlash, MusicNotes } from '@phosphor-icons/react';
import { audioManager } from '../../services/audioManager';

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const GlobalAudioBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(audioManager.isAmbientActive());
  const [volume, setVolume] = useState<number>(audioManager.getVolume());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [ambientTime, setAmbientTime] = useState<number>(audioManager.getAmbientCurrentTime());
  const [ambientDuration, setAmbientDuration] = useState<number>(audioManager.getAmbientDuration());

  useEffect(() => {
    const unsubscribe = audioManager.subscribe({
      onAmbientStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onVolumeChange: (vol) => {
        setVolume(vol);
      },
      onPlaybackStateChange: () => {},
      onAmbientTimeUpdate: (cur, dur) => {
        setAmbientTime(cur);
        setAmbientDuration(dur);
      }
    });

    return unsubscribe;
  }, []);

  const handleTogglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await audioManager.toggleAmbient();
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioManager.stopAmbient();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    setAmbientTime(targetSec);
    audioManager.seekAmbient(targetSec);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioManager.setVolume(val);
  };

  const maxDuration = ambientDuration > 0 ? ambientDuration : 100;
  const progressPercent = ambientDuration > 0 ? (ambientTime / ambientDuration) * 100 : 0;

  return (
    <aside
      aria-label="Ambient Music Player"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'var(--color-graphite)',
        color: '#FFFFFF',
        borderTop: 'var(--border-width) solid var(--color-lime)',
        padding: '6px 14px calc(6px + env(safe-area-inset-bottom, 0px)) 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.25)'
      }}
    >
      <div
        className="global-audio-inner"
        style={{
          width: '100%',
          maxWidth: 'var(--container-max-width, 600px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {/* Main Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          {/* Left: Indicator & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? 'var(--color-lime)' : '#3F444E',
                color: isPlaying ? 'var(--color-graphite)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MusicNotes size={16} weight="bold" />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                Cowpoke (Sukoon Dhun)
              </div>
              <div style={{ fontSize: '0.72rem', color: isPlaying ? 'var(--color-lime)' : '#B0B5C0', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span>{isPlaying ? '🎵 Playing' : 'Shanti Dhun'}</span>
                {ambientDuration > 0 && (
                  <span style={{ fontFamily: 'monospace', opacity: 0.9 }}>
                    ({formatTime(ambientTime)} / {formatTime(ambientDuration)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls (Stop, Volume, Play/Pause) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Stop button */}
            {isPlaying && (
              <button
                type="button"
                onClick={handleStop}
                aria-label="Stop Sukoon Dhun"
                title="Stop Sukoon Dhun"
                style={{
                  backgroundColor: '#3F444E',
                  color: '#FFFFFF',
                  border: '1px solid #5C626E',
                  borderRadius: 'var(--radius-full)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Stop size={15} weight="bold" />
              </button>
            )}

            {/* Volume Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Volume slider chhupao' : 'Volume slider dikhao'}
              style={{
                color: '#FFFFFF',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {volume === 0 ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
            </button>

            {/* Volume Slider dropdown */}
            {isExpanded && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Sukoon volume"
                  style={{
                    width: '65px',
                    accentColor: 'var(--color-lime)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            )}

            {/* Play / Pause button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pause Sukoon Dhun' : 'Play Sukoon Dhun'}
              style={{
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-graphite)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-retro-sm)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {isPlaying ? <Pause size={18} weight="bold" /> : <Play size={18} weight="fill" />}
            </button>
          </div>
        </div>

        {/* Draggable Seeker Bar for Cowpoke */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <input
            type="range"
            className="retro-range-slider"
            min={0}
            max={maxDuration}
            step={0.1}
            value={ambientTime}
            onChange={handleSeek}
            aria-label="Cowpoke sukoon dhun progress"
            style={{
              flex: 1,
              height: '6px',
              margin: '2px 0',
              background: `linear-gradient(to right, var(--color-lime) 0%, var(--color-lime) ${progressPercent}%, #3F444E ${progressPercent}%, #3F444E 100%)`
            }}
          />
        </div>
      </div>
    </aside>
  );
};
