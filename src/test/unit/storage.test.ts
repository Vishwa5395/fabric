import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDiaryEntry,
  getDiaryEntry,
  getAllDiaryEntries,
  deleteDiaryEntry,
  saveDiaryDraft,
  getDiaryDraft,
  clearDiaryDraft,
  saveRecording,
  getRecording,
  getAllRecordings,
  deleteRecording,
  getDB,
  DiaryEntry,
  RecordingEntry
} from '../../services/storage';

describe('Storage Layer (IndexedDB via idb)', () => {
  beforeEach(async () => {
    const db = await getDB();
    await db.clear('diaryEntries');
    await db.clear('diaryDrafts');
    await db.clear('recordings');
    await db.clear('recordingDrafts');
    await db.clear('kv');
  });

  it('performs CRUD operations for diary entries correctly', async () => {
    const entry: DiaryEntry = {
      id: 'test-1',
      title: 'Secret Thoughts',
      body: 'Ye ekdum classified baat hai.',
      mood: 'Khush',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create
    await saveDiaryEntry(entry);

    // Read
    const loaded = await getDiaryEntry('test-1');
    expect(loaded).toBeDefined();
    expect(loaded?.title).toBe('Secret Thoughts');
    expect(loaded?.body).toBe('Ye ekdum classified baat hai.');
    expect(loaded?.mood).toBe('Khush');

    // List
    const { entries, corruptCount } = await getAllDiaryEntries();
    expect(entries.length).toBe(1);
    expect(corruptCount).toBe(0);

    // Delete
    await deleteDiaryEntry('test-1');
    const afterDelete = await getDiaryEntry('test-1');
    expect(afterDelete).toBeNull();
  });

  it('handles diary drafts autosave and clear', async () => {
    await saveDiaryDraft({
      key: 'new',
      title: 'Draft Title',
      body: 'Adhuri baat...',
      savedAt: new Date().toISOString()
    });

    const draft = await getDiaryDraft('new');
    expect(draft).toBeDefined();
    expect(draft?.title).toBe('Draft Title');

    await clearDiaryDraft('new');
    const cleared = await getDiaryDraft('new');
    expect(cleared).toBeNull();
  });

  it('handles recording storage and retrieval', async () => {
    const fakeBlob = new Blob(['fake audio content'], { type: 'audio/webm' });
    const rec: RecordingEntry = {
      id: 'rec-1',
      title: 'Voice Note 1',
      tags: ['funny'],
      createdAt: new Date().toISOString(),
      durationMs: 3200,
      mimeType: 'audio/webm',
      sizeBytes: fakeBlob.size,
      favourite: true,
      blob: fakeBlob
    };

    await saveRecording(rec);
    const loaded = await getRecording('rec-1');
    expect(loaded).toBeDefined();
    expect(loaded?.title).toBe('Voice Note 1');
    expect(loaded?.favourite).toBe(true);

    const { recordings, corruptCount } = await getAllRecordings();
    expect(recordings.length).toBe(1);
    expect(corruptCount).toBe(0);

    await deleteRecording('rec-1');
    const afterDelete = await getRecording('rec-1');
    expect(afterDelete).toBeNull();
  });

  it('counts and skips corrupt diary entries gracefully', async () => {
    const db = await getDB();
    // Directly inject invalid entry into store
    await db.put('diaryEntries', {
      id: 'corrupt-1',
      // missing title and body
      somethingElse: 123
    } as unknown as DiaryEntry);

    const { entries, corruptCount } = await getAllDiaryEntries();
    expect(entries.length).toBe(0);
    expect(corruptCount).toBe(1);
  });
});

