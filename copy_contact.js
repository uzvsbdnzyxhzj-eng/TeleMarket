import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the Contact Support Section
const contactStartStr = '{/* Contact Support Section */}';
const contactEndIndex = content.indexOf('</div>', content.indexOf('</div>', content.indexOf('Telegram HelpLine') + 20) + 6) + 6;

// I'll just extract the whole block by finding the start and the matching end.
const regex = /\{\/\* Contact Support Section \*\/\}([\s\S]*?)<\/h4>[\s\S]*?<\/p>\s*<\/div>\s*<\/div>\s*<\/a>\s*<\/div>\s*<\/div>/;

const match = content.match(regex);
if (match) {
  const contactBlock = match[0];
  
  // Find where to insert in dashboard (before the closing div of dashboard view)
  const dashboardEndMarker = 'Always Here\\n                </h4>\\n                <p className="text-xs text-gray-500 leading-relaxed">\\n                  Dedicated support via Telegram or Help Desk whenever needed.\\n                </p>\\n              </div>\\n            </div>';
  
  const targetRegex = /(<h4 className="font-bold text-gray-800 mb-1 text-sm">\s*Always Here\s*<\/h4>\s*<p className="text-xs text-gray-500 leading-relaxed">\s*Dedicated support via Telegram or Help Desk whenever needed.\s*<\/p>\s*<\/div>\s*<\/div>)/;
  
  content = content.replace(targetRegex, '$1\n            ' + contactBlock + '\n');
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully inserted Contact Support into dashboard');
} else {
  console.log('Could not find Contact Support block');
}
