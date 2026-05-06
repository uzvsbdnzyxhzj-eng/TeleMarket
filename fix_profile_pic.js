const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "await updateProfile(cred.user, { displayName: tgData?.user?.first_name || (tgData?.user?.id ? 'Telegram User' : 'Guest User') });",
  "await updateProfile(cred.user, { displayName: tgData?.user?.first_name || (tgData?.user?.id ? 'Telegram User' : 'Guest User'), photoURL: tgData?.user?.photo_url || null });"
);
fs.writeFileSync('src/App.tsx', content);
