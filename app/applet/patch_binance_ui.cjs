const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const targetRegex = /<div className="fixed inset-0 bg-black\/60 flex items-center justify-center p-4 z-\[999\] overflow-y-auto w-full h-full">[\s\S]*?(?=if \(mockCheckout\))/;

const newUI = `<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[999] overflow-y-auto w-full h-full">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col mt-auto sm:my-auto border border-gray-200 relative pb-6 sm:pb-0">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-800 tracking-tight">Binance internal transfer</h2>
            <button onClick={() => setBinanceTransferAmount(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center relative my-2">
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-48 h-[2px] bg-gray-200" />
              <div
                className="absolute left-[calc(50%-6rem)] top-1/2 -translate-y-1/2 h-[2px] bg-[#3b71ca] transition-all duration-300"
                style={{ width: binanceStep === 2 ? '12rem' : '0' }}
              />
              
              <div className="flex justify-between w-48 relative z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors duration-300 " + (binanceStep >= 1 ? "bg-[#3b71ca]" : "bg-gray-300")}>
                    1
                  </div>
                  <span className={"text-xs whitespace-nowrap " + (binanceStep >= 1 ? "text-gray-800" : "text-gray-500")}>Make payment</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors duration-300 " + (binanceStep === 2 ? "bg-[#3b71ca]" : "bg-gray-300")}>
                    2
                  </div>
                  <span className={"text-xs whitespace-nowrap " + (binanceStep === 2 ? "text-gray-800" : "text-gray-500")}>Verify payment</span>
                </div>
              </div>
            </div>

            {binanceStep === 1 ? (
              <div className="animate-in slide-in-from-left-4 fade-in duration-300 mt-2">
                <div className="text-center mb-6">
                  <div className="text-3xl font-semibold text-gray-800">
                    {(binanceTransferAmount + usdFee).toFixed(2)} <span className="text-2xl font-normal text-gray-600">USDT</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Send to Binance ID</label>
                  <div className="flex bg-gray-100 rounded border border-gray-200 overflow-hidden">
                    <input 
                      type="text" 
                      readOnly 
                      value="564609501" 
                      className="flex-1 bg-transparent px-3 py-2 text-gray-700 outline-none w-full"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("564609501");
                        toast("Copied!");
                      }}
                      className="flex items-center gap-1.5 px-4 bg-white border-l border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#f6f6f6] rounded-xl p-5 mb-6 text-center shadow-sm border border-gray-100">
                  <div className="bg-white p-3 inline-block rounded-lg shadow-sm mb-5 relative">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=564609501&margin=0" alt="QR" className="w-36 h-36" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white w-9 h-9 flex items-center justify-center rounded-[4px]">
                        <svg className="w-6 h-6 text-[#f0b90b] fill-current" viewBox="-52.785 -88 457.47 528">
                          <path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left text-sm text-gray-600 space-y-4 leading-relaxed font-sans">
                    <p>1. Scan the QR using the Binance app or send funds using the Binance ID.</p>
                    <p>2. After completing the payment tap "Confirm payment".</p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setBinanceStep(2)}
                    className="w-full bg-[#3b71ca] hover:bg-[#3260ab] text-white font-medium py-3 rounded text-lg transition shadow flex items-center justify-center relative z-10"
                  >
                    Confirm payment
                  </button>
                  <div className="absolute -bottom-4 right-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none transform translate-y-1/2 translate-x-2 z-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300 mt-2">
                
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center mb-6 border border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Amount</div>
                    <div className="font-medium text-gray-800">{(binanceTransferAmount + usdFee).toFixed(2)} USDT</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Send to Binance ID</div>
                    <div className="font-medium text-gray-800 flex items-center gap-1.5">
                      564609501 
                      <button onClick={() => { navigator.clipboard.writeText("564609501"); toast("Copied!"); }} className="text-[#3b71ca] hover:text-[#3260ab]">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="block text-[15px] font-bold text-gray-800">Enter you Binance Order ID</label>
                  <input
                    type="text"
                    onChange={e => setBinanceOrderId(e.target.value)}
                    value={binanceOrderId}
                    className="w-full p-2.5 bg-white border border-[#3b71ca] rounded outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm font-sans"
                  />
                </div>

                <div className="bg-[#f6f6f6] rounded-xl p-5 mb-6 shadow-sm border border-gray-100 text-[15px] text-gray-700">
                   <div className="text-center mb-5 pb-5 border-b border-gray-200">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 inline-block w-full max-w-[240px]">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Payment Successful</div>
                        <div className="font-bold text-lg mb-4 text-gray-800">{(binanceTransferAmount + usdFee).toFixed(2)} USDT</div>
                        
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 p-2 rounded text-xs px-3">
                          <span className="text-gray-500">Order ID</span>
                          <div className="font-mono font-medium text-gray-700 flex items-center gap-2">
                            <div className="h-2 w-16 bg-gray-300 rounded"></div>
                            <Copy className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4 leading-relaxed text-left font-sans">
                     <p>1. Copy the Order ID from the successful payment details in your Binance account.</p>
                     <p>2. Paste it into the field above and tap "Verify payment".</p>
                   </div>
                </div>

                <div className="relative">
                  <button
                    disabled={!binanceOrderId || isSubmitBinance}
                    onClick={async () => {
                      setIsSubmitBinance(true);
                      try {
                        const res = await fetch('/api/payment/binance/check', {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderId: binanceOrderId,
                            amount: Number((binanceTransferAmount + usdFee).toFixed(2)),
                            uid: currentUser?.uid
                          })
                        });
                        const data = await res.json();
                        
                        const txRef = doc(collection(db, "transactions"));
                        await setDoc(txRef, {
                          userId: currentUser?.uid,
                          userEmail: currentUser?.email,
                          userNumericId: numericId,
                          type: "topup",
                          txType: "Credit",
                          amountUSD: binanceTransferAmount,
                          status: data.success ? "paid" : "pending",
                          details: { method: 'binance_manual', orderId: binanceOrderId, totalSent: binanceTransferAmount + usdFee },
                          createdAt: Date.now(),
                        });
                        
                        if (data.success) {
                           await updateDoc(doc(db, "users", currentUser?.uid), {
                              balanceUSD: increment(binanceTransferAmount),
                              total_deposited: increment(binanceTransferAmount),
                              last_update: Date.now()
                           });
                           const userDoc = await getDoc(doc(db, "users", currentUser?.uid));
                           if (userDoc.exists() && userDoc.data().referredBy) {
                              const referrerId = userDoc.data().referredBy;
                              const referrerRef = doc(db, "users", referrerId);
                              const referrerDoc = await getDoc(referrerRef);
                              if (referrerDoc.exists()) {
                                  const bonusAmount = binanceTransferAmount * 0.01;
                                  await updateDoc(referrerRef, {
                                      balanceUSD: increment(bonusAmount),
                                      total_deposited: increment(bonusAmount),
                                      referralEarnings: increment(bonusAmount),
                                      last_update: Date.now()
                                  });
                                  const refTxRef = doc(collection(db, "transactions"));
                                  await setDoc(refTxRef, {
                                      userId: referrerId,
                                      type: "referral_bonus",
                                      txType: "Credit",
                                      amountUSD: bonusAmount,
                                      status: "paid",
                                      details: { fromUserId: currentUser?.uid },
                                      createdAt: Date.now(),
                                  });
                              }
                           }
                           setBinanceTransferAmount(null);
                           setTopupModal(false);
                           setBinanceOrderId("");
                           toast("Binance Verified Instantly! Balance updated.");
                           return;
                        }

                        toast("Your Order is submitted for review! It could not be instantly verified, an admin will review.");
                        setBinanceTransferAmount(null);
                        setTopupModal(false);
                        setBinanceOrderId("");
                      } catch(e) {
                        console.error(e);
                        toast("Error submitting. Try again.");
                      }
                      setIsSubmitBinance(false);
                    }}
                    className="w-full bg-[#3b71ca] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3260ab] text-white font-medium py-3 rounded text-lg transition shadow flex justify-center items-center gap-2 relative z-10"
                  >
                    {isSubmitBinance ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : "Verify payment"}
                  </button>
                  <div className="absolute -bottom-4 right-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none transform translate-y-1/2 translate-x-2 z-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
`;

c = c.replace(targetRegex, newUI + '\n    ');

fs.writeFileSync('src/App.tsx', c);
