import fs from 'node:fs';
import path from 'node:path';
import songsData from '../src/data/songs.json';

const SRC_DIR = path.resolve('downloads/songs');
const DEST_DIR = path.resolve('public/audio/songs');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const files = fs.readdirSync(SRC_DIR);

for (let i = 0; i < songsData.length; i++) {
  const song = songsData[i];
  const prefix = String(i + 1).padStart(2, '0');
  const matchedFile = files.find(f => f.startsWith(prefix));

  if (matchedFile) {
    const srcFile = path.join(SRC_DIR, matchedFile);
    const destFile = path.join(DEST_DIR, `${song.id}.m4a`);
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied: ${matchedFile} -> ${song.id}.m4a`);
  } else {
    console.warn(`No file found starting with ${prefix} for song ${song.id}`);
  }
}

console.log('Finished copying songs to public/audio/songs!');

