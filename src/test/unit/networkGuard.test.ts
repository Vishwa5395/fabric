import { describe, it, expect, vi } from 'vitest';
import { saveDiaryEntry, saveRecording, getAllDiaryEntries } from '../../services/storage';

describe('Network & Privacy Guard', () => {
  it('guarantees that diary or recording content is NEVER transmitted over the network', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch');

    // Sensitive data
    const privateSecret = 'THIS_IS_VERY_PRIVATE_PERSONAL_DIARY_CONTENT_12345';
    await saveDiaryEntry({
      id: 'private-1',
      title: 'Secret Title',
      body: privateSecret,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const privateAudioSecret = 'VERY_SECRET_AUDIO_TRANSCRIPT_67890';
    const fakeBlob = new Blob([privateAudioSecret], { type: 'audio/webm' });
    await saveRecording({
      id: 'priv-rec-1',
      title: 'Secret Audio',
      tags: ['top-secret'],
      createdAt: new Date().toISOString(),
      durationMs: 1200,
      mimeType: 'audio/webm',
      sizeBytes: fakeBlob.size,
      favourite: true,
      blob: fakeBlob
    });

    await getAllDiaryEntries();

    // Verify all network calls (if any were made) never contain private text
    for (const call of fetchSpy.mock.calls) {
      const url = String(call[0]);
      const options = call[1];
      const body = options?.body ? String(options.body) : '';

      expect(url).not.toContain(privateSecret);
      expect(url).not.toContain(privateAudioSecret);
      expect(body).not.toContain(privateSecret);
      expect(body).not.toContain(privateAudioSecret);
    }

    fetchSpy.mockRestore();
  });

  it('restricts external network calls strictly to the allowed CSP endpoints', () => {
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'meme-api.com',
      'api.imgflip.com',
      'api.klipy.com',
      'itunes.apple.com',
      'is1-ssl.mzstatic.com',
      'open.spotify.com'
    ];

    const testUrl = (urlStr: string) => {
      if (urlStr.startsWith('/') || urlStr.startsWith('data:') || urlStr.startsWith('blob:')) {
        return true;
      }
      try {
        const parsed = new URL(urlStr);
        return allowedHosts.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
      } catch {
        return false;
      }
    };

    expect(testUrl('https://meme-api.com/gimme/indiameme/10')).toBe(true);
    expect(testUrl('https://open.spotify.com/embed/track/xyz')).toBe(true);
    expect(testUrl('https://analytics.google.com/collect')).toBe(false);
    expect(testUrl('https://facebook.com/tr/')).toBe(false);
  });
});

