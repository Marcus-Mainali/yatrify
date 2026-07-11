const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'data/adventure.ts'),
  path.join(__dirname, 'data/nature.ts'),
  path.join(__dirname, 'data/cultural.ts')
];

const ids = [];
const names = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /name:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!ids.includes(id)) {
      ids.push(id);
      names.push(name);
    }
  }
}

console.log(`Total Unique Places found across files: ${ids.length}`);
console.log(JSON.stringify({ ids, names }, null, 2));
