const fs = require('fs');
let text = fs.readFileSync('docs/BACKLOG.md', 'utf8');

const lines = text.split('\n');
const newLines = lines.filter(line => !line.includes('**✅'));

fs.writeFileSync('docs/BACKLOG.md', newLines.join('\n'), 'utf8');
console.log('Done');
