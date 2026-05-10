const fs = require('fs');

let c = fs.readFileSync('src/Landing.tsx', 'utf8');

c = c.replace("import { getFlag } from './utils';", "import { Youtube, Facebook, Instagram, Twitter } from 'lucide-react';\\nimport { getFlag } from './utils';");

// find </React.Fragment> that ends the repeat. Wait, the loop has <React.Fragment key={i}> ... </React.Fragment>
const socialBlock = `
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-xl md:text-2xl ml-4">
                     <Youtube className="w-8 h-8 text-red-500 fill-red-500" />
                     YouTube
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-xl md:text-2xl ml-4">
                     <Facebook className="w-8 h-8 text-blue-500 fill-blue-500" />
                     Facebook
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-xl md:text-2xl ml-4">
                     <Instagram className="w-8 h-8 text-pink-500" />
                     Instagram
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-400 text-xl md:text-2xl ml-4">
                     <svg className="w-8 h-8 text-blue-400 fill-blue-400" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                     Twitter
                  </div>
                </React.Fragment>
`;

c = c.replace('</React.Fragment>', socialBlock);
fs.writeFileSync('src/Landing.tsx', c);
console.log('Patched Landing');
