const fs = require('fs');
const path = require('path');

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.resolve('public/icons/icon-192.png'), png1x1);
fs.writeFileSync(path.resolve('public/icons/icon-512.png'), png1x1);
fs.writeFileSync(path.resolve('public/favicon.ico'), png1x1);
fs.writeFileSync(
  path.resolve('public/vite.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#C5E66A" stroke="#202329" stroke-width="5"/></svg>'
);
console.log('Placeholder icons created.');

