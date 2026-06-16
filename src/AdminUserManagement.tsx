import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Search, User, Edit2, Check, X, Activity, Download, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const userList = snap.docs.map((d: any) => ({ uid: d.id, ...d.data() }));
      setUsers(userList);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `telemarket_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const filteredUsers = users.filter(u => 
    (u.uid && u.uid.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.numericId && String(u.numericId).includes(searchTerm))
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div>
           <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-1">
             <ShieldCheck className="w-5 h-5 text-blue-600" />
             Automated Backup & Administrator Tools
           </h3>
           <p className="text-sm text-blue-800">
             Your platform is powered by Google Firebase's infrastructure.
           </p>
         </div>
         <div className="flex gap-2 shrink-0">
           <button 
             onClick={handleBackup}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2"
           >
             <Download className="w-4 h-4" /> Export Backup
           </button>
         </div>
      </div>

      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-500" /> User Management & Insights
      </h3>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by UID, Email, or Numeric ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto mb-4 border border-gray-100 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 text-gray-600 font-bold border-b">UID / Num ID</th>
              <th className="px-4 py-3 text-gray-600 font-bold border-b">Email</th>
              <th className="px-4 py-3 text-gray-600 font-bold border-b">Balance</th>
              <th className="px-4 py-3 text-gray-600 font-bold border-b text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No users found.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.uid} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs">{u.uid}<br/><span className="text-indigo-600 font-bold">{u.numericId}</span></td>
                  <td className="px-4 py-3">{u.email || "N/A"}</td>
                  <td className="px-4 py-3 font-bold text-green-600">${(u.balanceUSD || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-100 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => {
            setSelectedUser(null);
            fetchUsers(); // Refresh on close in case balance changed
          }} 
        />
      )}
    </div>
  );
}

function UserDetailsModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [editBalanceMode, setEditBalanceMode] = useState(false);
  const [newBalanceStr, setNewBalanceStr] = useState(String(user.balanceUSD || 0));

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        setTxs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {
        console.error(e);
      }
      setLoadingTx(false);
    };
    fetchTx();
  }, [user.uid]);

  const saveBalance = async () => {
    const val = parseFloat(newBalanceStr);
    if(isNaN(val)) return toast.error("Invalid amount");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        balanceUSD: val
      });
      user.balanceUSD = val; 
      setEditBalanceMode(false);
      toast.success("Balance updated successfully");
    } catch(e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const getStats = () => {
    const topups = txs.filter(t => t.type === 'topup' && (t.status === 'paid' || t.status === 'OK' || t.status === 'pending'));
    const withdraws = txs.filter(t => t.type === 'withdraw' && (t.status === 'paid' || t.status === 'OK' || t.status === 'pending'));
    const purchases = txs.filter(t => (t.type === 'buy' || t.type === 'purchase') && (t.status === 'paid' || t.status === 'OK' || t.status === 'WAIT'));

    return {
      lastTopup: topups.length ? new Date(topups[0].createdAt).toLocaleString() : "Never",
      lastWithdraw: withdraws.length ? new Date(withdraws[0].createdAt).toLocaleString() : "Never",
      lastPurchase: purchases.length ? new Date(purchases[0].createdAt).toLocaleString() : "Never",
    };
  };

  const stats = getStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            User Insights
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Email</p>
               <p className="font-bold text-gray-800 break-all">{user.email || "N/A"}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Numeric ID</p>
               <p className="font-bold text-indigo-600">{user.numericId || "N/A"}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Registered On</p>
               <p className="font-bold text-gray-800">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}</p>
             </div>
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-bold mb-1">Current Balance</p>
                  {editBalanceMode ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={newBalanceStr} 
                        onChange={e => setNewBalanceStr(e.target.value)} 
                        className="w-24 px-2 py-1 text-sm border border-blue-300 rounded outline-none"
                      />
                      <button onClick={saveBalance} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4"/></button>
                      <button onClick={() => {setEditBalanceMode(false); setNewBalanceStr(String(user.balanceUSD||0));}} className="text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <p className="font-black text-2xl text-blue-800">${(user.balanceUSD || 0).toFixed(2)}</p>
                  )}
                </div>
                {!editBalanceMode && (
                  <button onClick={() => setEditBalanceMode(true)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4">
               <h4 className="font-bold text-gray-700 text-sm mb-3 border-b pb-2">Financials</h4>
               <p className="text-sm flex justify-between py-1"><span className="text-gray-500">Total Deposited:</span> <span className="font-bold text-green-600">${(user.total_deposited || 0).toFixed(2)}</span></p>
               <p className="text-sm flex justify-between py-1"><span className="text-gray-500">Total Spent:</span> <span className="font-bold text-red-500">${(user.total_spent || 0).toFixed(2)}</span></p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
               <h4 className="font-bold text-gray-700 text-sm mb-3 border-b pb-2">Recent Activity</h4>
               <p className="text-sm flex justify-between py-1"><span className="text-gray-500">Last Top-up:</span> <span className="font-bold text-gray-800 text-right">{stats.lastTopup}</span></p>
               <p className="text-sm flex justify-between py-1"><span className="text-gray-500">Last Purchase:</span> <span className="font-bold text-gray-800 text-right">{stats.lastPurchase}</span></p>
               <p className="text-sm flex justify-between py-1"><span className="text-gray-500">Last Withdraw:</span> <span className="font-bold text-gray-800 text-right">{stats.lastWithdraw}</span></p>
            </div>
          </div>

          <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Transactions (Max 20)</h4>
          {loadingTx ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : txs.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No transactions found.</p>
          ) : (
            <div className="space-y-2">
              {txs.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800 capitalize">
                      {t.type} <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${t.status === 'paid' || t.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
                    </p>
                    <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.txType === 'Credit' ? 'text-green-600' : t.txType === 'Debit' ? 'text-red-500' : 'text-gray-800'}`}>
                      {t.txType === 'Credit' ? '+' : t.txType === 'Debit' ? '-' : ''}${t.amountUSD?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
