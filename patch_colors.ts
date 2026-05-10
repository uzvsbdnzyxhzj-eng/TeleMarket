import fs from 'fs';
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

content = content.replace(/#0b85d3/g, '#2AABEE');
content = content.replace(/#Fdfbfc/g, '#f8fafc');
content = content.replace(/#fcf8fa/g, '#ffffff');
content = content.replace(/#f5ebf2/g, '#e2e8f0');
content = content.replace(/bg-\[\#4a4a4a\]/g, 'bg-gray-800');
content = content.replace(/bg-\[\#f0f8ff\]/g, 'bg-blue-50');
content = content.replace(/bg-\[\#0a75ba\]/g, 'bg-[#1e99d8]');
content = content.replace(/bg-\[\#e4f3fa\]/g, 'bg-[#f0f9ff]');
content = content.replace(/border-\[\#d1effc\]/g, 'border-blue-100');
content = content.replace(/bg-\[\#4A4A4A\]/g, 'bg-gray-800');

fs.writeFileSync('src/SocialServices.tsx', content);
