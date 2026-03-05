const fs = require('fs');
const s = fs.readFileSync('src/app/admin-content-management/components/AdminTestsManagementInteractive.tsx','utf8');
const lines = s.split(/\r?\n/);
let stack = [];
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(let j=0;j<line.length;j++){
    const ch = line[j];
    if (ch === '{') stack.push({line: i+1, col: j+1, text: line.trim()});
    if (ch === '}') {
      if (stack.length === 0) {
        console.log('Unmatched } at', i+1, j+1);
      } else stack.pop();
    }
  }
}
if (stack.length > 0) {
  console.log('Unmatched { count', stack.length);
  console.log(stack.slice(0, 20));
} else console.log('All braces matched');
