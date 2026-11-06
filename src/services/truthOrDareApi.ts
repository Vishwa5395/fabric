import { GameSessionReport } from '../types/truthOrDare';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function checkRoomInfo(roomCode: string): Promise<{
  roomCode: string;
  status: string;
  totalRounds: number;
  currentRound: number;
  playerCount: number;
  players: Array<{ id: string; displayName: string; role: string; readyStatus: boolean }>;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/rooms/${encodeURIComponent(roomCode.toUpperCase().trim())}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to check room info:', err);
    return null;
  }
}

export async function authoriseUpload(metadata: {
  sessionId: string;
  playerId: string;
  dareId: string;
  evidenceType: 'audio' | 'video';
}): Promise<{ authorized: boolean; uploadAuthToken: string; uploadUrl: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/evidence/authorise-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Authorise upload failed:', err);
    return null;
  }
}

export async function uploadEvidenceFile(
  blob: Blob,
  metadata: {
    sessionId: string;
    roomId?: string;
    playerId: string;
    turnId?: string;
    dareId: string;
    originalPrompt: string;
    duration: number;
    evidenceType: 'audio' | 'video';
    fileName?: string;
  }
): Promise<{
  success: boolean;
  evidenceId?: string;
  storageKey?: string;
  signedViewUrl?: string;
  error?: string;
}> {
  try {
    const formData = new FormData();
    const defaultMime = metadata.evidenceType === 'video' ? 'video/webm' : 'audio/webm';
    const effectiveMime = blob.type || defaultMime;
    const isMp4 = effectiveMime.includes('mp4') || effectiveMime.includes('m4a');
    const ext = isMp4 ? (metadata.evidenceType === 'video' ? 'mp4' : 'm4a') : 'webm';
    const filename = metadata.fileName || `evidence_${Date.now()}.${ext}`;

    // Ensure the blob carries an explicit media MIME type
    const mediaBlob = blob.type ? blob : new Blob([blob], { type: effectiveMime });

    formData.append('file', mediaBlob, filename);
    formData.append('sessionId', metadata.sessionId);
    if (metadata.roomId) formData.append('roomId', metadata.roomId);
    formData.append('playerId', metadata.playerId);
    if (metadata.turnId) formData.append('turnId', metadata.turnId);
    formData.append('dareId', metadata.dareId);
    formData.append('originalPrompt', metadata.originalPrompt);
    formData.append('duration', String(metadata.duration));
    formData.append('evidenceType', metadata.evidenceType);

    const res = await fetch(`${API_BASE}/api/tod/evidence/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Upload failed' };
    }

    const data = await res.json();
    return {
      success: true,
      evidenceId: data.evidenceId,
      storageKey: data.storageKey,
      signedViewUrl: data.signedViewUrl
    };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { success: false, error: err.message || 'Network error during upload' };
  }
}

export async function fetchSessionReport(sessionId: string): Promise<GameSessionReport | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/reports/${encodeURIComponent(sessionId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Fetch session report failed:', err);
    return null;
  }
}

export async function deleteEvidence(evidenceId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/evidence/${encodeURIComponent(evidenceId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveAnswer(payload: {
  promptId: string;
  promptType: string;
  question: string;
  answer: string;
  playerName?: string;
}): Promise<{ success: boolean; answer?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to save answer' };
    }
    const data = await res.json();
    return { success: true, answer: data.answer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAnswerNode(payload: {
  promptId: string;
  promptType: string;
  promptText: string;
  parentId?: string | null;
  sessionId?: string;
  playerId?: string;
  playerName?: string;
  answerText: string;
}): Promise<{ success: boolean; node?: any; error?: string }> {
  return saveAnswer({
    promptId: payload.promptId,
    promptType: payload.promptType,
    question: payload.promptText,
    answer: payload.answerText,
    playerName: payload.playerName
  });
}

export async function fetchAnswerTree(promptId: string): Promise<{
  promptId: string;
  totalCount: number;
  branchCount: number;
  tree: any[];
} | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/answers/tree/${encodeURIComponent(promptId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDataInspector(): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tod/data-inspector`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
