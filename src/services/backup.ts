import * as fflate from 'fflate';
import { z } from 'zod';
import {
  getAllDiaryEntries,
  getAllRecordings,
  saveDiaryEntry,
  saveRecording,
  DiaryEntry,
  RecordingEntry,
  getDB,
  savePreferences
} from './storage';

export const ManifestSchema = z.object({
  app: z.string(),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  counts: z.object({
    diary: z.number(),
    recordings: z.number()
  })
});

export interface ExportResult {
  blob: Blob;
  filename: string;
}

export interface ImportSummary {
  success: boolean;
  message: string;
  diaryCount: number;
  recordingCount: number;
  skippedCount: number;
}

async function getBlobArrayBuffer(blob: unknown): Promise<ArrayBuffer> {
  if (!blob) return new ArrayBuffer(0);
  if (blob instanceof ArrayBuffer) return blob;
  if (ArrayBuffer.isView(blob)) {
    return (blob.buffer as ArrayBuffer).slice(blob.byteOffset, blob.byteOffset + blob.byteLength);
  }
  const b = blob as any;
  if (typeof b.arrayBuffer === 'function') {
    try {
      const res = await b.arrayBuffer();
      if (res && res.byteLength !== undefined) return res;
    } catch {
      // fallback
    }
  }
  if (typeof b.text === 'function') {
    try {
      const txt = await b.text();
      return new TextEncoder().encode(txt).buffer;
    } catch {
      // fallback
    }
  }
  if (b._buffer) {
    try {
      const buf = Buffer.isBuffer(b._buffer) ? b._buffer : Buffer.from(b._buffer);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } catch {
      // fallback
    }
  }
  if (b._parts && Array.isArray(b._parts)) {
    try {
      const uints = b._parts.map((p: any) => typeof p === 'string' ? new TextEncoder().encode(p) : new Uint8Array(p));
      const totalLen = uints.reduce((acc: number, u: Uint8Array) => acc + u.length, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const u of uints) {
        merged.set(u, offset);
        offset += u.length;
      }
      return merged.buffer;
    } catch {
      // fallback
    }
  }
  try {
    const jsdomBlob = new Blob([blob as any]);
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(jsdomBlob);
    });
  } catch {
    // fallback
  }
  return new ArrayBuffer(0);
}

export async function exportBackupZip(): Promise<ExportResult> {
  const { entries: diaryEntries } = await getAllDiaryEntries();
  const { recordings } = await getAllRecordings();

  // Get all KV data
  const db = await getDB();
  const kvKeys = await db.getAllKeys('kv');
  const kvData: Record<string, unknown> = {};
  for (const k of kvKeys) {
    kvData[String(k)] = await db.get('kv', k);
  }

  const manifest = {
    app: 'The Unofficial Fun Department',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      diary: diaryEntries.length,
      recordings: recordings.length
    }
  };

  const filesToZip: fflate.AsyncZippable = {};

  // Manifest
  filesToZip['manifest.json'] = fflate.strToU8(JSON.stringify(manifest, null, 2));

  // Diary
  filesToZip['diary.json'] = fflate.strToU8(JSON.stringify(diaryEntries, null, 2));

  // Progress KV
  filesToZip['progress.json'] = fflate.strToU8(JSON.stringify(kvData, null, 2));

  // Recordings metadata
  const recMetadata = recordings.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    tags: r.tags,
    createdAt: r.createdAt,
    durationMs: r.durationMs,
    mimeType: r.mimeType,
    sizeBytes: r.sizeBytes,
    favourite: r.favourite
  }));
  filesToZip['recordings.json'] = fflate.strToU8(JSON.stringify(recMetadata, null, 2));

  // Audio files in audio/
  for (const r of recordings) {
    const ext = r.mimeType.includes('mp4') ? 'mp4' : r.mimeType.includes('ogg') ? 'ogg' : 'webm';
    const arrayBuffer = await getBlobArrayBuffer(r.blob);
    filesToZip[`audio/${r.id}.${ext}`] = new Uint8Array(arrayBuffer);
  }

  return new Promise((resolve, reject) => {
    fflate.zip(filesToZip, (err, data) => {
      if (err) {
        return reject(err);
      }
      const blob = new Blob([data], { type: 'application/zip' });
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `ufd-backup-${dateStr}.zip`;

      // Update last backup timestamp
      savePreferences({ lastBackup: now.toISOString() });

      resolve({ blob, filename });
    });
  });
}

export async function importBackupZip(file: File | Blob): Promise<ImportSummary> {
  const arrayBuffer = await getBlobArrayBuffer(file);
  const zipBytes = new Uint8Array(arrayBuffer);

  return new Promise((resolve) => {
    fflate.unzip(zipBytes, async (err, unzipped) => {
      if (err) {
        return resolve({
          success: false,
          message: 'Invalid ZIP file. Is file ko padha nahi ja saka.',
          diaryCount: 0,
          recordingCount: 0,
          skippedCount: 0
        });
      }

      try {
        // 1. Check manifest
        const manifestBytes = unzipped['manifest.json'];
        if (!manifestBytes) {
          return resolve({
            success: false,
            message: 'Ye backup file theek nahi hai (manifest.json missing).',
            diaryCount: 0,
            recordingCount: 0,
            skippedCount: 0
          });
        }

        const manifestJson = JSON.parse(fflate.strFromU8(manifestBytes));
        const manifestResult = ManifestSchema.safeParse(manifestJson);
        if (!manifestResult.success) {
          return resolve({
            success: false,
            message: 'Manifest verify nahi ho paaya. File corrupt lagti hai.',
            diaryCount: 0,
            recordingCount: 0,
            skippedCount: 0
          });
        }

        let diaryImported = 0;
        let recordingImported = 0;
        let skippedCount = 0;

        // 2. Import Diary Entries
        const diaryBytes = unzipped['diary.json'];
        if (diaryBytes) {
          try {
            const rawDiary = JSON.parse(fflate.strFromU8(diaryBytes));
            if (Array.isArray(rawDiary)) {
              const { entries: currentDiary } = await getAllDiaryEntries();
              const existingMap = new Map(currentDiary.map(e => [e.id, e]));

              for (const item of rawDiary) {
                try {
                  const entry = item as DiaryEntry;
                  if (!entry.id || !entry.title || !entry.body) {
                    skippedCount++;
                    continue;
                  }
                  const existing = existingMap.get(entry.id);
                  if (existing) {
                    // keep newer
                    if (new Date(entry.updatedAt) > new Date(existing.updatedAt)) {
                      await saveDiaryEntry(entry);
                      diaryImported++;
                    }
                  } else {
                    await saveDiaryEntry(entry);
                    diaryImported++;
                  }
                } catch {
                  skippedCount++;
                }
              }
            }
          } catch {
            skippedCount++;
          }
        }

        // 3. Import Recordings
        const recMetaBytes = unzipped['recordings.json'];
        if (recMetaBytes) {
          try {
            const rawRec = JSON.parse(fflate.strFromU8(recMetaBytes));
            if (Array.isArray(rawRec)) {
              for (const meta of rawRec) {
                try {
                  const ext = meta.mimeType?.includes('mp4') ? 'mp4' : meta.mimeType?.includes('ogg') ? 'ogg' : 'webm';
                  const audioFileBytes = unzipped[`audio/${meta.id}.${ext}`] || unzipped[`audio/${meta.id}.webm`];
                  if (!audioFileBytes) {
                    skippedCount++;
                    continue;
                  }
                  const blob = new Blob([audioFileBytes], { type: meta.mimeType || 'audio/webm' });
                  const recordingEntry: RecordingEntry = {
                    id: meta.id,
                    title: meta.title || 'Imported Recording',
                    description: meta.description,
                    tags: Array.isArray(meta.tags) ? meta.tags : [],
                    createdAt: meta.createdAt || new Date().toISOString(),
                    durationMs: Number(meta.durationMs) || 0,
                    mimeType: meta.mimeType || 'audio/webm',
                    sizeBytes: blob.size,
                    favourite: Boolean(meta.favourite),
                    blob
                  };
                  await saveRecording(recordingEntry);
                  recordingImported++;
                } catch {
                  skippedCount++;
                }
              }
            }
          } catch {
            skippedCount++;
          }
        }

        // 4. Import Progress KV
        const progressBytes = unzipped['progress.json'];
        if (progressBytes) {
          try {
            const rawKV = JSON.parse(fflate.strFromU8(progressBytes));
            const db = await getDB();
            for (const [k, v] of Object.entries(rawKV)) {
              // merge/set
              await db.put('kv', v, k);
            }
          } catch {
            // ignore progress import error
          }
        }

        const msg = `${diaryImported} entries, ${recordingImported} recordings aaye.${skippedCount > 0 ? ` ${skippedCount} records kharab the, skip kar diye.` : ''}`;
        resolve({
          success: true,
          message: msg,
          diaryCount: diaryImported,
          recordingCount: recordingImported,
          skippedCount
        });
      } catch (e) {
        resolve({
          success: false,
          message: `Import poora nahi ho saka: ${String(e)}`,
          diaryCount: 0,
          recordingCount: 0,
          skippedCount: 0
        });
      }
    });
  });
}
