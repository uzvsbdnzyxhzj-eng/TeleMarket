import React, { useState } from "react";
import { doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Search, ShoppingCart, Check, X, Trash2, ShieldAlert, RotateCcw, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface AdminOrdersManagementProps {
  adminTxs: any[];
}

export default function AdminOrdersManagement({ adminTxs }: AdminOrdersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Filter out topups and withdrawals to focus only on actual product/service orders & purchases
  const orders = adminTxs.filter((tx) => {
    const isOrder =
      tx.type === "smm_order" ||
      tx.type === "child_panel_order" ||
      tx.type === "purchase_course" ||
      tx.type === "purchase_tool" ||
      tx.type === "purchase_gemini" ||
      tx.type === "buy_telegram" ||
      tx.type === "p2p_buy" ||
      tx.type === "purchase";
    return isOrder;
  });

  const handleUpdateStatus = async (txId: string, status: string) => {
    setIsProcessing(txId);
    try {
      await updateDoc(doc(db, "transactions", txId), {
        status,
        last_update: Date.now(),
      });
      toast.success(`Order status updated to ${status}`);
    } catch (e: any) {
      toast.error("Failed to update status: " + e.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRefund = async (tx: any) => {
    if (!tx.userId) {
      toast.error("No user ID associated with this transaction.");
      return;
    }
    const confirm = window.confirm(`Are you sure you want to refund $${tx.amountUSD} USD to user balance and cancel this order?`);
    if (!confirm) return;

    setIsProcessing(tx.id);
    try {
      // 1. Add balance back to user
      await updateDoc(doc(db, "users", tx.userId), {
        balanceUSD: increment(Number(tx.amountUSD)),
        total_spent: increment(-Number(tx.amountUSD)),
        last_update: Date.now(),
      });

      // 2. Mark transaction as canceled / refunded
      await updateDoc(doc(db, "transactions", tx.id), {
        status: "canceled",
        refunded: true,
        last_update: Date.now(),
      });

      toast.success(`Successfully refunded $${tx.amountUSD} USD & canceled order.`);
    } catch (e: any) {
      toast.error("Refund failed: " + e.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (txId: string) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this order record? This cannot be undone.");
    if (!confirm) return;

    setIsProcessing(txId);
    try {
      await deleteDoc(doc(db, "transactions", txId));
      toast.success("Order record deleted successfully");
    } catch (e: any) {
      toast.error("Deletion failed: " + e.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const getFriendlyType = (type: string) => {
    switch (type) {
      case "smm_order":
        return "SMM Social Service 🚀";
      case "child_panel_order":
        return "SMM Child Panel 🖥️";
      case "purchase_course":
        return "Premium Course 📂";
      case "purchase_tool":
        return "Premium Tool 🛠️";
      case "purchase_gemini":
        return "Gemini AI Subscription 🤖";
      case "buy_telegram":
      case "p2p_buy":
        return "Telegram Account 👤";
      case "purchase":
        return "General Purchase 🛒";
      default:
        return type;
    }
  };

  const filteredOrders = orders.filter((tx) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (tx.id && tx.id.toLowerCase().includes(term)) ||
      (tx.userId && tx.userId.toLowerCase().includes(term)) ||
      (tx.userEmail && tx.userEmail.toLowerCase().includes(term)) ||
      (tx.serviceName && tx.serviceName.toLowerCase().includes(term)) ||
      (tx.domain && tx.domain.toLowerCase().includes(term)) ||
      (tx.details?.title && tx.details.title.toLowerCase().includes(term));

    // Type filter
    const matchesType = typeFilter === "all" || tx.type === typeFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (tx.status === "pending" || tx.status === "wait" || tx.status === "processing")) ||
      (statusFilter === "completed" && (tx.status === "completed" || tx.status === "success" || tx.status === "paid" || tx.status === "ok")) ||
      (statusFilter === "canceled" && (tx.status === "canceled" || tx.status === "failed" || tx.status === "error" || tx.status === "rejected"));

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <ShoppingCart className="w-5 h-5 text-[#2AABEE]" />
            User Orders & Purchases (অর্ডার ও ক্রয় ব্যবস্থাপনা)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage SMM orders, child panels, courses, tools, and account purchases.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by User, ID, Domain, or Service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2AABEE] outline-none text-sm"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2AABEE] outline-none"
        >
          <option value="all">All Order Types (সকল প্রকার)</option>
          <option value="smm_order">SMM Social Services 🚀</option>
          <option value="child_panel_order">SMM Child Panels 🖥️</option>
          <option value="purchase_course">Premium Courses 📂</option>
          <option value="purchase_tool">Premium Tools 🛠️</option>
          <option value="purchase_gemini">Gemini AI Subscriptions 🤖</option>
          <option value="buy_telegram">Telegram Account Purchases 👤</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2AABEE] outline-none"
        >
          <option value="all">All Statuses (সকল স্ট্যাটাস)</option>
          <option value="pending">Pending / Processing (চলমান)</option>
          <option value="completed">Completed / Paid (সম্পন্ন)</option>
          <option value="canceled">Canceled / Refunded (বাতিল ও রিফান্ড)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 border-b">Order Info</th>
              <th className="px-4 py-3 border-b">User</th>
              <th className="px-4 py-3 border-b">Details</th>
              <th className="px-4 py-3 border-b text-center">Amount</th>
              <th className="px-4 py-3 border-b text-center">Status</th>
              <th className="px-4 py-3 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 italic">
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((tx) => {
                const isPending =
                  tx.status === "pending" ||
                  tx.status === "wait" ||
                  tx.status === "processing" ||
                  tx.status === "in progress";
                const isSuccess =
                  tx.status === "completed" ||
                  tx.status === "success" ||
                  tx.status === "paid" ||
                  tx.status === "ok";
                const isCanceled =
                  tx.status === "canceled" ||
                  tx.status === "failed" ||
                  tx.status === "error" ||
                  tx.status === "rejected";

                return (
                  <tr key={`admin-order-${tx.id}`} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-xs">ID: {tx.id}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}
                        </span>
                        <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded w-max">
                          {getFriendlyType(tx.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{tx.userEmail || "Unknown"}</span>
                        <span className="text-[10px] text-gray-400">UID: {tx.userId || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col max-w-[280px] overflow-hidden text-ellipsis">
                        {tx.type === "smm_order" && (
                          <>
                            <span className="font-medium text-gray-800 text-xs">
                              SMM: {tx.serviceName || `Service #${tx.serviceId}`}
                            </span>
                            <span className="text-[10px] text-gray-500 truncate mt-0.5">
                              Link: <a href={tx.link} target="_blank" rel="noopener noreferrer" className="text-[#2AABEE] hover:underline">{tx.link}</a>
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              Qty: {tx.quantity} pcs
                            </span>
                          </>
                        )}
                        {tx.type === "child_panel_order" && (
                          <>
                            <span className="font-medium text-gray-800 text-xs">Domain: {tx.domain}</span>
                            <span className="text-[10px] text-gray-500 font-medium">Nameservers: NS1, NS2</span>
                          </>
                        )}
                        {(tx.type === "purchase_course" || tx.type === "purchase_tool") && (
                          <>
                            <span className="font-medium text-gray-800 text-xs">
                              Item: {tx.details?.title || "N/A"}
                            </span>
                            <span className="text-[10px] text-gray-500 truncate mt-0.5">
                              Category: {tx.details?.category || "N/A"}
                            </span>
                          </>
                        )}
                        {tx.type === "purchase_gemini" && (
                          <>
                            <span className="font-medium text-gray-800 text-xs">Gemini Premium AI License</span>
                          </>
                        )}
                        {(tx.type === "buy_telegram" || tx.type === "p2p_buy") && (
                          <>
                            <span className="font-medium text-gray-800 text-xs">
                              TG Account: {tx.details?.title || tx.details?.accountType || "Telegram Account"}
                            </span>
                            {tx.details?.code && (
                              <span className="text-[10px] text-emerald-600 font-bold">
                                SMS/Code: {tx.details.code}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-900">
                      ${parseFloat(tx.amountUSD || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {isPending && (
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-200">
                          <Clock className="w-3 h-3 animate-pulse" /> Pending
                        </span>
                      )}
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {isCanceled && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                          <X className="w-3 h-3" /> {tx.refunded ? "Refunded" : "Canceled"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(tx.id, "completed")}
                              disabled={isProcessing === tx.id}
                              className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg text-xs font-semibold transition"
                              title="Mark Completed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRefund(tx)}
                              disabled={isProcessing === tx.id}
                              className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Refund & Cancel"
                            >
                              <RotateCcw className="w-4 h-4" /> <span className="text-[10px] hidden lg:inline">Refund</span>
                            </button>
                          </>
                        )}
                        {!isPending && !tx.refunded && (
                          <button
                            onClick={() => handleRefund(tx)}
                            disabled={isProcessing === tx.id}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-800 p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            title="Refund & Cancel"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> <span className="text-[10px] hidden lg:inline">Refund</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={isProcessing === tx.id}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs font-semibold transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
