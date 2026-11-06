import React, { useState, useRef, useEffect } from 'react';
import {
  Microphone,
  Stop,
  Play,
  Pause,
  ArrowCounterClockwise,
  UploadSimple,
  CheckCircle,
  WarningCircle
} from '@phosphor-icons/react';
import { uploadEvidenceFile } from '../../services/truthOrDareApi';

interface AudioEvidenceRecorderProps {
  sessionId: string;
  roomId?: string;
  playerId: string;
  turnId?: string;
  dareId: string;
  promptText: string;
  maxDurationSeconds?: number | null;
  onUploadSuccess: (evidenceId: string, signedViewUrl?: string) => void;
  onCancel: () => void;
}

export const AudioEvidenceRecorder: React.FC<AudioEvidenceRecorderProps> = ({
  sessionId,
  roomId,
  playerId,
  turnId,
  dareId,
  promptText,
  maxDurationSeconds = 20,
  onUploadSuccess,
  onCancel
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const isUploadingRef = useRef<boolean>(false);
  const maxSecs = maxDurationSeconds || 20;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicError(null);
    setUploadError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState('stopped');
      };

      recorder.start(250);
      setRecordingState('recording');
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => {
          const next = prev + 1;
          if (next >= maxSecs) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicError('Microphone permission enable karein recording ke liye.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetake = () => {
    isUploadingRef.current = false;
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState('idle');
    setUploadError(null);
  };

  const togglePreview = () => {
    if (!audioPreviewRef.current || !audioUrl) return;

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob || isUploadingRef.current) return;
    isUploadingRef.current = true;
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadEvidenceFile(audioBlob, {
        sessionId,
        roomId,
        playerId,
        turnId,
        dareId,
        originalPrompt: promptText,
        duration,
        evidenceType: 'audio'
      });

      if (result.success && result.evidenceId) {
        onUploadSuccess(result.evidenceId, result.signedViewUrl);
      } else {
        isUploadingRef.current = false;
        setIsUploading(false);
        setUploadError(result.error || 'Upload fail ho gaya. Dubara try karein.');
      }
    } catch (e: any) {
      isUploadingRef.current = false;
      setIsUploading(false);
      setUploadError(e.message || 'Upload fail ho gaya.');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="card"
      style={{
        padding: '16px',
        backgroundColor: 'var(--color-ivory)',
        border: 'var(--border-width) solid var(--color-graphite)',
        boxShadow: 'var(--shadow-retro)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span className="badge badge-coral">AUDIO EVIDENCE RECORDER</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
          Max: {maxSecs}s
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-graphite)', fontWeight: 600, marginBottom: '12px' }}>
        Dare challenge complete karne ke liye apni audio record karein:
      </p>

      {micError && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#FFEAEA',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-coral)',
            fontSize: '0.85rem',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <WarningCircle size={18} weight="fill" color="var(--color-coral)" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording Meter & Timer */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
          marginBottom: '14px'
        }}
      >
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-graphite)' }}>
          {formatTime(duration)}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '6px' }}>/ {formatTime(maxSecs)}</span>
        </div>

        {recordingState === 'recording' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'red',
                display: 'inline-block',
                animation: 'pulse 1s infinite'
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'red' }}>RECORDING IN PROGRESS...</span>
          </div>
        )}

        {recordingState === 'stopped' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
            <CheckCircle size={18} weight="fill" color="green" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'green' }}>Audio Ready for Preview</span>
          </div>
        )}
      </div>

      {/* Audio Playback Element if stopped */}
      {audioUrl && (
        <audio
          ref={audioPreviewRef}
          src={audioUrl}
          onEnded={() => setIsPlayingPreview(false)}
          style={{ display: 'none' }}
        />
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recordingState === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            className="btn btn-primary"
            style={{
              padding: '12px',
              justifyContent: 'center',
              backgroundColor: 'var(--color-coral)',
              color: '#FFFFFF',
              fontWeight: 800
            }}
          >
            <Microphone size={20} weight="fill" />
            <span>Record Awaaz Shuru Karo</span>
          </button>
        )}

        {recordingState === 'recording' && (
          <button
            type="button"
            onClick={stopRecording}
            className="btn btn-primary"
            style={{
              padding: '12px',
              justifyContent: 'center',
              backgroundColor: 'var(--color-graphite)',
              color: '#FFFFFF',
              fontWeight: 800
            }}
          >
            <Stop size={20} weight="fill" />
            <span>Recording Roko (Stop)</span>
          </button>
        )}

        {recordingState === 'stopped' && (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={togglePreview}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', justifyContent: 'center', fontWeight: 700 }}
              >
                {isPlayingPreview ? <Pause size={18} weight="bold" /> : <Play size={18} weight="fill" />}
                <span>{isPlayingPreview ? 'Pause' : 'Suno (Preview)'}</span>
              </button>

              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-outline"
                style={{ padding: '10px 14px', justifyContent: 'center' }}
                title="Dubara record karein"
              >
                <ArrowCounterClockwise size={18} weight="bold" />
                <span>Retake</span>
              </button>
            </div>

            {uploadError && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-coral)', fontWeight: 600 }}>
                {uploadError}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="btn btn-primary"
              style={{
                padding: '12px',
                justifyContent: 'center',
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-graphite)',
                fontWeight: 800,
                marginTop: '4px'
              }}
            >
              <UploadSimple size={20} weight="bold" />
              <span>{isUploading ? 'Uploading Evidence...' : 'Upload Karo & Dare Complete (+15 Pts)'}</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className="btn btn-outline"
          style={{ padding: '8px', justifyContent: 'center', fontSize: '0.85rem' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
