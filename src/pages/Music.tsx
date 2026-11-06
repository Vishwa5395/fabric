import React, { useState, useRef, useEffect } from 'react';
import {
  MusicNotes,
  Play,
  Pause,
  Stop,
  Star,
  DownloadSimple
} from '@phosphor-icons/react';
import songsData from '../data/songs.json';
import { audioManager } from '../services/audioManager';
import { achievementEngine } from '../services/achievements';

interface SongItem {
  id: string;
  title: string;
  filmOrArtist: string;
  album: string;
  artworkUrl: string;
  appleUrl: string;
  previewUrl?: string;
  spotifyTrackId: string;
  youtubeVideoId?: string;
  youtubeQuery?: string;
  verified: boolean;
  searchTerms: {
    spotify: string;
    ytMusic: string;
    jioSaavn: string;
  };
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const Music: React.FC = () => {
  const [favouriteSongs, setFavouriteSongs] = useState<string[]>([]);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Active song player state
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);
  const [songCurrentTime, setSongCurrentTime] = useState<number>(0);
  const [songDuration, setSongDuration] = useState<number>(0);
  const [isDraggingSong, setIsDraggingSong] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songs = songsData as SongItem[];

  // Cleanup active song on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Play / Pause for a Song
  const handleTogglePlaySong = (song: SongItem) => {
    // If this song is already active, toggle play / pause
    if (activeSongId === song.id && audioRef.current) {
      if (isPlayingSong) {
        audioRef.current.pause();
        setIsPlayingSong(false);
      } else {
        // Pause global ambient Cowpoke when song starts
        audioManager.pauseAmbient();
        audioManager.stopPlayback();
        audioRef.current.play().catch(console.warn);
        setIsPlayingSong(true);
      }
      return;
    }

    // Switch to this new song
    audioManager.pauseAmbient();
    audioManager.stopPlayback();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const localSongUrl = `/audio/songs/${song.id}.m4a`;
    const audio = new Audio(localSongUrl);
    audioRef.current = audio;

    setActiveSongId(song.id);
    setIsPlayingSong(true);
    setSongCurrentTime(0);
    setSongDuration(0);

    achievementEngine.emit('music_played');

    // Attach listeners
    audio.addEventListener('timeupdate', () => {
      if (!isDraggingSong) {
        setSongCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      setSongDuration(audio.duration || 0);
    });

    audio.addEventListener('durationchange', () => {
      setSongDuration(audio.duration || 0);
    });

    audio.addEventListener('play', () => {
      setIsPlayingSong(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlayingSong(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlayingSong(false);
      setSongCurrentTime(0);
    });

    audio.onerror = () => {
      if (song.previewUrl && audio.src !== song.previewUrl) {
        audio.src = song.previewUrl;
        audio.play().catch(console.warn);
      }
    };

    audio.play().catch(err => {
      console.warn('Audio playback error:', err);
      setIsPlayingSong(false);
    });
  };

  const handleStopSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingSong(false);
    setSongCurrentTime(0);
  };

  const handleSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    setSongCurrentTime(targetSec);
    if (audioRef.current) {
      audioRef.current.currentTime = targetSec;
    }
  };

  const toggleSongFav = (songId: string) => {
    setFavouriteSongs(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleDownloadSong = async (song: SongItem) => {
    const downloadUrl = `/audio/songs/${song.id}.m4a`;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Not found');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title} - ${song.filmOrArtist}.m4a`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      if (song.previewUrl) {
        window.open(song.previewUrl, '_blank');
      }
    }
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '18px' }}>
        <span className="badge badge-lime" style={{ marginBottom: '6px' }}>SUKOON CORNER</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Thoda sa sukoon, thodi si dhun.
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Aapke pasandeeda gaane aur sukoon bhare tracks.
        </p>
      </div>

      {/* Section Divider with Playlist Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Background Music Playlist ({songs.length})
        </span>
        <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-graphite)' }} />
      </div>

      {/* SONGS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {songs.map(song => {
          const isFav = favouriteSongs.includes(song.id);
          const isThisActive = activeSongId === song.id;
          const isThisPlaying = isThisActive && isPlayingSong;
          const hasImgError = imgErrors[song.id] || !song.artworkUrl;

          const songMaxDur = isThisActive && songDuration > 0 ? songDuration : 100;
          const songProgPercent = isThisActive && songDuration > 0 ? (songCurrentTime / songDuration) * 100 : 0;

          return (
            <div
              key={song.id}
              className="card"
              style={{
                padding: '16px',
                borderLeft: `6px solid ${isThisPlaying ? 'var(--color-lime)' : 'var(--color-cobalt)'}`,
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-retro)',
                transition: 'border-color 0.2s ease'
              }}
            >
              {/* Card Header (Artwork & Info) */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: 'var(--border-width) solid var(--color-graphite)',
                    backgroundColor: 'var(--color-ivory)',
                    flexShrink: 0
                  }}
                >
                  {!hasImgError ? (
                    <img
                      src={song.artworkUrl}
                      alt={song.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImgErrors(prev => ({ ...prev, [song.id]: true }))}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--color-cobalt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <MusicNotes size={32} weight="bold" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {song.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => toggleSongFav(song.id)}
                      aria-label="Toggle favourite song"
                      style={{ padding: '2px', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      <Star
                        size={20}
                        weight={isFav ? 'fill' : 'bold'}
                        color={isFav ? 'var(--color-coral)' : 'var(--color-graphite)'}
                      />
                    </button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {song.filmOrArtist}
                  </p>
                  {song.album && (
                    <p style={{ fontSize: '0.75rem', color: '#7E8695' }}>
                      Album: {song.album}
                    </p>
                  )}
                </div>
              </div>

              {/* DEDICATED PLAYER BAR (Active for this song) */}
              {isThisActive && (
                <div
                  style={{
                    backgroundColor: 'var(--color-ivory)',
                    border: '2px solid var(--color-graphite)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    boxShadow: 'var(--shadow-retro-sm)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isThisPlaying ? 'var(--color-lime)' : 'var(--color-coral)',
                          border: '1px solid var(--color-graphite)'
                        }}
                      />
                      <span>{isThisPlaying ? '🎵 Gaana baj raha hai' : '⏸️ Gaana paused hai'}</span>
                    </div>

                    <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-graphite)' }}>
                      {formatTime(songCurrentTime)} / {formatTime(songDuration)}
                    </span>
                  </div>

                  {/* Draggable Progress Seeker */}
                  <div style={{ marginBottom: '4px' }}>
                    <input
                      type="range"
                      className="retro-range-slider"
                      min={0}
                      max={songMaxDur}
                      step={0.1}
                      value={songCurrentTime}
                      onMouseDown={() => setIsDraggingSong(true)}
                      onTouchStart={() => setIsDraggingSong(true)}
                      onChange={handleSongSeek}
                      onMouseUp={() => setIsDraggingSong(false)}
                      onTouchEnd={() => setIsDraggingSong(false)}
                      aria-label={`${song.title} progress`}
                      style={{
                        background: `linear-gradient(to right, var(--color-cobalt) 0%, var(--color-cobalt) ${songProgPercent}%, #D6D2C4 ${songProgPercent}%, #D6D2C4 100%)`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* CONTROLS: Play Karo / Pause Karo, Stop (when active), & Download Music */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleTogglePlaySong(song)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '11px 14px',
                    justifyContent: 'center',
                    backgroundColor: isThisPlaying ? 'var(--color-lime)' : 'var(--color-cobalt)',
                    color: isThisPlaying ? 'var(--color-graphite)' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-retro)'
                  }}
                >
                  {isThisPlaying ? <Pause size={18} weight="bold" /> : <Play size={18} weight="fill" />}
                  <span>{isThisPlaying ? 'Pause Karo' : 'Play Karo'}</span>
                </button>

                {isThisActive && (
                  <button
                    type="button"
                    onClick={handleStopSong}
                    className="btn btn-outline"
                    title="Stop song"
                    style={{
                      padding: '11px 14px',
                      justifyContent: 'center',
                      backgroundColor: 'var(--color-ivory)',
                      color: 'var(--color-graphite)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Stop size={18} weight="bold" />
                    <span>Stop</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadSong(song)}
                  className="btn btn-outline"
                  style={{
                    padding: '11px 16px',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-ivory)',
                    color: 'var(--color-graphite)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <DownloadSimple size={18} weight="bold" />
                  <span>Download Music</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
