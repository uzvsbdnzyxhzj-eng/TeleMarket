const fs = require('fs');

let c = fs.readFileSync('src/Landing.tsx', 'utf8');

const targetImport = "import { getFlag } from './utils';";
const replacementImport = "import { Youtube, Facebook, Instagram, Twitter } from 'lucide-react';\\nimport { getFlag } from './utils';";
c = c.replace(targetImport, replacementImport);

const targetBlock = `<div className="flex items-center gap-2 font-bold text-gray-400 text-2xl">
                     <svg className="w-8 h-8 text-[#50AF95] fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.8 14.88h-3.6V15h-1.2v-1.2h1.2v-1.2h-1.2V11.4h1.2v-1.2h-1.2v-1.2h1.2v-1.2h1.2v1.2h1.2v1.2h1.2v1.2H13.8v1.2h1.2v1.2h1.2v1.2h1.2V15h-1.2v1.88z"/></svg>
                     Tether
                  </div>`;

// First I will find what crypto are there to append after Tether, or rather inside the map loop. I'll just search for `Tether` in the file.
