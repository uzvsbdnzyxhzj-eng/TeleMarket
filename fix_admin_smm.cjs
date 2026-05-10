const fs = require('fs');
let str = fs.readFileSync('src/AdminSMMPricing.tsx', 'utf8');

const replacementHeader = `<th className="px-4 py-3 font-medium text-gray-600 text-center flex flex-col items-center gap-1">
                  <span>Use Global % ({socialMarkupPercent}%)</span>
                  <button 
                    onClick={() => {
                      const allSettings = { ...smmMarkup };
                      if (filteredServices.every(s => !allSettings[s.service] || allSettings[s.service].type !== 'fixed')) {
                         // currently all are global, so make them all custom
                         filteredServices.forEach(s => allSettings[s.service] = { type: 'fixed', profit: 0 });
                      } else {
                         // make all global
                         filteredServices.forEach(s => delete allSettings[s.service]);
                      }
                      setSmmMarkup(allSettings);
                    }}
                    className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 uppercase font-bold"
                  >
                    Toggle All
                  </button>
                </th>`;

str = str.replace(/<th className="px-4 py-3 font-medium text-gray-600 text-center flex flex-col items-center gap-1">[\s\S]*?<\/th>/, replacementHeader);

fs.writeFileSync('src/AdminSMMPricing.tsx', str);
