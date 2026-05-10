import fs from 'fs';
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

// Replace smmsun header 1
content = content.replace(
  /<h1 className="font-extrabold text-xl text-\[\#0b85d3\] tracking-tight">smmsun<\/h1>/,
  '<h1 className="font-extrabold text-xl text-[#0b85d3] tracking-tight">{selectedCategory || "Social Panel"}</h1>'
);

// Replace smmsun header 2
content = content.replace(
  /<h1 className="font-extrabold text-2xl text-\[\#0b85d3\] tracking-tight">smmsun<\/h1>/,
  '<h1 className="font-extrabold text-2xl text-[#0b85d3] tracking-tight">{selectedCategory || "Social Panel"}</h1>'
);

// Add Service Details after showServiceDropdown
const serviceDetailsCode = `                         {showServiceDropdown && (
                             <div className="absolute z-40 w-full mt-1 bg-white border border-[#f5ebf2] rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                                 {currentServices.map(s => (
                                     <div 
                                        key={s.service} 
                                        onClick={() => {
                                            setSelectedService(s);
                                            setShowServiceDropdown(false);
                                        }}
                                        className={\`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-[#fcf8fa] flex flex-col gap-1 transition \${selectedService?.service === s.service ? 'bg-[#f0f0f0]' : ''}\`}
                                     >
                                         <div className="flex items-start gap-2">
                                             <span className="bg-[#4a4a4a] text-white px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 shrink-0">{s.service}</span>
                                             <span className="text-sm font-medium text-gray-800 leading-snug">{s.name} - \${s.rate} per 1000</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                      </div>

                      {selectedService && (
                          <div className="bg-[#f0f8ff] border border-blue-100 p-4 sm:p-5 rounded-2xl">
                             <h3 className="font-bold text-blue-900 mb-3 text-[13px] uppercase tracking-wider flex items-center gap-2">
                                <Search className="w-4 h-4 text-blue-600" /> Service Details
                             </h3>
                             <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                               {selectedService.desc || selectedService.description ? (
                                  <div dangerouslySetInnerHTML={{ __html: selectedService.desc || selectedService.description }} />
                               ) : (
                                  <ul className="space-y-2">
                                    <li className="flex justify-between border-b border-blue-50 pb-1">
                                       <span className="text-gray-500">Service ID</span>
                                       <span className="font-medium">{selectedService.service}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-blue-50 pb-1">
                                       <span className="text-gray-500">Name</span>
                                       <span className="font-medium text-right max-w-[60%]">{selectedService.name}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-blue-50 pb-1">
                                       <span className="text-gray-500">Rate per 1000</span>
                                       <span className="font-bold text-blue-600">\${selectedService.rate}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-blue-50 pb-1">
                                       <span className="text-gray-500">Min Order</span>
                                       <span className="font-medium">{selectedService.min}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-blue-50 pb-1">
                                       <span className="text-gray-500">Max Order</span>
                                       <span className="font-medium">{selectedService.max}</span>
                                    </li>
                                  </ul>
                               )}
                             </div>
                          </div>
                      )}`;

content = content.replace(
/                         \{showServiceDropdown && \([\s\S]*?\}             <\/div>\n                         \)\}\n                      <\/div>/,
serviceDetailsCode
);

fs.writeFileSync('src/SocialServices.tsx', content);
