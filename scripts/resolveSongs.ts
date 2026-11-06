import fs from 'node:fs';
import path from 'node:path';

interface SongEntry {
  id: string;
  title: string;
  filmOrArtist: string;
  album: string;
  artworkUrl: string;
  appleUrl: string;
  spotifyTrackId: string;
  verified: boolean;
  searchTerms: {
    spotify: string;
    ytMusic: string;
    jioSaavn: string;
  };
}

const QUERIES = [
  { id: 'song-darkhaast', title: 'Darkhaast', term: 'Darkhaast Shivaay' },
  { id: 'song-raabta', title: 'Raabta', term: 'Raabta' },
  { id: 'song-dooron-dooron', title: 'Dooron Dooron', term: 'Dooron Dooron' }
];

async function resolve() {
  const songs: SongEntry[] = [];

  for (const item of QUERIES) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(item.term)}&media=music&entity=song&country=IN&limit=1`;
      console.log(`Resolving: ${item.term}...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json() as { results?: Array<{ trackName: string; artistName: string; collectionName: string; artworkUrl100: string; trackViewUrl: string }> };
      const match = data.results && data.results[0];

      if (match && item.id === 'song-darkhaast') {
        // Darkhaast is verified from prompt: Shivaay
        songs.push({
          id: item.id,
          title: item.title,
          filmOrArtist: match.artistName || 'Shivaay',
          album: match.collectionName || 'Shivaay',
          artworkUrl: (match.artworkUrl100 || '').replace('100x100', '400x400'),
          appleUrl: match.trackViewUrl || '',
          spotifyTrackId: '4vJ0wXUoFpL4cHQfPekq7c',
          verified: true,
          searchTerms: {
            spotify: `${item.title} Shivaay`,
            ytMusic: `${item.title} Shivaay`,
            jioSaavn: `${item.title} Shivaay`
          }
        });
      } else {
        // Raabta and Dooron Dooron are ambiguous, until verified leave details blank
        songs.push({
          id: item.id,
          title: item.title,
          filmOrArtist: '',
          album: '',
          artworkUrl: '',
          appleUrl: '',
          spotifyTrackId: '',
          verified: false,
          searchTerms: {
            spotify: item.title,
            ytMusic: item.title,
            jioSaavn: item.title
          }
        });
      }
    } catch (err) {
      console.error(`Failed to resolve ${item.title}:`, err);
      songs.push({
        id: item.id,
        title: item.title,
        filmOrArtist: '',
        album: '',
        artworkUrl: '',
        appleUrl: '',
        spotifyTrackId: '',
        verified: false,
        searchTerms: {
          spotify: item.title,
          ytMusic: item.title,
          jioSaavn: item.title
        }
      });
    }
  }

  const outPath = path.resolve('src/data/songs.json');
  fs.writeFileSync(outPath, JSON.stringify(songs, null, 2), 'utf-8');
  console.log(`Updated ${outPath} with resolved metadata.`);
}

resolve();

