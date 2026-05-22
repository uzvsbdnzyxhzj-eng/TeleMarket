const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state state
c = c.replace(
  'const [adminTab, setAdminTab] = useState<"overview" | "topups" | "withdrawals" | "users" | "services" | "settings">("overview");',
  'const [adminTab, setAdminTab] = useState<"overview" | "topups" | "withdrawals" | "users" | "services" | "settings">("overview");\n  const [adminSubTab, setAdminSubTab] = useState<"pending" | "paid">("pending");'
);

// 2. Add reset subtab
c = c.replace(
  'onClick={() => setAdminTab(tab.id as any)}',
  'onClick={() => { setAdminTab(tab.id as any); setAdminSubTab("pending"); }}'
);

// 3. Fix the rendering structure
const beforeRender = `{(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pending Transactions Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full h-[600px]">`;

const afterRender = `{(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="flex gap-2 mb-4 bg-gray-100 p-1.5 rounded-xl w-full max-w-[400px]">
                <button
                  onClick={() => setAdminSubTab("pending")}
                  className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${adminSubTab === "pending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}\`}
                >
                  Pending {adminTab === "topups" ? "Top Ups" : "Withdrawals"}
                </button>
                <button
                  onClick={() => setAdminSubTab("paid")}
                  className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${adminSubTab === "paid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}\`}
                >
                  Paid History
                </button>
              </div>
            )}

            {(adminTab === "topups" || adminTab === "withdrawals") && (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Pending Transactions Management */}
                {adminSubTab === "pending" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">`;

c = c.replace(beforeRender, afterRender);

// 4. Update the "Paid Topups History" condition and remove its wrapping div that previously forced it into a grid
const topupsPaidRegex = /{adminTab === "topups" && \(\s*<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-\[600px\]">/m;

c = c.replace(topupsPaidRegex, `{adminTab === "topups" && adminSubTab === "paid" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">`);

const withdrawalsPaidRegex = /{adminTab === "withdrawals" && \(\s*<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-\[600px\]">/m;
c = c.replace(withdrawalsPaidRegex, `{adminTab === "withdrawals" && adminSubTab === "paid" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">`);

// 5. Update filtering to only show binance_manual for pending topups
const pendingFilterOld = '.filter((tx) => tx.status === "pending" && (adminTab === "topups" ? (tx.type === "topup") : tx.type === "withdraw"))';
const pendingFilterNew = '.filter((tx) => tx.status === "pending" && (adminTab === "topups" ? (tx.type === "topup" && tx.details?.method === "binance_manual") : tx.type === "withdraw"))';

c = c.replace(pendingFilterOld, pendingFilterNew); // Need to replace globally
c = c.replace(pendingFilterOld, pendingFilterNew); // There are at least two occurrences

fs.writeFileSync('src/App.tsx', c);
console.log('Script completed');
