import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Code, Copy, CheckCircle, FileText, ChevronDown, ChevronRight, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function ApiView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [apiKeyParam] = useState("YOUR_API_KEY");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({
    'get-services': true,
    'add-order': true
  });

  const endpoints = [
    {
      id: 'get-services',
      method: 'POST',
      url: '/api/v2',
      title: 'Get Services List',
      description: 'Returns a list of all available services with pricing.',
      params: [
        { name: 'key', type: 'string', required: true, desc: 'Your API Key' },
        { name: 'action', type: 'string', required: true, desc: 'Set to "services"' }
      ],
      successResponse: `[
  {
    "service": 1,
    "name": "Instagram Followers - Max 10k",
    "type": "Default",
    "category": "Instagram Followers",
    "rate": "0.90",
    "min": "100",
    "max": "10000"
  }
]`
    },
    {
      id: 'add-order',
      method: 'POST',
      url: '/api/v2',
      title: 'Create Order',
      description: 'Place a new SMM order.',
      params: [
        { name: 'key', type: 'string', required: true, desc: 'Your API Key' },
        { name: 'action', type: 'string', required: true, desc: 'Set to "add"' },
        { name: 'service', type: 'integer', required: true, desc: 'Service ID' },
        { name: 'link', type: 'string', required: true, desc: 'Link to the target (e.g. Instagram profile)' },
        { name: 'quantity', type: 'integer', required: true, desc: 'Needed quantity' }
      ],
      successResponse: `{
  "order": 23501
}`
    },
    {
      id: 'order-status',
      method: 'POST',
      url: '/api/v2',
      title: 'Order Status',
      description: 'Check the status of an existing order.',
      params: [
        { name: 'key', type: 'string', required: true, desc: 'Your API Key' },
        { name: 'action', type: 'string', required: true, desc: 'Set to "status"' },
        { name: 'order', type: 'integer', required: true, desc: 'Order ID' }
      ],
      successResponse: `{
  "charge": "0.27819",
  "start_count": "3572",
  "status": "Partial",
  "remains": "157",
  "currency": "USD"
}`
    },
    {
      id: 'user-balance',
      method: 'POST',
      url: '/api/v2',
      title: 'User Balance',
      description: 'Get your current account balance.',
      params: [
        { name: 'key', type: 'string', required: true, desc: 'Your API Key' },
        { name: 'action', type: 'string', required: true, desc: 'Set to "balance"' }
      ],
      successResponse: `{
  "balance": "100.84292",
  "currency": "USD"
}`
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const codeExample = `<?php
$api_url = "https://yourdomain.com/api/v2"; 
$api_key = "${apiKeyParam}"; 

function connect($data) {
    global $api_url;
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    $result = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) return $error;
    return json_decode($result, true);
}

// Example: Get Balance
$balance = connect([
    'key' => $api_key,
    'action' => 'balance'
]);

print_r($balance);
?>`;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => onNavigate("dashboard")}
        className="md:hidden flex items-center text-gray-600 hover:text-gray-900 mb-4 font-medium bg-white px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>

      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" /> System API
         </h1>
         <p className="text-gray-500 mt-2">Integrate our services directly into your own platform using our simple REST API. Note: API Key will be available in your profile settings later.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 border-b border-gray-200 p-4 font-semibold text-gray-800 flex items-center gap-2">
           <Code className="w-5 h-5 text-gray-500" /> PHP Example Connection Code
        </div>
        <div className="relative line-numbers">
           <button 
              onClick={() => handleCopy(codeExample, 'php-example')}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-black text-white p-2 rounded-md transition border border-gray-600"
              title="Copy Code"
           >
              {copiedScript === 'php-example' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
           </button>
           <pre className="p-6 bg-gray-900 text-gray-100 overflow-x-auto text-sm font-mono m-0" style={{ margin: 0, borderRadius: 0 }}>
             <code>{codeExample}</code>
           </pre>
        </div>
      </div>

      <div className="space-y-4">
         <h2 className="text-2xl font-bold text-gray-800 mb-4">API Endpoints</h2>
         {endpoints.map((ep) => (
           <div key={ep.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div 
               onClick={() => toggleEndpoint(ep.id)}
               className="p-4 bg-white cursor-pointer select-none hover:bg-gray-50 flex items-center justify-between"
             >
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-xs tracking-wider">{ep.method}</span>
                  <span className="font-bold text-gray-800">{ep.title}</span>
                </div>
                {expandedEndpoints[ep.id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
             </div>
             
             {expandedEndpoints[ep.id] && (
               <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-gray-600 mb-6">{ep.description}</p>
                  
                  <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">Parameters</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6 bg-white">
                      <table className="w-full text-left text-sm">
                         <thead>
                           <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                             <th className="p-3">Name</th>
                             <th className="p-3">Type</th>
                             <th className="p-3">Required</th>
                             <th className="p-3">Description</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {ep.params.map(param => (
                             <tr key={param.name}>
                               <td className="p-3 font-mono text-blue-600 font-medium">{param.name}</td>
                               <td className="p-3 text-gray-500">{param.type}</td>
                               <td className="p-3">
                                  {param.required ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Yes</span> : <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">No</span>}
                               </td>
                               <td className="p-3 text-gray-600">{param.desc}</td>
                             </tr>
                           ))}
                         </tbody>
                      </table>
                  </div>

                  <h4 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wide">Success Response</h4>
                  <div className="relative">
                     <button 
                        onClick={() => handleCopy(ep.successResponse, ep.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white transition bg-gray-800 rounded p-1.5"
                     >
                        {copiedScript === ep.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                     </button>
                     <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono m-0">
                       <code>{ep.successResponse}</code>
                     </pre>
                  </div>
               </div>
             )}
           </div>
         ))}
      </div>
    </motion.div>
  );
}
