import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Scissors,
  Play,
  Pause,
  FloppyDisk
} from '@phosphor-icons/react';
import {
  getRecording,
  saveRecording,
  RecordingEntry
} from '../services/storage';
import { encodeAudioBufferToWav } from '../utils/wavEncoder';
import { audioManager } from '../services/audioManager';
import { useToast } from '../components/common/ToastProvider';

export const AudioEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [recording, setRecording] = useState<RecordingEntry | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [favourite, setFavourite] = useState<boolean>(false);

  // Audio decoding & waveform
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [decodeFailed, setDecodeFailed] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);

  // Trim playback preview
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save options
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const rec = await getRecording(id);
      if (!rec) {
        showToast('Recording nahi mili.', 'error');
        navigate('/audio');
        return;
      }
      setRecording(rec);
      setTitle(rec.title);
      setDescription(rec.description || '');
      setTags(rec.tags);
      setFavourite(rec.favourite);

      // Try decoding audio for waveform & trimming
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtxClass();
        audioContextRef.current = ctx;

        const arrayBuf = await rec.blob.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        setAudioBuffer(decoded);
        setDuration(decoded.duration);
        setTrimStart(0);
        setTrimEnd(decoded.duration);
      } catch (e) {
        console.warn('Audio decode failed:', e);
        setDecodeFailed(true);
      }
    }

    load();

    return () => {
      if (previewSourceRef.current) {
        try {
          previewSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [id, navigate, showToast]);

  // Draw PCM waveform
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = '#202329';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#5478E8';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Draw trim boundaries
    if (duration > 0) {
      const startX = (trimStart / duration) * canvas.width;
      const endX = (trimEnd / duration) * canvas.width;

      // Dim outside areas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, startX, canvas.height);
      ctx.fillRect(endX, 0, canvas.width - endX, canvas.height);

      // Line markers
      ctx.strokeStyle = '#C5E66A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, canvas.height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, canvas.height);
      ctx.stroke();
    }
  }, [audioBuffer, duration, trimStart, trimEnd]);

  // Preview Trim Audio
  const handleTogglePreviewTrim = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    if (isPreviewPlaying) {
      if (previewSourceRef.current) {
        try {
          previewSourceRef.current.stop();
        } catch {
          // ignore
        }
        previewSourceRef.current = null;
      }
      setIsPreviewPlaying(false);
      return;
    }

    // Stop ambient
    audioManager.pauseAmbient();
    audioManager.stopPlayback();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    previewSourceRef.current = source;

    const playLength = Math.max(0.1, trimEnd - trimStart);
    source.start(0, trimStart, playLength);
    setIsPreviewPlaying(true);

    source.onended = () => {
      setIsPreviewPlaying(false);
    };
  };

  // Keyboard adjustment for handles (+-0.1s)
  const handleKeyDownStart = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setTrimStart(prev => Math.max(0, prev - 0.1));
    } else if (e.key === 'ArrowRight') {
      setTrimStart(prev => Math.min(trimEnd - 0.2, prev + 0.1));
    }
  };

  const handleKeyDownEnd = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setTrimEnd(prev => Math.max(trimStart + 0.2, prev - 0.1));
    } else if (e.key === 'ArrowRight') {
      setTrimEnd(prev => Math.min(duration, prev + 0.1));
    }
  };

  // Save (offers replace or new copy)
  const handleSave = async (asNewCopy: boolean) => {
    if (!recording) return;
    setIsSaving(true);

    try {
      let finalBlob = recording.blob;
      let finalDurationMs = recording.durationMs;
      let finalMime = recording.mimeType;

      const hasTrimmed = audioBuffer && (trimStart > 0.05 || trimEnd < duration - 0.05);

      if (hasTrimmed && audioBuffer) {
        finalBlob = encodeAudioBufferToWav(audioBuffer, trimStart, trimEnd);
        finalDurationMs = Math.round((trimEnd - trimStart) * 1000);
        finalMime = 'audio/wav';

        // Size warning check
        if (!asNewCopy && finalBlob.size > recording.sizeBytes * 2) {
          const confirmLarge = window.confirm(
            'Trimmed WAV file original se badi ho sakti hai. Kya aap sure hain ki replace karna hai?'
          );
          if (!confirmLarge) {
            setIsSaving(false);
            return;
          }
        }
      }

      const targetId = asNewCopy ? Math.random().toString(36).slice(2, 11) : recording.id;
      const updatedRec: RecordingEntry = {
        id: targetId,
        title: asNewCopy ? `${title} (Trimmed Copy)` : title,
        description: description || undefined,
        tags,
        createdAt: asNewCopy ? new Date().toISOString() : recording.createdAt,
        durationMs: finalDurationMs,
        mimeType: finalMime,
        sizeBytes: finalBlob.size,
        favourite,
        blob: finalBlob
      };

      await saveRecording(updatedRec);
      showToast(asNewCopy ? 'Nayi copy save ho gayi!' : 'Recording update ho gayi!', 'success');
      navigate('/audio');
    } catch {
      showToast('Save nahi ho saka.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!recording) return null;

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/audio')}
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Wapas</span>
        </button>

        <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Recording</h1>
      </div>

      {/* Metadata editing */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
            Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', fontWeight: 700 }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
            Description:
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
            Tags:
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {tags.map(t => (
              <span
                key={t}
                className="badge badge-lime"
                style={{ cursor: 'pointer' }}
                onClick={() => setTags(prev => prev.filter(x => x !== t))}
                title="Tap to remove"
              >
                #{t} ×
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                if (tagInput.trim()) {
                  setTags(prev => [...prev, tagInput.trim().toLowerCase()]);
                  setTagInput('');
                }
              }}
              className="btn btn-outline"
            >
              Add
            </button>
          </div>
        </div>

        {/* Favourite toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={favourite}
            onChange={(e) => setFavourite(e.target.checked)}
            style={{ accentColor: 'var(--color-coral)' }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Mark as Favourite</span>
        </label>
      </div>

      {/* Trimming Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Scissors size={20} weight="bold" color="var(--color-cobalt)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Trim Audio</h2>
        </div>

        {decodeFailed ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-ivory)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            Is browser mein is recording ko trim nahi kar sakte. Baaki edits kaam karenge.
          </div>
        ) : (
          <div>
            <canvas
              ref={canvasRef}
              width={400}
              height={90}
              style={{
                width: '100%',
                height: '90px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '14px'
              }}
            />

            {/* Handle range sliders with touch & keyboard support */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  Start: {trimStart.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, trimEnd - 0.2)}
                  step={0.1}
                  value={trimStart}
                  onKeyDown={handleKeyDownStart}
                  onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                  End: {trimEnd.toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={Math.min(duration, trimStart + 0.2)}
                  max={duration}
                  step={0.1}
                  value={trimEnd}
                  onKeyDown={handleKeyDownEnd}
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-lime)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Preview Trim */}
            <button
              type="button"
              onClick={handleTogglePreviewTrim}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
            >
              {isPreviewPlaying ? <Pause size={18} weight="bold" /> : <Play size={18} weight="fill" />}
              <span>{isPreviewPlaying ? 'Pause Preview' : 'Preview Trim (Selected Range)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Save Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <FloppyDisk size={18} weight="bold" />
          <span>Save (Replace Original)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>Save As New Copy</span>
        </button>
      </div>
    </div>
  );
};
