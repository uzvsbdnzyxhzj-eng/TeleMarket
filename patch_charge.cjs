const fs = require('fs');
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

const target = `                       <div>
                           <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Quantity</label>
                           <input 
                              type="number"
                              value={quantity}
                              onChange={(e) => { setQuantity(e.target.value); setErrors(p => ({...p, quantity: undefined})); }}
                               className={\`w-full bg-[#ffffff] border \${errors.quantity ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e8f0]'} rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400\`}
                            />
                            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                           <div className="text-gray-700 text-sm mt-3 font-medium pl-1">
                              Min: {selectedService?.min || 50} - Max: {selectedService?.max || 500000}
                           </div>
                       </div>`;

const replacement = target + `

                       <div>
                           <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Charge</label>
                           <input 
                              type="text"
                              value={\`$\${charge}\`}
                              readOnly
                              className="w-full bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-500 font-medium outline-none cursor-not-allowed"
                            />
                       </div>`;

if (!content.includes('Charge</label>')) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/SocialServices.tsx', content);
    console.log("Patched successfully");
} else {
    console.log("Already patched");
}
