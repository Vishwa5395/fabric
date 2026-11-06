import { describe, it, expect, beforeEach } from 'vitest';
import { exportBackupZip, importBackupZip } from '../../services/backup';
import {
  saveDiaryEntry,
  saveRecording,
  getAllDiaryEntries,
  getAllRecordings,
  getDB
} from '../../services/storage';

describe('Backup Export & Import Engine', () => {
  beforeEach(async () => {
    const db = await getDB();
    await db.clear('diaryEntries');
    await db.clear('recordings');
    await db.clear('kv');
  });

  it('exports and imports backup zip roundtrip successfully', async () => {
    // 1. Setup sample data
    await saveDiaryEntry({
      id: 'd-1',
      title: 'First Diary Note',
      body: 'Testing export roundtrip',
      createdAt: '2026-11-04T00:00:00.000Z',
      updatedAt: '2026-11-04T00:00:00.000Z'
    });

    const fakeBlob = new Blob(['sample audio pcm data'], { type: 'audio/webm' });
    await saveRecording({
      id: 'r-1',
      title: 'Sample Recording',
      tags: ['roundtrip'],
      createdAt: '2026-11-04T00:00:00.000Z',
      durationMs: 2500,
      mimeType: 'audio/webm',
      sizeBytes: fakeBlob.size,
      favourite: true,
      blob: fakeBlob
    });

    // 2. Export
    const { blob, filename } = await exportBackupZip();
    expect(filename).toContain('ufd-backup-');
    expect(blob.size).toBeGreaterThan(0);

    // 3. Clear database to test restoration
    const db = await getDB();
    await db.clear('diaryEntries');
    await db.clear('recordings');

    const emptyDiary = await getAllDiaryEntries();
    expect(emptyDiary.entries.length).toBe(0);

    // 4. Import
    const file = new File([blob], filename, { type: 'application/zip' });
    const importRes = await importBackupZip(file);

    expect(importRes.success).toBe(true);
    expect(importRes.diaryCount).toBe(1);
    expect(importRes.recordingCount).toBe(1);

    // 5. Verify restored items
    const restoredDiary = await getAllDiaryEntries();
    expect(restoredDiary.entries.length).toBe(1);
    expect(restoredDiary.entries[0].title).toBe('First Diary Note');

    const restoredRec = await getAllRecordings();
    expect(restoredRec.recordings.length).toBe(1);
    expect(restoredRec.recordings[0].title).toBe('Sample Recording');
  });

  it('rejects corrupt or invalid zip without affecting existing data', async () => {
    await saveDiaryEntry({
      id: 'd-keep',
      title: 'Safe Note',
      body: 'Should not be overwritten',
      createdAt: '2026-11-04T00:00:00.000Z',
      updatedAt: '2026-11-04T00:00:00.000Z'
    });

    // Fake corrupt zip
    const badFile = new File(['not a real zip'], 'bad.zip', { type: 'application/zip' });
    const importRes = await importBackupZip(badFile);

    expect(importRes.success).toBe(false);

    // Existing data is still intact
    const current = await getAllDiaryEntries();
    expect(current.entries.length).toBe(1);
    expect(current.entries[0].title).toBe('Safe Note');
  });
});

