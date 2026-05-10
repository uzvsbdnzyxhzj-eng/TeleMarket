const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-white p-1 rounded border border-orange-200 mt-0.5 shrink-0">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=564609501" alt="QR" className="w-16 h-16 rounded-sm opacity-90"/>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">Send to Binance ID</p>
                     <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-orange-200 shadow-sm">
                       <span className="font-mono font-bold text-lg text-gray-900">564609501</span>
                       <button
                         onClick={() => {
                           navigator.clipboard.writeText("564609501");
                           toast("Copied Binance ID: 564609501");
                         }}
                         className="text-orange-600 hover:text-orange-800 p-1.5 hover:bg-orange-100 rounded-md transition"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                       </button>
                     </div>
                  </div>
                </div>`;

const newQRBlock = `<div className="bg-[#181a20] rounded-2xl overflow-hidden shadow-xl border border-[#2b3139] my-4 relative">
                  {/* Decorative background dots */}
                  <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#4d5b6e 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  
                  <div className="relative p-6 pb-4 flex flex-col items-center">
                    <div className="text-[#848e9c] text-[15px] font-medium mb-6 mt-1">Scan with Binance App to pay</div>
                    
                    {/* QR Code central container */}
                    <div className="bg-white p-3.5 rounded-xl shadow-2xl relative w-52 h-52 mb-6">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=564609501&margin=0" alt="QR" className="w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white w-[3.25rem] h-[3.25rem] flex items-center justify-center rounded-[10px] shadow-[0_0_0_5px_white]">
                          <svg className="w-[2.25rem] h-[2.25rem] text-[#f0b90b] fill-current" viewBox="-52.785 -88 457.47 528">
                            <path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-[#eaecef] text-xl font-bold tracking-wider mb-2 font-sans">UDAY VAI KOP</div>
                  </div>

                  {/* Copy Pay ID Section at Bottom */}
                  <div className="bg-[#2b3139]/50 backdrop-blur-md relative z-10 p-4 border-t border-[#363c45] flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="text-center sm:text-left">
                      <div className="text-[#848e9c] text-xs font-semibold mb-1 uppercase tracking-wider">Binance Pay ID</div>
                      <div className="text-[#eaecef] font-mono font-bold text-lg leading-none">564609501</div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("564609501");
                        toast("Copied Binance ID: 564609501");
                      }}
                      className="bg-[#f0b90b] hover:bg-[#dca626] text-[#181a20] px-5 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </button>
                  </div>
                </div>`;

c = c.replace(targetStr, newQRBlock);
fs.writeFileSync('src/App.tsx', c);
