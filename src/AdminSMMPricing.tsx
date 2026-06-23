import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Search, Save, Check, X, Loader2, ArrowUpRight, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSMMPricing({ socialMarkupPercent }: { socialMarkupPercent: number }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [smmMarkup, setSmmMarkup] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [bulkSelect, setBulkSelect] = useState(false);
  
  useEffect(() => {
    fetchServices();
    const unsub = onSnapshot(doc(db, "settings", "smm_markup"), (docSnap) => {
      if (docSnap.exists()) {
        setSmmMarkup(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/proxy/smm/services", { method: "POST" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch SMM services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfitChange = (serviceId: string, newProfit: string) => {
    const val = parseFloat(newProfit);
    if (isNaN(val)) return;
    
    setSmmMarkup(prev => ({
      ...prev,
      [serviceId]: { type: "fixed", profit: val }
    }));
  };

  const handleToggleGlobal = (serviceId: string) => {
    setSmmMarkup(prev => {
      const next = { ...prev };
      if (next[serviceId]?.type === "fixed") {
         delete next[serviceId];
      } else {
         next[serviceId] = { type: "fixed", profit: 0 };
      }
      return next;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "smm_markup"), smmMarkup);
      toast.success("SMM pricing saved successfully!");
    } catch (error) {
      toast.error("Failed to save SMM pricing.");
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.service.toString().includes(searchTerm) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  
  // limit rendering due to performance
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const displayServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h3 className="font-bold text-gray-800 text-lg">SMM Services Pricing</h3>
           <p className="text-sm text-gray-500">Manage individual pricing for SMM services. By default, services use the global social markup percent ({socialMarkupPercent}%) or a minimum profit of $0.10, whichever is higher.</p>
        </div>
        <button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-[#2AABEE] hover:bg-blue-500 text-white px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Pricing
        </button>
      </div>
      
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
         <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Search services by ID, Name, Category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
         </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {loading ? (
           <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 w-16">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600">Service Name & Category</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Base Price</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center flex flex-col items-center gap-1">
                  <span>Use Global % ({socialMarkupPercent}%)</span>
                  <button 
                    onClick={() => {
                      const allSettings = { ...smmMarkup };
                      if (filteredServices.every(s => !allSettings[s.service] || allSettings[s.service].type !== 'fixed')) {
                         // currently all are global, so make them all custom
                         filteredServices.forEach(s => allSettings[s.service] = { type: 'fixed', profit: 0 });
                      } else {
                         // make all global
                         filteredServices.forEach(s => delete allSettings[s.service]);
                      }
                      setSmmMarkup(allSettings);
                    }}
                    className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 uppercase font-bold"
                  >
                    Toggle All
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right w-40">Your Profit</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Selling Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayServices.map((s) => {
                const isCustom = smmMarkup[s.service]?.type === "fixed";
                const base = parseFloat(s.rate);
                const defaultProfit = base * socialMarkupPercent / 100;
                const profit = defaultProfit > 0.10 ? defaultProfit : 0.10;
                const globalPrice = base + profit;
                
                let sellPriceStr = globalPrice.toFixed(4);
                let currentProfitStr = (globalPrice - base).toFixed(4);
                
                if (isCustom) {
                   const customProfit = smmMarkup[s.service]?.profit || 0;
                   sellPriceStr = (base + customProfit).toFixed(4);
                   currentProfitStr = customProfit.toFixed(4);
                }

                return (
                  <tr key={s.service} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><span className="bg-gray-800 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">{s.service}</span></td>
                    <td className="px-4 py-3">
                       <div className="font-medium text-gray-800 line-clamp-1" title={s.name}>{s.name}</div>
                       <div className="text-xs text-gray-500 mt-0.5">{s.category}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">${base.toFixed(4)}</td>
                    <td className="px-4 py-3">
                       <div className="flex justify-center">
                          <button 
                             onClick={() => handleToggleGlobal(s.service)}
                             className={`w-6 h-6 flex items-center justify-center rounded transition ${!isCustom ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                          >
                             {!isCustom ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       {!isCustom ? (
                          <span className={`font-mono text-xs ${parseFloat(currentProfitStr) > 0 ? 'text-green-600 font-bold bg-green-50 px-2 py-1 rounded' : 'text-gray-500'}`}>+${currentProfitStr}</span>
                       ) : (
                          <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                             <input 
                                type="number" 
                                step="0.0001"
                                defaultValue={(smmMarkup[s.service]?.profit || 0).toFixed(4)}
                                onBlur={(e) => handleProfitChange(s.service, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleProfitChange(s.service, e.currentTarget.value);
                                }}
                                className="w-full pl-6 pr-2 py-1.5 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-right font-mono bg-green-50 text-green-800 font-bold"
                             />
                          </div>
                       )}
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="font-mono text-gray-800 font-bold">${sellPriceStr}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredServices.length === 0 && (
                 <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No services found matching your search.</td>
                 </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
         <div className="p-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services
            </span>
            <div className="flex gap-2">
               <button
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
               >
                 Previous
               </button>
               <button
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages}
                 className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
               >
                 Next
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
