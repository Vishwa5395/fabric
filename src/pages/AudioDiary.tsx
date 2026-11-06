import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MicrophoneStage,
  Play,
  Pause,
  Stop,
  Star,
  Trash,
  DownloadSimple,
  MagnifyingGlass,
  Check,
  Warning,
  SlidersHorizontal,
  Waveform
} from '@phosphor-icons/react';
import {
  getAllRecordings,
  saveRecording,
  deleteRecording,
  getAnyRecordingDraft,
  clearRecordingDraft,
  saveRecordingDraft,
  RecordingEntry,
  RecordingDraft
} from '../services/storage';
import { audioManager } from '../services/audioManager';
import { achievementEngine } from '../services/achievements';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastProvider';

type AudioTab = 'recorder' | 'recordings' | 'favourites';
type RecordState = 'idle' | 'requestingPermission' | 'recording' | 'paused' | 'stopped' | 'saving';

export const AudioDiary: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AudioTab>('recorder');
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Recorder states
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [durationSec, setDurationSec] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Form after recording
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedMime, setRecordedMime] = useState<string>('audio/webm');
  const [recTitle, setRecTitle] = useState<string>('');
  const [recDesc, setRecDesc] = useState<string>('');
  const [recTags, setRecTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Audio Playback in library
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Crash Draft
  const [crashDraft, setCrashDraft] = useState<RecordingDraft | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // References for MediaRecorder and Web Audio analyser
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(Math.random().toString(36).slice(2, 9));
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const loadRecordings = async () => {
    try {
      const { recordings: all } = await getAllRecordings();
      setRecordings(all);

      // Check crash draft
      const draft = await getAnyRecordingDraft();
      if (draft && draft.chunks.length > 0) {
        setCrashDraft(draft);
      } else {
        setCrashDraft(null);
      }
    } catch (e) {
      console.warn('Failed to load recordings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();

    return () => {
      // Cleanup any active playback on unmount
      audioManager.stopPlayback();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Format selector
  const getSupportedMimeType = (): string => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) {
        return c;
      }
    }
    return 'audio/webm';
  };

  // Waveform visualization
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#202329';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#C5E66A';
    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  // Start Recording
  const handleStartRecord = async () => {
    setPermissionError(null);
    setRecordState('requestingPermission');

    // 1. Pauses ambient sound
    audioManager.pauseAmbient();
    audioManager.stopPlayback();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Is device par mic support nahi mila.');
        setRecordState('idle');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;

      // Screen WakeLock API
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
        } catch {
          // wakeLock optional
        }
      }

      // Audio Analyser
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new AudioCtxClass();
      audioContextRef.current = actx;
      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = getSupportedMimeType();
      setRecordedMime(mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      sessionIdRef.current = Math.random().toString(36).slice(2, 9);

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          // Crash recovery chunk save
          saveRecordingDraft({
            sessionId: sessionIdRef.current,
            mimeType,
            chunks: [...recordedChunksRef.current],
            startedAt: new Date().toISOString()
          });
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        setRecTitle(`Recording — ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}`);
        setRecordState('stopped');

        // Cleanup tracks
        stream.getTracks().forEach(t => t.stop());
        if (wakeLockRef.current) {
          wakeLockRef.current.release().catch(() => {});
          wakeLockRef.current = null;
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      recorder.start(1000);
      startTimeRef.current = Date.now();
      accumulatedMsRef.current = 0;
      setDurationSec(0);
      setRecordState('recording');

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setDurationSec(prev => prev + 1);
      }, 1000);

      // Start drawing waveform
      drawWaveform();
    } catch (err: unknown) {
      console.error(err);
      const str = String(err);
      if (str.includes('NotAllowedError') || str.includes('Permission')) {
        setPermissionError('Mic ki permission nahi mili. Browser settings mein mic allow karke dobara try karein.');
      } else {
        setPermissionError('Is device par mic start nahi ho saka.');
      }
      setRecordState('idle');
    }
  };

  const handlePauseResumeRecord = () => {
    if (!mediaRecorderRef.current) return;

    if (recordState === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setRecordState('paused');
    } else if (recordState === 'paused') {
      mediaRecorderRef.current.resume();
      timerIntervalRef.current = setInterval(() => {
        setDurationSec(prev => prev + 1);
      }, 1000);
      drawWaveform();
      setRecordState('recording');
    }
  };

  const handleStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      mediaRecorderRef.current.stop();
    }
  };

  const handleDiscardRecord = async () => {
    if (durationSec > 5) {
      const confirmDiscard = window.confirm('Recording discard karni hai?');
      if (!confirmDiscard) return;
    }
    await clearRecordingDraft(sessionIdRef.current);
    setRecordedBlob(null);
    setRecordState('idle');
    setDurationSec(0);
  };

  const handleSaveRecord = async () => {
    if (!recordedBlob) return;

    setRecordState('saving');
    const id = Math.random().toString(36).slice(2, 11);
    const totalMs = durationSec * 1000;

    const newRec: RecordingEntry = {
      id,
      title: recTitle.trim() || 'Untitled Voice Memo',
      description: recDesc.trim() || undefined,
      tags: recTags,
      createdAt: new Date().toISOString(),
      durationMs: totalMs,
      mimeType: recordedMime,
      sizeBytes: recordedBlob.size,
      favourite: false,
      blob: recordedBlob
    };

    try {
      await saveRecording(newRec);
      await clearRecordingDraft(sessionIdRef.current);
      await achievementEngine.emit('recording_saved');
      showToast('Recording save ho gayi!', 'success');

      // Reset & switch to library
      setRecordedBlob(null);
      setRecordState('idle');
      setDurationSec(0);
      setRecTags([]);
      setRecDesc('');
      await loadRecordings();
      setActiveTab('recordings');
    } catch {
      showToast('Recording save nahi ho paayi.', 'error');
      setRecordState('stopped');
    }
  };

  // Recover crash draft
  const handleRecoverDraft = () => {
    if (!crashDraft) return;
    const blob = new Blob(crashDraft.chunks, { type: crashDraft.mimeType });
    setRecordedBlob(blob);
    setRecordedMime(crashDraft.mimeType);
    setRecTitle(`Recovered Recording — ${new Date(crashDraft.startedAt).toLocaleDateString()}`);
    setDurationSec(Math.round(blob.size / 16000)); // rough estimate
    setRecordState('stopped');
    setCrashDraft(null);
  };

  const handleDiscardCrashDraft = async () => {
    if (!crashDraft) return;
    await clearRecordingDraft(crashDraft.sessionId);
    setCrashDraft(null);
  };

  // Playback in library
  const handleTogglePlayRecording = (rec: RecordingEntry) => {
    if (playingId === rec.id) {
      audioManager.stopPlayback();
      setPlayingId(null);
    } else {
      const audio = audioManager.playRecording(rec.blob, rec.id);
      setPlayingId(rec.id);

      audio.addEventListener('ended', () => {
        setPlayingId(null);
      });
    }
  };

  const handleToggleFavourite = async (rec: RecordingEntry) => {
    const updated = { ...rec, favourite: !rec.favourite };
    await saveRecording(updated);
    showToast(updated.favourite ? 'Favourite mein save ho gaya!' : 'Favourite se hata diya', 'info');
    loadRecordings();
  };

  const handleDownload = (rec: RecordingEntry) => {
    const dateStr = new Date(rec.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTitle = rec.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const ext = rec.mimeType.includes('mp4') ? 'mp4' : rec.mimeType.includes('ogg') ? 'ogg' : rec.mimeType.includes('wav') ? 'wav' : 'webm';
    const filename = `${cleanTitle}-${dateStr}.${ext}`;

    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteRecording(deleteId);
      showToast('Recording delete ho gayi.', 'info');
      setDeleteId(null);
      loadRecordings();
    } catch {
      showToast('Delete nahi ho saka.', 'error');
    }
  };

  const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter list
  const filteredRecordings = recordings.filter(r => {
    if (activeTab === 'favourites' && !r.favourite) return false;
    if (selectedTag && !r.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q));
    }
    return true;
  });

  // All unique tags
  const allTags = Array.from(new Set(recordings.flatMap(r => r.tags)));

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <span className="badge badge-cobalt" style={{ marginBottom: '6px' }}>AUDIO ARCHIVES</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          Jo kehna hai, apni awaaz mein keh do.
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('recorder')}
          className={`btn ${activeTab === 'recorder' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <MicrophoneStage size={18} weight="bold" />
          <span>Recorder</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recordings')}
          className={`btn ${activeTab === 'recordings' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Waveform size={18} weight="bold" />
          <span>My Recordings ({recordings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favourites')}
          className={`btn ${activeTab === 'favourites' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Star size={18} weight="bold" />
          <span>Favs</span>
        </button>
      </div>

      {/* Crash Recovery Banner */}
      {crashDraft && (
        <div
          className="card"
          style={{
            marginBottom: '16px',
            backgroundColor: 'var(--color-coral)',
            border: '2px solid var(--color-graphite)',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Warning size={20} weight="bold" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              Ek adhuri recording mili!
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
            App band hone se pehle ki recording safe hai. Kya ise recover karna chahte hain?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleRecoverDraft}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Recover Karein
            </button>
            <button
              type="button"
              onClick={handleDiscardCrashDraft}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 1: RECORDER ================= */}
      {activeTab === 'recorder' && (
        <div className="card" style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          {permissionError && (
            <div
              style={{
                backgroundColor: 'var(--color-coral)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left'
              }}
            >
              {permissionError}
            </div>
          )}

          {/* Canvas Waveform */}
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            aria-label="Live audio waveform display"
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: 'var(--color-graphite)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}
          />

          {/* Status Label & Timer */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace' }}>
              {formatTime(durationSec)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {recordState === 'idle' && 'Mic taiyaar hai. Record button dabayein.'}
              {recordState === 'requestingPermission' && 'Mic permission maang rahe hain...'}
              {recordState === 'recording' && '🔴 Recording chal rahi hai (Ambient paused)'}
              {recordState === 'paused' && '⏸ Recording ruki hui hai'}
              {recordState === 'stopped' && 'Preview aur details fill karein'}
              {recordState === 'saving' && 'Save ho rahi hai...'}
            </div>
          </div>

          {/* Record / Pause / Stop Controls */}
          {recordState === 'idle' && (
            <button
              type="button"
              onClick={handleStartRecord}
              className="btn btn-coral"
              style={{ padding: '16px 32px', fontSize: '1.1rem', fontWeight: 800, margin: '0 auto' }}
            >
              <MicrophoneStage size={24} weight="bold" />
              <span>Record Shuru Karo</span>
            </button>
          )}

          {(recordState === 'recording' || recordState === 'paused') && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handlePauseResumeRecord}
                className="btn btn-outline"
                style={{ padding: '12px 20px' }}
              >
                {recordState === 'recording' ? <Pause size={20} weight="bold" /> : <Play size={20} weight="bold" />}
                <span>{recordState === 'recording' ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                type="button"
                onClick={handleStopRecord}
                className="btn btn-coral"
                style={{ padding: '12px 20px', fontWeight: 800 }}
              >
                <Stop size={20} weight="bold" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Stopped: Preview & Save Form */}
          {recordState === 'stopped' && recordedBlob && (
            <div style={{ textAlign: 'left', marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              {/* Audio element preview */}
              <audio
                controls
                src={URL.createObjectURL(recordedBlob)}
                style={{ width: '100%', marginBottom: '16px' }}
              />

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Title:
                </label>
                <input
                  type="text"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="Recording Title..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Description (optional):
                </label>
                <input
                  type="text"
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  placeholder="Kiske baare mein tha..."
                  style={{ width: '100%' }}
                />
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Tags:
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {recTags.map(t => (
                    <span key={t} className="badge badge-lime">
                      #{t}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Naya tag (e.g. funny, diary)..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        setRecTags(prev => [...prev, newTagInput.trim().toLowerCase()]);
                        setNewTagInput('');
                      }
                    }}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleDiscardRecord}
                  className="btn btn-outline"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  className="btn btn-primary"
                >
                  <Check size={18} weight="bold" />
                  <span>Save Memo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2 & 3: RECORDINGS / FAVOURITES ================= */}
      {(activeTab === 'recordings' || activeTab === 'favourites') && (
        <div>
          {/* Search & Tag Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <MagnifyingGlass
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recordings..."
                aria-label="Search recordings"
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Tag Filter Chips */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`badge ${selectedTag === null ? 'badge-cobalt' : 'badge-lime'}`}
                style={{ cursor: 'pointer', padding: '4px 10px' }}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                  className={`badge ${selectedTag === tag ? 'badge-cobalt' : 'badge-lime'}`}
                  style={{ cursor: 'pointer', padding: '4px 10px' }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!loading && recordings.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '16px' }}>
                Abhi koi recording nahi. Pehli awaaz record karo.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('recorder')}
                className="btn btn-primary"
              >
                Record Karo
              </button>
            </div>
          )}

          {!loading && recordings.length > 0 && filteredRecordings.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'favourites'
                  ? 'Favourite recordings yahan dikhengi.'
                  : 'Is naam ki koi recording nahi mili.'}
              </p>
            </div>
          )}

          {/* Recordings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRecordings.map(rec => {
              const isThisPlaying = playingId === rec.id;
              const dateStr = new Date(rec.createdAt).toLocaleDateString('hi-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const durSec = Math.round(rec.durationMs / 1000);

              return (
                <div
                  key={rec.id}
                  className="card"
                  style={{
                    borderLeft: isThisPlaying ? '6px solid var(--color-lime)' : '6px solid var(--color-cobalt)',
                    backgroundColor: isThisPlaying ? '#FFFDF8' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                        {rec.title}
                      </h2>
                      {rec.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {rec.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavourite(rec)}
                      aria-label={rec.favourite ? 'Remove favourite' : 'Make favourite'}
                      style={{ padding: '4px', cursor: 'pointer' }}
                    >
                      <Star
                        size={20}
                        weight={rec.favourite ? 'fill' : 'bold'}
                        color={rec.favourite ? 'var(--color-coral)' : 'var(--color-graphite)'}
                      />
                    </button>
                  </div>

                  {/* Tags */}
                  {rec.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {rec.tags.map(t => (
                        <span key={t} className="badge badge-lime" style={{ fontSize: '0.7rem' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Play & Info Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePlayRecording(rec)}
                        className="btn btn-primary"
                        aria-label={isThisPlaying ? 'Pause recording' : 'Play recording'}
                        style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-full)' }}
                      >
                        {isThisPlaying ? <Pause size={18} weight="bold" /> : <Play size={18} weight="fill" />}
                      </button>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{formatTime(durSec)}</span> • <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Action buttons: Edit, Download, Delete */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/audio/edit/${rec.id}`)}
                        aria-label="Edit and trim recording"
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                      >
                        <SlidersHorizontal size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(rec)}
                        aria-label="Download audio file"
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                      >
                        <DownloadSimple size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteId(rec.id)}
                        aria-label="Delete recording"
                        className="btn btn-outline"
                        style={{ padding: '6px', color: 'var(--color-coral)' }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Recording Delete Karein?"
        message="Pakka delete karna hai? Ye wapas nahi aayega."
        confirmLabel="Haan, Delete Karo"
        cancelLabel="Rehne Do"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
