import fs from 'fs';

const newChatBot = `import { useState, useRef, useEffect } from "react";
import { Bot, User, X, Send } from "lucide-react";

const FAQS = [
  { q: "How to buy an account?", a: "To buy an account, navigate to the 'Buy' section, select your desired country, and click the Buy button. Make sure you have enough balance!" },
  { q: "How to add funds?", a: "You can add funds via Crypto (Binance/USDT), bKash, or Nagad. Click on 'Top Up' or your balance at the top of the screen to get started." },
  { q: "Is delivery automatic?", a: "Yes! Our custom bot system ensures instant automatic delivery right after your purchase." },
  { q: "How to contact admin?", a: "You can contact our live support via WhatsApp at +8801644627304 or click the WhatsApp HelpLine in the dashboard." }
];

export default function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { role: "bot", text: "Hello! I am the TeleMarket Support Bot. How can I help you today?" },
    ];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setInput("");
    const currentMsgs = [...messages, { role: "user", text: text.trim() }];
    // @ts-ignore
    setMessages(currentMsgs);

    // Look for exact FAQ match
    const matchedFaq = FAQS.find(f => f.q.toLowerCase() === text.trim().toLowerCase());
    
    if (matchedFaq) {
      setTimeout(() => {
        // @ts-ignore
        setMessages(prev => [...prev, { role: "bot", text: matchedFaq.a }]);
      }, 500);
      return;
    }

    try {
      // Small delay for realism before fallback
      setTimeout(() => {
        // @ts-ignore
        setMessages(prev => [...prev, { role: "bot", text: "Thanks for your message! If you need specific help, please try one of the options below, or contact human support via WhatsApp at +8801644627304." }]);
      }, 600);
    } catch (e) {
      // @ts-ignore
      setMessages(prev => [...prev, { role: "bot", text: "I'm having trouble thinking right now. Please try again later or contact Support on WhatsApp: 01644627304" }]);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[80] overflow-hidden flex flex-col" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))', height: '500px', maxHeight: '75vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-[#2AABEE] text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">TeleMarket Support</h3>
            <p className="text-[10px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 bg-opacity-50 flex flex-col">
        {messages.map((msg, idx) => (
          <div key={idx} className={\`flex max-w-[85%] \${msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"}\`}>
            <div className={\`p-3 rounded-2xl text-sm \${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"}\`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Suggestion Chips */}
        <div className="mt-auto pt-4 space-y-2">
          {FAQS.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(faq.q)}
              className="block w-full text-left bg-white hover:bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-3 text-sm font-medium transition cursor-pointer shadow-sm"
            >
              {faq.q}
            </button>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border bg-gray-50 border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/ChatBot.tsx', newChatBot);
console.log('Fixed chatBot');
