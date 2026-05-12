import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Search, Edit, Save, Loader2, ArrowLeft, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminChildPanel() {
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit State
  const [editStatus, setEditStatus] = useState("");
  const [editNameservers, setEditNameservers] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "child_panels"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let result: any[] = [];
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });
      setPanels(result);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateDoc(doc(db, "child_panels", editingId), {
         status: editStatus,
         nameservers: editNameservers
      });
      toast.success("Child panel updated!");
      setEditingId(null);
    } catch (e: any) {
      toast.error("Failed to update: " + e.message);
    }
  };

  const filteredPanels = panels.filter(p => 
    (p.domain || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.userId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
             <Globe className="w-5 h-5 text-blue-600" /> Child Panel Orders
           </h3>
           <p className="text-sm text-gray-500">Manage user child panel requests and set Nameservers</p>
        </div>
        <div className="w-full md:w-auto relative max-w-sm">
           <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
           <input 
             type="text"
             placeholder="Search by domain, email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm"
           />
        </div>
      </div>

      <div className="overflow-x-auto">
         {loading ? (
           <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
         ) : filteredPanels.length === 0 ? (
           <div className="p-8 text-center text-gray-500 font-medium">No child panels found</div>
         ) : (
           <table className="w-full text-left text-sm whitespace-nowrap">
             <thead>
               <tr className="bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Admin Config</th>
                  <th className="px-4 py-3">Status & NS</th>
                  <th className="px-4 py-3 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filteredPanels.map((p) => {
                 if (editingId === p.id) {
                   return (
                     <tr key={p.id} className="bg-blue-50/30">
                       <td colSpan={2} className="px-4 py-3">
                          <p className="font-bold">{p.userEmail}</p>
                          <p className="text-gray-500 text-xs">{p.domain}</p>
                       </td>
                       <td colSpan={2} className="px-4 py-3 flex gap-4">
                          <select 
                            value={editStatus} onChange={e => setEditStatus(e.target.value)}
                            className="p-1.5 border rounded outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                          </select>
                          <input 
                            type="text" placeholder="Nameservers (ns1... ns2...)"
                            value={editNameservers} onChange={e => setEditNameservers(e.target.value)}
                            className="p-1.5 border rounded outline-none w-full max-w-[200px]"
                          />
                       </td>
                       <td className="px-4 py-3 text-right">
                          <button onClick={handleUpdate} className="bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 mr-2">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                       </td>
                     </tr>
                   );
                 }

                 return (
                   <tr key={p.id} className="hover:bg-gray-50">
                     <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{p.userEmail}</p>
                        <p className="text-xs text-gray-500">{p.userId}</p>
                     </td>
                     <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.domain}</p>
                        <p className="text-xs text-gray-500">Ordered: {new Date(p.createdAt).toLocaleDateString()}</p>
                     </td>
                     <td className="px-4 py-3">
                        <p className="text-gray-800">User: <span className="font-mono bg-gray-100 px-1 rounded">{p.adminUser}</span></p>
                        <p className="text-gray-500">Pass: <span className="font-mono bg-gray-100 px-1 rounded">{p.adminPass}</span></p>
                        <p className="text-xs text-gray-400 mt-0.5">Currency: {p.currency}</p>
                     </td>
                     <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                           p.status === 'active' ? 'bg-green-100 text-green-700' :
                           p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>{p.status.toUpperCase()}</span>
                        {p.nameservers && <p className="text-xs text-blue-600 mt-1 font-medium">{p.nameservers}</p>}
                     </td>
                     <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                             setEditingId(p.id);
                             setEditStatus(p.status);
                             setEditNameservers(p.nameservers || "");
                          }} 
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition"
                        >
                           <Edit className="w-4 h-4" />
                        </button>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
