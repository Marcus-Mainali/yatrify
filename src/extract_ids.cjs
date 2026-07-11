const fs = require('fs');
const content = fs.readFileSync('src/data.ts', 'utf8');

const regex = /"photo-([a-zA-Z0-9\-]+)"/g;
const ids = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  ids.add(match[1]);
}

console.log(`Found ${ids.size} unique Unsplash photo IDs in src/data.ts:`);
console.log(Array.from(ids));
