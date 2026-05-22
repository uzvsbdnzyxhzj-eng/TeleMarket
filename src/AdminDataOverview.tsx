import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import toast from "react-hot-toast";
import { DollarSign, Activity, Calendar, Award, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDataOverview() {
    const [period, setPeriod] = useState("all");
    const [stats, setStats] = useState({ netProfit: 0, details: [] as any[], chartData: [] as any[] });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const txSnap = await getDocs(collection(db, "transactions"));
            let totalProfit = 0;
            const tempDetails: any[] = [];
            
            const now = Date.now();
            
            // Generate chart skeleton based on period
            const chartData: any[] = [];
            
            if (period === "daily") {
                for (let i = 23; i >= 0; i--) {
                    const d = new Date(now - i * 3600000);
                    chartData.push({
                        date: `${d.getHours()}:00`,
                        topups: 0,
                        withdrawals: 0,
                        tsStart: new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0).getTime(),
                        tsEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1, 0, 0).getTime()
                    });
                }
            } else if (period === "weekly") {
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(now - i * 86400000);
                    chartData.push({
                        date: `${d.getMonth() + 1}/${d.getDate()}`,
                        topups: 0,
                        withdrawals: 0,
                        tsStart: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
                        tsEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()
                    });
                }
            } else if (period === "annual" || period === "all") {
                // Last 12 months
                for (let i = 11; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    chartData.push({
                        date: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                        topups: 0,
                        withdrawals: 0,
                        tsStart: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
                        tsEnd: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
                    });
                }
            } else { // "monthly"
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(now - i * 86400000);
                    chartData.push({
                        date: `${d.getMonth() + 1}/${d.getDate()}`,
                        topups: 0,
                        withdrawals: 0,
                        tsStart: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
                        tsEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()
                    });
                }
            }
            
            txSnap.docs.forEach(doc => {
               const data = doc.data();
               const createdAt = data.createdAt || 0;
               let profit = 0;
               let serviceType = "";
               
               const status = (data.status || "").toLowerCase();
               const type = data.type || "";
               
               const isPending = status === "pending" || status === "wait" || status === "in progress" || status === "processing";
               const isCanceled = status === "canceled" || status === "cancelled" || status === "refunded" || status === "partial" || status === "failed" || status === "error";

               // Populate 30-day Chart
               if (!isPending && !isCanceled && (status === "paid" || status === "ok" || status === "success" || status === "completed")) {
                   if (type === "topup" || type === "withdraw") {
                       const entry = chartData.find(day => createdAt >= day.tsStart && createdAt < day.tsEnd);
                       if (entry) {
                           if (type === "topup") entry.topups += parseFloat(data.amountUSD || 0);
                           if (type === "withdraw") entry.withdrawals += parseFloat(data.amountUSD || 0);
                       }
                   }
               }
               
               // Period filter
               if (period === "daily" && now - createdAt > 86400000) return;
               if (period === "weekly" && now - createdAt > 604800000) return;
               if (period === "monthly" && now - createdAt > 2592000000) return;
               if (period === "annual" && now - createdAt > 31536000000) return;

               // Profit calculations based on service type.
               if (!isPending && !isCanceled && (status === "paid" || status === "ok" || status === "success" || status === "completed")) {
                   if (type === "buy_telegram" || type === "p2p_buy") {
                       profit = parseFloat(data.amountUSD || 0) * 0.15; // Assumption 15% margin
                       serviceType = "Telegram Account";
                   } else if (type === "purchase") {
                       profit = parseFloat(data.amountUSD || 0) * 0.20; // Assumption 20% margin
                       serviceType = "SMM / Number";
                   }
                   
                   if (profit > 0) {
                       totalProfit += profit;
                       tempDetails.push({
                           id: doc.id,
                           user: data.userEmail || data.userNumericId || data.userId || "Unknown User",
                           service: serviceType,
                           cost: data.amountUSD,
                           profit: profit,
                           date: new Date(createdAt).toLocaleString()
                       });
                   }
               }
            });
            
            // sort by date desc
            tempDetails.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setStats({
                netProfit: totalProfit,
                details: tempDetails,
                chartData
            });
        } catch(e) {
            console.error("Error fetching admin stats:", e);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchStats();
    }, [period]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-500" /> Platform Overview</h2>
                   <p className="text-sm text-gray-500 mt-1">Net profit based on platform markup algorithms over the chosen period.</p>
                </div>
                
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                   {["all", "daily", "weekly", "monthly", "annual"].map(p => (
                       <button
                         key={p}
                         onClick={() => setPeriod(p)}
                         className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${period === p ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
                       >
                         {p.charAt(0).toUpperCase() + p.slice(1)}
                       </button>
                   ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-sm text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 mb-1 font-medium">Estimated Net Profit</p>
                            <h3 className="text-4xl font-bold">${stats.netProfit.toFixed(2)}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <DollarSign className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500" /> 
                    {period === "daily" ? "24-Hour" : period === "weekly" ? "7-Day" : period === "monthly" ? "30-Day" : "12-Month"} Cash Flow Trend
                </h3>
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={stats.chartData}
                            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} minTickGap={20} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                            <Tooltip 
                               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                               itemStyle={{ fontWeight: 'bold' }}
                               formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'topups' ? 'Top Ups ($)' : 'Withdrawals ($)']}
                            />
                            <Area type="monotone" dataKey="topups" name="topups" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.15} />
                            <Area type="monotone" dataKey="withdrawals" name="withdrawals" stroke="#ef4444" strokeWidth={3} fill="#ef4444" fillOpacity={0.15} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Award className="w-5 h-5 text-emerald-500"/> Profit Detalils & Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Service Taken</th>
                                <th className="px-6 py-4 font-medium">Cost to User</th>
                                <th className="px-6 py-4 font-medium text-right">Estimated Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading details...</td></tr>}
                            {!loading && stats.details.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No profitable transactions in this period.</td></tr>}
                            {!loading && stats.details.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-gray-500">{row.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{row.user}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                         <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold">{row.service}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">${parseFloat(row.cost).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">+${row.profit.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
