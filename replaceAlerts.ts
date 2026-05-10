import fs from 'fs';
['src/App.tsx', 'src/SocialServices.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\balert\(/g, 'toast(');
  fs.writeFileSync(file, content);
});
