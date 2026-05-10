const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/const \[topupModal, setTopupModal\] = useState\(false\);/, "const [topupModal, setTopupModal] = useState(false);\n  const [binanceTransferAmount, setBinanceTransferAmount] = useState<number | null>(null);\n  const [binanceOrderId, setBinanceOrderId] = useState(\"\");\n  const [binanceStep, setBinanceStep] = useState<1 | 2>(1);\n  const [isSubmitBinance, setIsSubmitBinance] = useState(false);");

c = c.replace(/handleTopup\(topupMethod\!, enteredUSD\);/, `if (topupMethod === "binance") {
                        setBinanceTransferAmount(enteredUSD);
                        setBinanceStep(1);
                        setTopupModal(false);
                      } else {
                        handleTopup(topupMethod!, enteredUSD);
                      }`);

// Now add the modal code somewhere after setTopupModal 
const modalCode = `
      {binanceTransferAmount !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBinanceTransferAmount(null)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Binance internal transfer</h2>
              <button
                onClick={() => setBinanceTransferAmount(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              {/* Stepper */}
              <div className="flex items-center justify-center mb-8 relative px-4">
                 <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                 <div className="absolute top-1/2 left-10 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: binanceStep === 2 ? 'calc(100% - 80px)' : '0%' }}></div>
                 <div className="flex justify-between w-full max-w-[250px] relative">
                   <div className="flex flex-col items-center flex-1">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${binanceStep >= 1 ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"}\`}>1</div>
                      <span className="text-xs mt-2 text-gray-600 font-medium">Make payment</span>
                   </div>
                   <div className="flex flex-col items-center flex-1">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${binanceStep >= 2 ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"}\`}>2</div>
                      <span className="text-xs mt-2 text-gray-600 font-medium whitespace-nowrap">Verify payment</span>
                   </div>
                 </div>
              </div>

              {binanceStep === 1 ? (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-center mb-6">
                     <div className="text-4xl font-extrabold flex items-center justify-center gap-2 text-gray-800">
                        {binanceTransferAmount} <span className="text-gray-500 text-2xl">USDT</span>
                     </div>
                  </div>

                  <div className="w-full mb-6">
                     <p className="text-sm font-bold text-gray-700 mb-1">Send to Binance ID</p>
                     <div className="flex items-center border border-gray-300 rounded overflow-hidden shadow-sm">
                        <div className="bg-gray-50 text-gray-700 flex-1 p-3 text-lg tracking-wider font-bold">564609501</div>
                        <button 
                           onClick={() => {
                             navigator.clipboard.writeText("564609501");
                             toast("Copied!");
                           }}
                           className="bg-white border-l border-gray-300 px-4 py-3 flex items-center gap-1 font-bold text-gray-700 hover:bg-gray-50 transition active:bg-gray-100"
                        >
                           <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> 
                           Copy
                        </button>
                     </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl w-full flex flex-col items-center shadow-sm mb-6">
                     <div className="w-56 h-56 bg-white border border-gray-200 p-2 rounded-xl mb-6 shadow-sm">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=564609501" alt="QR Code" className="w-full h-full object-contain" />
                     </div>
                     <ol className="text-sm text-gray-600 space-y-4 leading-relaxed text-left w-full list-decimal list-inside">
                        <li>Scan the QR using the <span className="font-bold">Binance app</span> or send funds using the <span className="font-bold">Binance ID</span>.</li>
                        <li>After completing the payment tap <span className="font-bold">"Confirm payment"</span>.</li>
                     </ol>
                  </div>

                  <button 
                     onClick={() => setBinanceStep(2)}
                     className="w-full bg-[#1e4886] hover:bg-[#112d57] text-white font-bold py-3.5 rounded-lg shadow-md transition text-lg"
                  >
                     Confirm payment
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-2">
                  <div className="flex w-full bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200 shadow-sm">
                    <div className="flex-1 text-center border-r border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Amount</p>
                      <p className="font-bold text-lg text-gray-800">{binanceTransferAmount} USDT</p>
                    </div>
                    <div className="flex-1 text-center items-center flex flex-col justify-center">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Send to Binance ID</p>
                      <button 
                         onClick={() => {
                             navigator.clipboard.writeText("564609501");
                             toast("Copied!");
                         }}
                         className="font-bold text-gray-800 flex items-center justify-center gap-1.5 hover:text-blue-600 transition"
                      >
                         564609501
                         <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="w-full mb-6">
                     <p className="text-sm font-bold text-gray-700 mb-2">Enter your Binance Order ID</p>
                     <input 
                        type="text" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm text-lg" 
                        value={binanceOrderId}
                        onChange={(e) => setBinanceOrderId(e.target.value)}
                        placeholder="Type or paste here..." 
                     />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl w-full shadow-sm mb-6 flex flex-col">
                     <div className="bg-white border border-gray-200 rounded-lg opacity-80 mb-4 select-none pointer-events-none w-full shadow-sm overflow-hidden flex justify-center py-2">
                        <img src="https://public.bnbstatic.com/image/cms/article/body/202111/49b6e83dcac4942cbcd10fd176e0a8ad.png" alt="Order ID guide" className="max-h-24 object-contain grayscale opacity-75" />
                     </div>
                     <ol className="text-sm text-gray-600 space-y-4 leading-relaxed text-left w-full list-decimal list-inside">
                        <li>Copy the <span className="font-bold">Order ID</span> from the successful payment details in your Binance account.</li>
                        <li>Paste it into the field above and tap <span className="font-bold">"Verify payment"</span>.</li>
                     </ol>
                  </div>

                  <button 
                     disabled={isSubmitBinance || !binanceOrderId.trim()}
                     onClick={async () => {
                       if (!binanceOrderId.trim()) return;
                       setIsSubmitBinance(true);
                       try {
                          const txRef = doc(collection(db, "transactions"));
                          await setDoc(txRef, {
                            userId: currentUser?.uid,
                            type: "topup",
                            txType: "Credit",
                            amountUSD: binanceTransferAmount,
                            status: "pending",
                            details: { method: "Binance Manual", orderId: binanceOrderId },
                            createdAt: Date.now(),
                          });
                          toast("Payment submitted and is under review!");
                          setBinanceTransferAmount(null);
                          setBinanceOrderId("");
                          setBinanceStep(1);
                       } catch(e: any) {
                          toast(e.message || "Failed");
                       } finally {
                          setIsSubmitBinance(false);
                       }
                     }}
                     className="w-full bg-[#1e4886] hover:bg-[#112d57] text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md"
                  >
                     {isSubmitBinance ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path></svg> : "Verify payment"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

c = c.replace("{/* Render top-up modal */}", "{/* Render top-up modal */}\n" + modalCode);
fs.writeFileSync('src/App.tsx', c);
console.log("Patched Binance Transfer code!");
