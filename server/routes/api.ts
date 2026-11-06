import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { db, resetDatabase } from '../db/database';
import { storageAdapter } from '../storage/storageAdapter';
import { roomManager } from '../game/roomManager';

export const apiRouter = Router();

// Configure multer memory storage with 25MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB
  },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const orig = (file.originalname || '').toLowerCase();
    const isMediaExt = /\.(webm|m4a|mp4|mp3|wav|ogg|aac|flac|mov|avi|mkv|opus)$/i.test(orig);
    const isMediaMime =
      mime.startsWith('audio/') ||
      mime.startsWith('video/') ||
      mime.startsWith('application/octet-stream') ||
      mime.includes('webm') ||
      mime.includes('matroska') ||
      mime.includes('mp4') ||
      mime.includes('ogg') ||
      mime === '' ||
      mime === 'application/binary';

    if (isMediaMime || isMediaExt) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// 1. Health Check & Keep-Alive Cron Ping
apiRouter.get(['/health', '/cron/keepalive', '/keepalive'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    service: 'Truth or Dare Game Server',
    keepAlive: 'active',
    timestamp: new Date().toISOString()
  });
});

// 2. Room Info
apiRouter.get('/tod/rooms/:code', (req: Request, res: Response) => {
  const room = roomManager.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    roomCode: room.roomCode,
    status: room.status,
    totalRounds: room.totalRounds,
    currentRound: room.currentRound,
    playerCount: room.players.length,
    players: room.players.map(p => ({
      id: p.id,
      displayName: p.displayName,
      role: p.role,
      score: p.score,
      readyStatus: p.readyStatus
    }))
  });
});

// 3. Request Upload Authorization
apiRouter.post('/tod/evidence/request-upload', (req: Request, res: Response) => {
  const { sessionId, playerId, dareId, evidenceType } = req.body;
  if (!sessionId || !playerId || !dareId || !evidenceType) {
    return res.status(400).json({ error: 'Missing required authorization parameters' });
  }

  const authPayload = {
    sessionId,
    playerId,
    dareId,
    evidenceType,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  const uploadAuthToken = Buffer.from(JSON.stringify(authPayload)).toString('base64url');

  res.json({
    authorized: true,
    uploadAuthToken,
    maxSizeBytes: 25 * 1024 * 1024,
    uploadUrl: '/api/tod/evidence/upload'
  });
});

// 4. Secure Media Upload (Stores in simplified evidence table)
apiRouter.post(
  '/tod/evidence/upload',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer file parsing error:', err);
        return res.status(400).json({ error: err.message || 'File parsing failed.' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Valid audio or video recording file is required.' });
      }

      const {
        sessionId,
        playerId,
        playerName,
        dareId,
        originalPrompt,
        challenge,
        duration,
        evidenceType
      } = req.body;

      const effectiveDareId = dareId || 'DARE-RECORDING';
      const effectiveChallenge = challenge || originalPrompt || effectiveDareId;
      const effectivePlayerName = playerName || (playerId === 'solo-player' ? 'Mausami Ji' : 'Player');
      const now = new Date().toISOString();

      // Deduplication check: if evidence for this dare was already submitted by this player with identical size
      const recentDuplicate = db.prepare(`
        SELECT * FROM evidence
        WHERE dare_id = ? AND player_name = ? AND file_size = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(effectiveDareId, effectivePlayerName, file.size) as any;

      if (recentDuplicate) {
        return res.status(200).json({
          success: true,
          evidenceId: recentDuplicate.id,
          storageKey: recentDuplicate.storage_object_key,
          signedViewUrl: recentDuplicate.file_url,
          fileSize: recentDuplicate.file_size,
          duration: recentDuplicate.duration,
          status: 'uploaded',
          deduplicated: true
        });
      }

      const evidenceId = crypto.randomUUID();
      const ext = path.extname(file.originalname) || (file.mimetype.includes('video') ? '.webm' : '.webm');
      const storageKey = `tod/${sessionId || 'solo'}/${evidenceId}${ext}`;

      // Save file into private storage
      await storageAdapter.saveObject(storageKey, file.buffer);

      const parsedDuration = parseFloat(duration) || 0;
      const signedViewUrl = storageAdapter.getSignedViewUrl(storageKey, 1440); // 24 hours

      // Store in simplified evidence table
      db.prepare(`
        INSERT INTO evidence (
          id, dare_id, challenge, evidence_type, player_name,
          file_url, storage_object_key, file_size, duration, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evidenceId,
        effectiveDareId,
        effectiveChallenge,
        evidenceType || (file.mimetype.includes('video') ? 'video' : 'audio'),
        effectivePlayerName,
        signedViewUrl,
        storageKey,
        file.size,
        parsedDuration,
        now
      );

      res.status(201).json({
        success: true,
        evidenceId,
        storageKey,
        signedViewUrl,
        fileSize: file.size,
        duration: parsedDuration,
        status: 'uploaded'
      });
    } catch (err: any) {
      console.error('Evidence upload error:', err);
      res.status(500).json({ error: err.message || 'Evidence upload failed' });
    }
  }
);

// 5. Media Streaming
apiRouter.get('/tod/evidence/stream/:token', (req: Request, res: Response) => {
  try {
    const key = storageAdapter.constructor ? (storageAdapter as any).verifyToken?.(req.params.token) : null;
    const verifiedKey = key || Buffer.from(req.params.token, 'base64url').toString('utf-8');

    if (!verifiedKey || verifiedKey.includes('..')) {
      return res.status(403).json({ error: 'Invalid or expired viewing token' });
    }

    const stream = storageAdapter.getObjectStream(verifiedKey);
    res.setHeader('Content-Type', verifiedKey.endsWith('.webm') ? 'video/webm' : 'audio/webm');
    stream.on('error', () => {
      res.status(404).end();
    });
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'Media file not found' });
  }
});

// 6. Delete Evidence
apiRouter.delete('/tod/evidence/:id', async (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM evidence WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }

  try {
    await storageAdapter.deleteObject(row.storage_object_key);
  } catch (e) {
    // ignore missing file on disk
  }
  db.prepare('DELETE FROM evidence WHERE id = ?').run(req.params.id);

  res.json({ success: true, deletedId: req.params.id });
});

// 7. Save Answer into Database (Simplified structure)
apiRouter.post('/tod/answers', (req: Request, res: Response) => {
  try {
    const {
      promptId,
      promptType,
      question,
      promptText,
      answer,
      answerText,
      playerName
    } = req.body;

    const effectivePromptId = promptId || 'PROMPT-GENERAL';
    const effectiveQuestion = question || promptText || 'Truth Question';
    const effectiveAnswer = (answer !== undefined ? answer : answerText || '').trim();
    const effectivePlayerName = playerName || 'Mausami Ji';

    if (!effectiveAnswer) {
      return res.status(400).json({ error: 'Answer text is required' });
    }

    // Deduplication check: if the exact answer for this prompt already exists for this player, return existing
    const existing = db.prepare(`
      SELECT * FROM answers
      WHERE prompt_id = ? AND player_name = ? AND answer = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(effectivePromptId, effectivePlayerName, effectiveAnswer) as any;

    if (existing) {
      return res.status(200).json({
        success: true,
        deduplicated: true,
        answer: {
          id: existing.id,
          promptId: existing.prompt_id,
          promptType: existing.prompt_type,
          question: existing.question,
          answer: existing.answer,
          playerName: existing.player_name,
          createdAt: existing.created_at
        }
      });
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO answers (id, prompt_id, prompt_type, question, answer, player_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      effectivePromptId,
      promptType || 'truth',
      effectiveQuestion,
      effectiveAnswer,
      effectivePlayerName,
      now
    );

    const saved = db.prepare('SELECT * FROM answers WHERE id = ?').get(id) as any;

    res.status(201).json({
      success: true,
      answer: {
        id: saved.id,
        promptId: saved.prompt_id,
        promptType: saved.prompt_type,
        question: saved.question,
        answer: saved.answer,
        playerName: saved.player_name,
        createdAt: saved.created_at
      }
    });
  } catch (err: any) {
    console.error('Error saving answer:', err);
    res.status(500).json({ error: err.message || 'Failed to save answer' });
  }
});

// 8. Get All Answers (JSON)
apiRouter.get('/tod/answers', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM answers ORDER BY created_at DESC').all();
    res.json({ success: true, count: rows.length, answers: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Reset Entire Database
apiRouter.post('/tod/reset-db', (_req: Request, res: Response) => {
  try {
    resetDatabase();
    res.json({ success: true, message: 'Database reset successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. SECRET VAULT - Beautiful Self-Contained Human-Readable Dashboard
export function renderSecretVaultHtml(): string {
  // Prune any legacy duplicate answer rows keeping only the latest unique entry
  try {
    db.exec(`
      DELETE FROM answers
      WHERE rowid NOT IN (
        SELECT max(rowid) FROM answers
        GROUP BY prompt_id, player_name, answer
      );
    `);
  } catch (e) {
    // ignore
  }

  const answers = db.prepare('SELECT * FROM answers ORDER BY created_at DESC').all() as any[];
  const evidencesRaw = db.prepare('SELECT * FROM evidence ORDER BY created_at DESC').all() as any[];

  const evidences = evidencesRaw.map(ev => ({
    ...ev,
    activeUrl: storageAdapter.getSignedViewUrl(ev.storage_object_key, 1440)
  }));

  const answersHtml = answers.length === 0
    ? `<div class="empty-state">No answers saved yet. Play Truth or Dare and click "Jawab Save Karo" to see them here!</div>`
    : answers.map((ans, idx) => `
      <div class="card item-card">
        <div class="item-header">
          <span class="badge ${ans.prompt_type === 'truth' ? 'badge-lime' : 'badge-coral'}">
            ${ans.prompt_type.toUpperCase()} • ${ans.prompt_id}
          </span>
          <span class="time-stamp">${new Date(ans.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
        </div>
        <div class="question-box">
          <div class="label">Sawaal / Question:</div>
          <div class="question-text">"${escapeHtml(ans.question)}"</div>
        </div>
        <div class="answer-box">
          <div class="label">Jawab / Answer:</div>
          <div class="answer-text">"${escapeHtml(ans.answer)}"</div>
        </div>
        <div class="item-footer">
          <span>👤 Answered By: <strong>${escapeHtml(ans.player_name)}</strong></span>
        </div>
      </div>
    `).join('');

  const evidenceHtml = evidences.length === 0
    ? `<div class="empty-state">No media evidence recordings uploaded yet.</div>`
    : evidences.map((ev, idx) => `
      <div class="card item-card">
        <div class="item-header">
          <span class="badge badge-coral">
            ${ev.evidence_type.toUpperCase()} EVIDENCE • ${ev.dare_id}
          </span>
          <span class="time-stamp">${new Date(ev.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
        </div>
        <div class="question-box">
          <div class="label">Dare Challenge:</div>
          <div class="question-text">"${escapeHtml(ev.challenge)}"</div>
        </div>
        <div class="media-box">
          ${ev.evidence_type === 'video'
            ? `<video controls src="${ev.activeUrl}" preload="metadata" playsinline class="media-player"></video>`
            : `<audio controls src="${ev.activeUrl}" preload="metadata" class="audio-player"></audio>`
          }
        </div>
        <div class="item-footer">
          <span>👤 Performed By: <strong>${escapeHtml(ev.player_name)}</strong></span>
          <span>⏱️ Duration: <strong>${ev.duration ? ev.duration.toFixed(1) + 's' : 'N/A'}</strong></span>
          <span>📁 Size: <strong>${(ev.file_size / 1024).toFixed(1)} KB</strong></span>
        </div>
      </div>
    `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔒 Secret Vault • The Unofficial Fun Department</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --graphite: #202329;
      --ivory: #F3F0E9;
      --cobalt: #5478E8;
      --lime: #C5E66A;
      --coral: #F28C62;
      --shadow: 3px 3px 0px var(--graphite);
      --shadow-sm: 2px 2px 0px var(--graphite);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--ivory);
      color: var(--graphite);
      font-family: 'Inter', -apple-system, sans-serif;
      padding: 24px 16px;
      line-height: 1.5;
    }
    .container {
      max-width: 780px;
      margin: 0 auto;
    }
    header {
      background: #FFFFFF;
      border: 2px solid var(--graphite);
      border-radius: 10px;
      box-shadow: var(--shadow);
      padding: 20px;
      margin-bottom: 24px;
    }
    h1 {
      font-family: 'Manrope', sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 6px;
    }
    .subtitle {
      font-size: 0.9rem;
      color: #5C626E;
      margin-top: 4px;
    }
    .stats-bar {
      display: flex;
      gap: 12px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .stat-pill {
      background: var(--ivory);
      border: 1.5px solid var(--graphite);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .stat-num {
      background: var(--cobalt);
      color: #FFFFFF;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 0.75rem;
    }
    .actions-bar {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .btn {
      font-family: inherit;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 8px 14px;
      border: 2px solid var(--graphite);
      border-radius: 6px;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: var(--graphite);
      background: #FFFFFF;
    }
    .btn-lime { background: var(--lime); }
    .btn-coral { background: var(--coral); color: var(--graphite); }
    .btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px var(--graphite); }

    .section-title {
      font-family: 'Manrope', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      margin: 28px 0 14px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card {
      background: #FFFFFF;
      border: 2px solid var(--graphite);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 16px;
      margin-bottom: 16px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      border: 1px solid var(--graphite);
    }
    .badge-lime { background: var(--lime); color: var(--graphite); }
    .badge-coral { background: var(--coral); color: var(--graphite); }
    .badge-cobalt { background: var(--cobalt); color: #FFFFFF; }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .time-stamp {
      font-size: 0.75rem;
      color: #6C727F;
      font-weight: 600;
    }
    .question-box {
      margin-bottom: 10px;
    }
    .label {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5C626E;
      margin-bottom: 2px;
    }
    .question-text {
      font-weight: 700;
      font-size: 0.98rem;
      color: var(--graphite);
    }
    .answer-box {
      background: var(--ivory);
      border: 1.5px dashed var(--graphite);
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 10px;
    }
    .answer-text {
      font-size: 1.02rem;
      font-weight: 600;
      color: var(--graphite);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .media-box {
      margin: 12px 0;
    }
    .media-player {
      width: 100%;
      max-height: 320px;
      border: 2px solid var(--graphite);
      border-radius: 6px;
      background: #000000;
    }
    .audio-player {
      width: 100%;
      height: 44px;
      outline: none;
    }
    .item-footer {
      display: flex;
      gap: 14px;
      font-size: 0.78rem;
      color: #5C626E;
      border-top: 1px solid #E0DDD5;
      padding-top: 8px;
      flex-wrap: wrap;
    }
    .empty-state {
      background: #FFFFFF;
      border: 2px dashed #B0B5C0;
      border-radius: 8px;
      padding: 30px 16px;
      text-align: center;
      color: #7E8695;
      font-size: 0.9rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge badge-cobalt">CLASSIFIED ARCHIVE</span>
      <h1>🔒 Secret Vault • Truth & Dare</h1>
      <p class="subtitle">Direct human-readable viewer for all saved Truth answers and uploaded Dare recordings.</p>

      <div class="stats-bar">
        <div class="stat-pill">
          <span>Saved Answers:</span>
          <span class="stat-num">${answers.length}</span>
        </div>
        <div class="stat-pill">
          <span>Uploaded Evidences:</span>
          <span class="stat-num">${evidences.length}</span>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn btn-lime" onclick="location.reload()">
          🔄 Refresh Vault
        </button>
        <a class="btn" href="http://localhost:5173/hq">
          🏠 Back to HQ
        </a>
        <button class="btn btn-coral" onclick="resetDatabaseConfirm()">
          🗑️ Reset Database
        </button>
      </div>
    </header>

    <div class="section-title">
      <span>📝 Truth & Dare Answers (${answers.length})</span>
    </div>
    <div id="answers-container">
      ${answersHtml}
    </div>

    <div class="section-title">
      <span>🎬 Uploaded Media Evidence (${evidences.length})</span>
    </div>
    <div id="evidence-container">
      ${evidenceHtml}
    </div>
  </div>

  <script>
    async function resetDatabaseConfirm() {
      if (!confirm('Are you sure you want to wipe all answers and evidence from the database? This cannot be undone.')) {
        return;
      }
      try {
        const res = await fetch('/api/tod/reset-db', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('Database reset successful!');
          location.reload();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (e) {
        alert('Failed to reset: ' + e.message);
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Secret Vault Endpoints
apiRouter.get('/secret-vault', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSecretVaultHtml());
});

apiRouter.get('/vault', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSecretVaultHtml());
});
