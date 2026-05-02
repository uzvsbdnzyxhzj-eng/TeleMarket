const fs = require('fs');
let file = fs.readFileSync('src/i18n.ts', 'utf8');

file = file.replace(/Withdrawal requests are processed manually within 24-48 hours./g, "Withdrawal requests are processed manually within 2 hours. If not received, please contact support.");
file = file.replace(/বিঃদ্রঃ উইথড্র রিকোয়েস্ট ম্যানুয়ালি ২৪-৪৮ ঘণ্টার মধ্যে প্রসেস করা হয়।/g, "বিঃদ্রঃ উইথড্র রিকোয়েস্ট ম্যানুয়ালি ২ ঘণ্টার মধ্যে প্রসেস করা হয়। যদি ২ ঘণ্টার মধ্যে না পান তাহলে সাপোর্টে যোগাযোগ করবেন।");

fs.writeFileSync('src/i18n.ts', file);
