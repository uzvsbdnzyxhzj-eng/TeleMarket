import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('RefreshCw')) {
  content = content.replace('} from "lucide-react";', '  RefreshCw,\n} from "lucide-react";');
}

const targetStart = '{/* PROFILE VIEW */}';
const targetRegex = /\{\/\* PROFILE VIEW \*\/\}\s*\{currentView === "profile" && \([\s\S]*?\{\/\* Referral Profile Card \*\/\}/;

const newProfileTop = `{/* PROFILE VIEW */}
        {currentView === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {i18n.profileTitle || "My Profile"}
              </h2>
              <button
                onClick={() => {
                  localStorage.setItem("skip_auto_login", "true");
                  signOut(auth);
                }}
                className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#1cd435] to-green-600 p-1 mb-4 flex items-center justify-center">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile Avatar" className="w-full h-full rounded-full object-cover border-4 border-white" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#1cd435] flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
                        {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#1cd435] mb-2 uppercase">
                    Hi, {currentUser?.displayName || currentUser?.email?.split('@')[0] || "User"}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-gray-800 font-bold text-base">Available Balance : {balanceUSD.toFixed(2)} USD</span>
                    <button onClick={() => window.location.reload()} className="p-1 hover:bg-gray-100 border border-gray-300 rounded-md transition shadow-sm">
                      <RefreshCw className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{numericId}</div>
                      <div className="text-[#152e4d] font-bold text-sm">Support Pin</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.txType === "Credit").reduce((sum, t) => sum + (t.amountUSD || 0), 0).toFixed(2)} USD</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Deposited</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.type === "purchase" || t.txType === "Debit").reduce((sum, t) => sum + (t.amountUSD || 0), 0).toFixed(2)}</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Spent</div>
                    </div>
                    <div className="border border-[#1cd435] rounded-xl p-4 text-center shadow-sm">
                      <div className="text-[#1cd435] font-bold text-xl mb-1">{transactions.filter(t => t.type === "purchase" || t.type === "p2p_buy").length}</div>
                      <div className="text-[#152e4d] font-bold text-sm">Total Order</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-800" />
                    <h3 className="font-bold text-gray-800 text-lg">Account Information</h3>
                  </div>
                  <div className="p-6">
                      <div className="bg-[#1cd435] text-white rounded-lg p-4 text-center mb-4">
                        <div className="font-bold text-xl mb-1">{balanceUSD.toFixed(2)} USD</div>
                        <div className="text-sm font-bold tracking-wide">Available Balance</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                        <CheckCircle className="w-10 h-10 text-blue-500 mx-auto fill-blue-500/10" />
                        <div className="text-xl font-bold mt-3 text-gray-800">Account Verified!</div>
                      </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-800" />
                    <h3 className="font-bold text-gray-800 text-lg">User Information</h3>
                  </div>
                  <div className="p-6 text-sm text-gray-800 space-y-3">
                      <p className="flex items-center"><strong className="w-16">email :</strong> <span className="font-medium text-gray-600">{currentUser?.email}</span></p>
                      <p className="flex items-center"><strong className="w-16">Phone :</strong> <span className="font-medium text-gray-600">N/A</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">

              {/* Referral Profile Card */}`;

content = content.replace(targetRegex, newProfileTop);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated profile view grid layout");
