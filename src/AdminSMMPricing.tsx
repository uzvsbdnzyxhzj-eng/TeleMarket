import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Search, Save, Check, X, Loader2, ArrowUpRight, CheckSquare, Square, Edit3, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSMMPricing({ socialMarkupPercent }: { socialMarkupPercent: number }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [smmMarkup, setSmmMarkup] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [bulkSelect, setBulkSelect] = useState(false);

  const [editingService, setEditingService] = useState<any | null>(null);
  const [tempProfit, setTempProfit] = useState<string>("");
  const [tempDesc, setTempDesc] = useState<string>("");
  const [isTempCustom, setIsTempCustom] = useState<boolean>(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  
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

  const startEditing = (service: any) => {
    try {
      console.log("SMM Admin start editing:", service);
      setEditingService(service);
      const existingOverride = (smmMarkup && typeof smmMarkup === "object" ? smmMarkup[service.service] : null) || {};
      const isCustom = existingOverride.type === "fixed";
      const base = parseFloat(service.rate) || 0;
      const markupPercent = socialMarkupPercent || 25;
      const defaultProfit = base * markupPercent / 100;
      const profit = defaultProfit > 0.10 ? defaultProfit : 0.10;
      
      setIsTempCustom(isCustom);
      setTempProfit(isCustom ? (existingOverride.profit || 0).toString() : profit.toFixed(4));
      setTempDesc(existingOverride.description || "");
    } catch (err: any) {
      console.error("Error starting SMM edit:", err);
      toast.error("Failed to open edit panel: " + err.message);
    }
  };

  const handleAiGenerateDescription = async () => {
    if (!editingService) return;
    setGeneratingDesc(true);
    try {
      const response = await fetch("/api/admin/smm/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: editingService.name,
          categoryName: editingService.category
        })
      });
      const data = await response.json();
      if (data.description) {
        setTempDesc(data.description);
        toast.success("AI description generated successfully!");
      } else if (data.error) {
        toast.error(`AI Error: ${data.error}`);
      } else {
        toast.error("Failed to generate description.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while generating description.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleApplyChanges = () => {
    if (!editingService) return;
    
    setSmmMarkup(prev => {
      const serviceId = editingService.service;
      const current = prev[serviceId] || {};
      
      const updated: any = {
        ...current,
        description: tempDesc
      };
      
      if (isTempCustom) {
        const val = parseFloat(tempProfit);
        updated.type = "fixed";
        updated.profit = isNaN(val) ? 0 : val;
      } else {
        delete updated.type;
        delete updated.profit;
      }
      
      return {
        ...prev,
        [serviceId]: updated
      };
    });
    
    setEditingService(null);
    toast.success("Changes applied to list! (Click 'Save Pricing' to sync to database)");
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
                <th className="px-4 py-3 font-medium text-gray-600 text-center w-24">Actions</th>
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
                    <td className="px-4 py-3 text-center">
                       <button
                          type="button"
                          onClick={() => startEditing(s)}
                          className="bg-blue-50 hover:bg-blue-100 text-[#2AABEE] px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all"
                       >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                       </button>
                    </td>
                  </tr>
                );
              })}
              {filteredServices.length === 0 && (
                 <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">No services found matching your search.</td>
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

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2AABEE] uppercase tracking-wider">Service Settings</span>
                <h4 className="font-extrabold text-gray-800 text-lg">Edit Service #{editingService.service}</h4>
              </div>
              <button 
                onClick={() => setEditingService(null)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Service Info */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 space-y-1">
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">{editingService.category}</div>
                <div className="font-bold text-gray-800 text-sm leading-snug">{editingService.name}</div>
                <div className="flex gap-4 pt-2 text-xs text-gray-500 font-mono">
                  <span>Base Rate: ${parseFloat(editingService.rate).toFixed(4)}</span>
                  <span>Min: {editingService.min} / Max: {editingService.max}</span>
                </div>
              </div>

              {/* Profit Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">Profit Margin Settings</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTempCustom(!isTempCustom);
                      if (!isTempCustom) {
                        const base = parseFloat(editingService.rate);
                        const defaultProfit = base * socialMarkupPercent / 100;
                        setTempProfit((defaultProfit > 0.10 ? defaultProfit : 0.10).toFixed(4));
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${!isTempCustom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {!isTempCustom ? "Using Global %" : "Using Custom fixed"} (Click to Toggle)
                  </button>
                </div>
                
                {isTempCustom ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">$</span>
                    <input 
                      type="number" 
                      step="0.0001"
                      placeholder="0.0000"
                      value={tempProfit}
                      onChange={(e) => setTempProfit(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 border border-green-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 font-mono bg-green-50/50 text-green-800 font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-bold">Custom Profit</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500 border border-gray-100">
                    Currently utilizing global markup settings. It adds a profit of <span className="font-bold font-mono text-gray-700">${(parseFloat(editingService.rate) * socialMarkupPercent / 100 > 0.10 ? parseFloat(editingService.rate) * socialMarkupPercent / 100 : 0.10).toFixed(4)}</span> to the base price.
                  </div>
                )}
              </div>

              {/* Service Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    Service Description <span className="text-xs font-normal text-gray-400">(Supports HTML)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAiGenerateDescription}
                    disabled={generatingDesc}
                    className="text-xs bg-gradient-to-r from-blue-600 to-[#2AABEE] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
                  >
                    {generatingDesc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> ✨ AI Generate Description
                      </>
                    )}
                  </button>
                </div>
                
                <textarea
                  rows={6}
                  placeholder="Enter custom service description (e.g. Speed: 10K/Day, Guarantee: 30 Days Refill, Start Time: Instant...)"
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm leading-relaxed"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyChanges}
                className="px-5 py-2 bg-[#2AABEE] hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-500/10 active:scale-[0.98] transition text-sm"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
