const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const targetRegex = /<div className="fixed inset-0 bg-black\/60 flex items-center justify-center p-4 z-\[999\] overflow-y-auto w-full h-full">[\s\S]*?(?=if \(mockCheckout\))/;

const newUI = `<div className="fixed inset-0 bg-black/60 flex flex-col sm:items-center sm:justify-center z-[999] overflow-y-auto w-full h-full relative">
        {/* Transparent backdrop for clicking outside */}
        <div className="absolute inset-0 bg-black/40" onClick={() => setBinanceTransferAmount(null)} />
        
        <div className="bg-white rounded-t-[1.5rem] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col mt-auto sm:my-auto border border-gray-200 relative pb-6 sm:pb-0 z-10 animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in duration-300">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-800 tracking-tight">Binance internal transfer</h2>
            <button onClick={() => setBinanceTransferAmount(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            {/* Steps Indicator */}
            <div className="flex items-center justify-center relative my-2">
              <div className="absolute left-1/2 top-[1rem] -translate-y-1/2 -translate-x-1/2 w-48 h-[2px] bg-gray-200" />
              <div
                className="absolute left-[calc(50%-6rem)] top-[1rem] -translate-y-1/2 h-[2px] bg-[#3b71ca] transition-all duration-300"
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
                  <label className="block text-[15px] font-bold text-gray-800 mb-1.5">Send to Binance ID</label>
                  <div className="flex bg-gray-100/80 rounded border border-gray-200 overflow-hidden">
                    <input 
                      type="text" 
                      readOnly 
                      value="564609501" 
                      className="flex-1 bg-transparent px-3 py-2.5 text-gray-600 outline-none w-full font-sans"
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
                  <div className="bg-white p-3 inline-block rounded-lg shadow-sm border border-gray-100 mb-5 relative">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=564609501&margin=0" alt="QR" className="w-40 h-40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-1 rounded-sm shadow-sm border border-gray-100">
                        <svg className="w-6 h-6 text-[#f0b90b] fill-current" viewBox="-52.785 -88 457.47 528">
                          <path d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left text-[14.5px] text-gray-600 space-y-4 leading-relaxed font-sans">
                    <p>1. Scan the QR using the Binance app or send funds using the Binance ID.</p>
                    <p>2. After completing the payment tap "Confirm payment".</p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setBinanceStep(2)}
                    className="w-full bg-[#3b71ca] hover:bg-[#3260ab] text-white font-medium py-3.5 rounded text-[16px] transition shadow flex items-center justify-center relative z-10"
                  >
                    Confirm payment
                  </button>
                  <div className="absolute -bottom-5 right-0 w-12 h-12 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none transform translate-y-1/2 translate-x-3 z-20">
                    <svg className="w-6 h-6 ml-0.5 mt-0.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.476 0 1.46 1.065 2.871 1.213 3.07.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300 mt-2">
                
                <div className="bg-gray-50/80 rounded-lg p-4 flex justify-between items-center mb-6 border border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Amount</div>
                    <div className="text-[15px] font-medium text-gray-800">{(binanceTransferAmount + usdFee).toFixed(2)} USDT</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Send to Binance ID</div>
                    <div className="text-[15px] font-medium text-gray-800 flex items-center gap-1.5">
                      564609501 
                      <button onClick={() => { navigator.clipboard.writeText("564609501"); toast("Copied!"); }} className="text-[#3b71ca] hover:text-[#3260ab] transition ml-0.5">
                        <Copy className="w-4 h-4" />
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
                    className="w-full px-3 py-2.5 bg-white border border-[#3b71ca] rounded outline-none shadow-[0_0_0_1px_rgba(59,113,202,0.5)] focus:shadow-[0_0_0_2px_rgba(59,113,202,0.8)] transition font-sans"
                  />
                </div>

                <div className="bg-[#f6f6f6] rounded-xl p-5 mb-6 shadow-sm border border-gray-100 text-[14.5px] text-gray-700">
                   <div className="text-center mb-5 pb-5 border-b border-gray-200">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 inline-block w-full max-w-[240px]">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="text-[11px] text-gray-500 mb-1">Payment Successful</div>
                        <div className="font-bold text-[17px] mb-4 text-gray-800 border-b border-gray-100 pb-3">{(binanceTransferAmount + usdFee).toFixed(2)} USDT <br/><span className="text-[10px] text-gray-400 font-normal">The recipient can check the balance in the funding wallet.</span></div>
                        
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded text-xs">
                          <span className="text-gray-500 font-medium">Order ID</span>
                          <div className="font-mono font-medium text-gray-700 flex items-center gap-2 bg-gray-200 pl-2 pr-1 ml-2 rounded-sm relative">
                            <div className="h-[14px] w-16 bg-gradient-to-r from-gray-300 to-gray-200 rounded-sm"></div>
                            <Copy className="w-[14px] h-[14px] text-gray-500 bg-white" />
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
                    className="w-full bg-[#3b71ca] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3260ab] text-white font-medium py-3.5 rounded text-[16px] transition shadow flex justify-center items-center gap-2 relative z-10"
                  >
                    {isSubmitBinance ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : "Verify payment"}
                  </button>
                  <div className="absolute -bottom-5 right-0 w-12 h-12 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-lg pointer-events-none transform translate-y-1/2 translate-x-3 z-20">
                    <svg className="w-6 h-6 ml-0.5 mt-0.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.476 0 1.46 1.065 2.871 1.213 3.07.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
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
