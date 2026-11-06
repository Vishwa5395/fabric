import React, { useState, useRef, useEffect } from 'react';
import {
  VideoCamera,
  Stop,
  Play,
  ArrowCounterClockwise,
  UploadSimple,
  WarningCircle
} from '@phosphor-icons/react';
import { uploadEvidenceFile } from '../../services/truthOrDareApi';

interface VideoEvidenceRecorderProps {
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

export const VideoEvidenceRecorder: React.FC<VideoEvidenceRecorderProps> = ({
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
  const [recordingState, setRecordingState] = useState<'idle' | 'preview_camera' | 'recording' | 'stopped'>('idle');
  const [duration, setDuration] = useState<number>(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoLiveRef = useRef<HTMLVideoElement | null>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const isUploadingRef = useRef<boolean>(false);
  const maxSecs = maxDurationSeconds || 20;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [videoUrl]);

  const initCamera = async () => {
    setCameraError(null);
    setUploadError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream;
      }
      setRecordingState('preview_camera');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera aur Microphone permission allow karein video recording ke liye.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : '';

    const recorder = mimeType
      ? new MediaRecorder(streamRef.current, { mimeType })
      : new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
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
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setRecordingState('idle');
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!videoBlob || isUploadingRef.current) return;
    isUploadingRef.current = true;
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadEvidenceFile(videoBlob, {
        sessionId,
        roomId,
        playerId,
        turnId,
        dareId,
        originalPrompt: promptText,
        duration,
        evidenceType: 'video'
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

  const progressPercent = Math.min(100, (duration / maxSecs) * 100);

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
        <span className="badge badge-coral">VIDEO EVIDENCE RECORDER</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
          Limit: {maxSecs}s
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--color-graphite)', fontWeight: 600, marginBottom: '12px' }}>
        Dare challenge complete karne ke liye apna short video record karein:
      </p>

      {cameraError && (
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
          <span>{cameraError}</span>
        </div>
      )}

      {/* Video Viewport Container */}
      <div
        style={{
          width: '100%',
          height: '240px',
          backgroundColor: '#000000',
          borderRadius: 'var(--radius-sm)',
          border: 'var(--border-width) solid var(--color-graphite)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}
      >
        {recordingState === 'idle' && (
          <div style={{ textAlign: 'center', color: '#FFFFFF', padding: '16px' }}>
            <VideoCamera size={44} weight="bold" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Camera kholne ke liye neeche button dabayein</p>
          </div>
        )}

        {(recordingState === 'preview_camera' || recordingState === 'recording') && (
          <>
            <video
              ref={videoLiveRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {recordingState === 'recording' && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'red',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <span>REC {duration}s / {maxSecs}s</span>
              </div>
            )}
          </>
        )}

        {recordingState === 'stopped' && videoUrl && (
          <video
            ref={videoPlaybackRef}
            src={videoUrl}
            controls
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Progress Bar during recording */}
      {recordingState === 'recording' && (
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#E0E0E0',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'red',
              transition: 'width 0.2s linear'
            }}
          />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recordingState === 'idle' && (
          <button
            type="button"
            onClick={initCamera}
            className="btn btn-primary"
            style={{
              padding: '12px',
              justifyContent: 'center',
              backgroundColor: 'var(--color-coral)',
              color: '#FFFFFF',
              fontWeight: 800
            }}
          >
            <VideoCamera size={20} weight="fill" />
            <span>Camera Kholo & Taiyaar Ho</span>
          </button>
        )}

        {recordingState === 'preview_camera' && (
          <button
            type="button"
            onClick={startRecording}
            className="btn btn-primary"
            style={{
              padding: '12px',
              justifyContent: 'center',
              backgroundColor: 'red',
              color: '#FFFFFF',
              fontWeight: 800
            }}
          >
            <Play size={20} weight="fill" />
            <span>Start Video Recording ({maxSecs}s)</span>
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
            <span>Video Recording Roko (Stop)</span>
          </button>
        )}

        {recordingState === 'stopped' && (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
              >
                <ArrowCounterClockwise size={18} weight="bold" />
                <span>Retake Video</span>
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
              <span>{isUploading ? 'Uploading Video...' : 'Upload Video & Complete Dare (+15 Pts)'}</span>
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
