import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, increment } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Globe, Save, Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ChildPanelProps {
  currentUser: any;
  onNavigate: (view: string) => void;
  balanceUSD: number;
}

export default function ChildPanel({ currentUser, onNavigate, balanceUSD }: ChildPanelProps) {
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Form State
  const [domain, setDomain] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const INITIAL_PRICE = 5; // $5 for first 3 months

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "child_panels"),
      where("userId", "==", currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let result: any[] = [];
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side to avoid composite index requirements
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPanels(result);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching child panels:", error);
      toast.error("Failed to load child panels.");
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  const handleOrder = async () => {
    if (!domain.trim() || !adminUser.trim() || !adminPass.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // In a real app we'd deduct balance on the server using Admin SDK, but here we submit a request
    // and rely on Admin to process or ideally use a secure backend. For now we just create the document.
    // If we have less balance, reject immediately.
    if (balanceUSD < INITIAL_PRICE) {
      toast.error(`Insufficient balance. Requires $${INITIAL_PRICE}`);
      return;
    }

    setIsOrdering(true);
    try {
      await Promise.all([
        addDoc(collection(db, "child_panels"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          domain: domain.trim(),
          currency: currency,
          adminUser: adminUser.trim(),
          adminPass: adminPass, // Password shown to admin for setup
          price: INITIAL_PRICE,
          billingCycle: "3 months",
          nameservers: "ns1.telemarketpanel.com, ns2.telemarketpanel.com",
          status: "active",
          createdAt: Date.now()
        }),
        updateDoc(doc(db, "users", currentUser.uid), {
          balanceUSD: increment(-INITIAL_PRICE),
          total_spent: increment(INITIAL_PRICE),
          last_update: Date.now()
        }),
        addDoc(collection(db, "transactions"), {
          type: "child_panel_order",
          userId: currentUser.uid,
          userEmail: currentUser.email,
          domain: domain.trim(),
          amountUSD: INITIAL_PRICE,
          status: "completed",
          createdAt: Date.now()
        })
      ]);
      
      if (typeof (window as any).triggerPurchaseSuccess === "function") {
        (window as any).triggerPurchaseSuccess({
          title: `SMM Child Panel (${domain.trim()})`,
          category: "Child Panel Subscription 🖥️",
          priceUSD: INITIAL_PRICE,
          details: {
            "Domain": domain.trim(),
            "Nameservers": "ns1.telemarketpanel.com, ns2.telemarketpanel.com",
            "Admin User": adminUser.trim(),
            "Status": "Active (Needs DNS setup)",
            "Billing Cycle": "3 Months",
            "Instructions": "Please update your domain nameservers to: ns1.telemarketpanel.com and ns2.telemarketpanel.com to connect it to our network!"
          }
        });
      } else {
        toast.success("Child panel successfully activated! Please update your nameservers.");
      }
      setShowOrderModal(false);
      setDomain("");
      setAdminUser("");
      setAdminPass("");
    } catch (e: any) {
      toast.error("Failed to order panel: " + e.message);
    }
    setIsOrdering(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => onNavigate("dashboard")}
        className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-2 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Globe className="w-6 h-6 text-[#2AABEE]" /> Rent Child Panel
           </h2>
           <p className="text-gray-500 text-sm mt-1">Start your own SMM or Account business fully automatedly connected to our API.</p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="bg-[#2AABEE] hover:bg-[#2299d6] text-white px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(42,171,238,0.39)] hover:shadow-[0_6px_20px_rgba(42,171,238,0.23)] active:scale-[0.98] transition-all flex items-center gap-2 font-bold"
        >
          <PlusCircle className="w-5 h-5" /> Order New Panel ($5 / 3 Months)
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-blue-900 mb-3 text-lg">What do you get with a Child Panel? ✔️</h3>
        <ul className="text-blue-800 text-sm space-y-2 font-medium">
          <li className="flex items-center gap-2">• Fully Automated Orders connected to TeleMarket API</li>
          <li className="flex items-center gap-2">• Set your own prices and make unlimited profit</li>
          <li className="flex items-center gap-2">• Your Own Domain & Custom Branding</li>
          <li className="flex items-center gap-2">• 100% Free Hosting & Maintenance included</li>
          <li className="flex items-center gap-2">• Admin panel to manage your users, payments & orders</li>
        </ul>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
           <Loader2 className="w-8 h-8 animate-spin text-[#2AABEE]" />
        </div>
      ) : panels.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
               <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Child Panels Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't ordered any child panels. Get your own fully branded panel now.</p>
            <button onClick={() => setShowOrderModal(true)} className="bg-[#2AABEE] text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:shadow-md transition">
               Order Child Panel
            </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">Domain</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Price</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {panels.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{p.domain}</p>
                    <p className="text-xs text-gray-500 flex gap-2 mt-1">
                      <span>Admin: {p.adminUser}</span>
                      <span>Currency: {p.currency}</span>
                    </p>
                    {p.nameservers && (
                       <p className="text-xs text-blue-600 mt-1 font-medium">Nameservers: {p.nameservers}</p>
                    )}
                  </td>
                  <td className="p-4 text-center font-medium">${p.price} <span className="text-xs text-gray-500 font-normal">({p.billingCycle || "initially"})</span></td>
                  <td className="p-4 text-center">
                    {p.status === "pending" && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">Pending</span>}
                    {p.status === "active" && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Active</span>}
                    {p.status === "suspended" && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">Suspended</span>}
                  </td>
                  <td className="p-4 text-right text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
              <button 
                onClick={() => setShowOrderModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="p-6">
                 <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#2AABEE]" /> Order Child Panel
                 </h3>
                 <p className="text-sm text-gray-500 mb-6">Price: $5 for the first 3 months (then $3/month). Make sure your domain is registered elsewhere before ordering.</p>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Your Domain Name</label>
                       <input 
                         type="text" 
                         placeholder="e.g. mypanel.com" 
                         value={domain} onChange={e => setDomain(e.target.value)}
                         className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#2AABEE]"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Desired Currency</label>
                       <select 
                         value={currency} onChange={e => setCurrency(e.target.value)}
                         className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#2AABEE]"
                       >
                          <option value="USD">USD ($)</option>
                          <option value="BDT">BDT (৳)</option>
                          <option value="INR">INR (₹)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Username</label>
                       <input 
                         type="text" 
                         value={adminUser} onChange={e => setAdminUser(e.target.value)}
                         className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#2AABEE]"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Password</label>
                       <input 
                         type="text" 
                         value={adminPass} onChange={e => setAdminPass(e.target.value)}
                         className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#2AABEE]"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleOrder}
                   disabled={isOrdering}
                   className="w-full bg-[#2AABEE] text-white font-bold py-3.5 rounded-lg shadow-sm hover:bg-blue-500 transition mt-6 disabled:opacity-50 flex justify-center items-center gap-2"
                 >
                   {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   Place Order - $5.00
                 </button>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
