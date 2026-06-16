const fs = require('fs');

let code = fs.readFileSync('src/ChildPanel.tsx', 'utf8');

code = code.replace(/currency: currency,\n/g, 'currency: "USD",\n');

code = code.replace(/<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-1">Desired Currency<\/label>\s*<select\s*value=\{currency\} onChange=\{e => setCurrency\(e.target.value\)\}\s*className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2.5 focus:border-\[\#2AABEE\]"\s*>\s*<option value="USD">USD \(\$\)<\/option>\s*<option value="BDT">BDT \(৳\)<\/option>\s*<option value="INR">INR \(₹\)<\/option>\s*<\/select>\s*<\/div>/g, '');

fs.writeFileSync('src/ChildPanel.tsx', code);
