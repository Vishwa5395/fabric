async function fetchSongInfo() {
  const songs = [
    { key: "cowpoke", q: "Cowpoke Colter Wall" },
    { key: "line_without_hook", q: "Line Without a Hook Ricky Montgomery" },
    { key: "zulfein", q: "Zulfein Mehul Mahesh" },
    { key: "her_jvke", q: "her JVKE" },
    { key: "her_female_jvke", q: "her female version JVKE" },
    { key: "qaafirana", q: "Qaafirana Kedarnath Arijit Singh" },
    { key: "misery", q: "Misery pupsies" },
    { key: "little_longer", q: "Little Longer Louis Island" },
    { key: "blue", q: "Blue Yung Kai" },
    { key: "bling_bang_bang", q: "Bling-Bang-Bang-Born Creepy Nuts" }
  ];

  const results = {};
  for (const s of songs) {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(s.q)}&media=music&entity=song&limit=1`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        const item = data.results[0];
        results[s.key] = {
          trackName: item.trackName,
          artistName: item.artistName,
          collectionName: item.collectionName,
          artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '600x600') : '',
          previewUrl: item.previewUrl,
          appleUrl: item.trackViewUrl
        };
      } else {
        results[s.key] = null;
      }
    } catch (e) {
      results[s.key] = { error: String(e) };
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

fetchSongInfo();

