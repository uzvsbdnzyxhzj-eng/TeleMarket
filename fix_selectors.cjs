const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-1\.5 py-1\.5 rounded-lg shrink-0 border border-gray-200">\n\s*<select value=\{currency\}.*?<\/select>\n\s*<\/div>/sg, '');
code = code.replace(/<div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-lg shrink-0 border border-gray-200">\n\s*<select value=\{currency\}.*?<\/select>\n\s*<\/div>/sg, '');

code = code.replace(/<select value=\{currency\}.*?<\/select>/sg, '');

code = code.replace(/<div className="w-\[1px\] h-3 bg-gray-300 mx-1"><\/div>\n\s*<span className="text-xs font-bold text-gray-500">\{currencySymbols\[currency\]\}<\/span>/sg, '');

// Also clean up any lingering useCurrency imports
code = code.replace(/import \{ useCurrency \} from "\.\/CurrencyContext";\n/g, '');

fs.writeFileSync('src/App.tsx', code);
