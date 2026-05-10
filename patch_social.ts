import fs from 'fs';
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

content = content.replace(
/onChange=\{\(e\) => setLink\(e\.target\.value\)\}\s*className="w-full bg-\[#fcf8fa\] border border-\[#f5ebf2\] rounded-xl px-4 py-3\.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"\s*\/>/,
`onChange={(e) => { setLink(e.target.value); setErrors(p => ({...p, link: undefined})); }}
                              className={\`w-full bg-[#fcf8fa] border \${errors.link ? 'border-red-400 ring-1 ring-red-400' : 'border-[#f5ebf2]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400\`}
                           />
                           {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}`
);

content = content.replace(
/onChange=\{\(e\) => setQuantity\(e\.target\.value\)\}\s*className="w-full bg-\[#fcf8fa\] border border-\[#f5ebf2\] rounded-xl px-4 py-3\.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"\s*\/>/,
`onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({...p, quantity: undefined})); }}
                              className={\`w-full bg-[#fcf8fa] border \${errors.quantity ? 'border-red-400 ring-1 ring-red-400' : 'border-[#f5ebf2]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400\`}
                           />
                           {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}`
);

fs.writeFileSync('src/SocialServices.tsx', content);
