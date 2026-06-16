const fs = require('fs');
fs.appendFileSync('.env.example', '\n# SMTP Email Dispatch Configuration\nSMTP_HOST="smtp.gmail.com"\nSMTP_PORT="465"\nSMTP_USER="your-email@gmail.com"\nSMTP_PASS="your-app-password"\n');
