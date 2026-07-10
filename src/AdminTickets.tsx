import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";
import { 
  Send, ChevronLeft, CheckCircle, Ticket, Filter, Paperclip, 
  Loader2, X, Search, MessageSquare, AlertCircle, Trash2, ShieldAlert, Sparkles, Check, CheckCheck, Image
} from "lucide-react";
import { toast } from "react-hot-toast";

const QUICK_REPLIES = [
  "আসসালামু আলাইকুম, আপনার পেমেন্টটি সফলভাবে রিসিভ করা হয়েছে! 💳",
  "আপনার অর্ডারটি প্রসেসিং-এ রয়েছে। ৫-১০ মিনিটের মধ্যে এক্টিভেট হয়ে যাবে। ⚡",
  "দয়া করে আপনার বিকাশ/নগদ পেমেন্ট নম্বর এবং ট্রানজেকশন আইডি দিন। 🕵️",
  "আপনার জেমিনি সাবস্ক্রিপশনটি সফলভাবে এক্টিভেট করা হয়েছে। ধন্যবাদ! 🌟",
  "আপনার ভার্চুয়াল নম্বরের ওটিপি (OTP) ওপরে আপডেট করা হয়েছে। চেক করুন। 📱",
  "আমাদের সাথে থাকার জন্য ধন্যবাদ! আর কোনো সমস্যা থাকলে আমাদের জানাবেন। 😊"
];

export default function AdminTickets() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  
  // Filtering & Searching
  const [filter, setFilter] = useState<"all" | "pending" | "answered" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real-time reply states
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all user support chat sessions in real-time
  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("lastUpdate", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
      
      // Update currently active chat reference to display new messages as they arrive
      if (activeChat) {
        const updatedActive = chatList.find(c => c.id === activeChat.id);
        if (updatedActive) {
          setActiveChat(updatedActive);
        }
      }
    });
    return () => unsub();
  }, [activeChat?.id]);

  // Scroll active chat messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, activeChat?.id]);

  // Synchronize read status in AdminTickets (Admin side)
  useEffect(() => {
    if (!auth.currentUser || !activeChat || !activeChat.id) return;
    
    // Check if there are any unread messages from the User
    const hasUnreadFromUser = activeChat.messages?.some(
      (msg: any) => msg.senderName !== "Support" && !msg.read
    );

    if (hasUnreadFromUser) {
      const updatedMessages = activeChat.messages.map((msg: any) => {
        if (msg.senderName !== "Support" && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });

      // Update in Firestore
      const ticketRef = doc(db, "tickets", activeChat.id);
      updateDoc(ticketRef, {
        messages: updatedMessages,
        unreadByAdmin: false // Also clear overall flag
      }).catch(err => console.error("Error marking messages read by Admin:", err));
    }
  }, [activeChat?.messages, activeChat?.id]);

  // Handle uploading files (images, proofs, docs, etc.)
  const uploadFiles = async (fileList: FileList) => {
    const urls: string[] = [];
    const uid = auth.currentUser?.uid || "admin";
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileRef = ref(storage, `tickets/admin_${uid}/${Date.now()}_${file.name}`);
      await uploadBytesResumable(fileRef, file);
      const url = await getDownloadURL(fileRef);
      urls.push(url);
    }
    return urls;
  };

  // Reply to active chat
  const handleReply = async () => {
    if (!auth.currentUser || !activeChat) return;
    if (!replyMessage.trim() && (!replyFiles || replyFiles.length === 0)) return;
    
    setIsUploading(true);
    try {
      let attachmentUrls: string[] = [];
      if (replyFiles && replyFiles.length > 0) {
        attachmentUrls = await uploadFiles(replyFiles);
      }

      const ticketRef = doc(db, "tickets", activeChat.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion({
          senderId: auth.currentUser.uid,
          senderName: "Support",
          text: replyMessage,
          attachments: attachmentUrls,
          createdAt: Date.now(),
          read: false
        }),
        status: "answered",
        lastUpdate: Date.now(),
        unreadByAdmin: false,
        unreadByUser: true // Trigger red pulse dot on user's dashboard!
      });
      setReplyMessage("");
      setReplyFiles(null);
    } catch (e: any) {
      toast.error("Failed to send reply: " + e.message);
    }
    setIsUploading(false);
  };

  // Pre-fill / instantly send quick replies
  const handleUseQuickReply = (text: string) => {
    setReplyMessage(text);
  };

  // Close / Resolve Chat Session
  const handleCloseChat = async () => {
    if (!activeChat) return;
    try {
      await updateDoc(doc(db, "tickets", activeChat.id), {
        status: "closed",
        lastUpdate: Date.now(),
        unreadByAdmin: false,
        unreadByUser: true
      });
      toast.success("Support Chat resolved and closed.");
    } catch (e: any) {
      toast.error("Error closing chat: " + e.message);
    }
  };

  // Reopen resolved Chat Session
  const handleReopenChat = async () => {
    if (!activeChat) return;
    try {
      await updateDoc(doc(db, "tickets", activeChat.id), {
        status: "open",
        lastUpdate: Date.now(),
        unreadByAdmin: false,
        unreadByUser: true
      });
      toast.success("Support Chat reopened.");
    } catch (e: any) {
      toast.error("Error reopening chat: " + e.message);
    }
  };

  // Enter to send reply
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  // Mark chat as read for admin
  const handleOpenChat = (chat: any) => {
    setActiveChat(chat);
    if (chat.unreadByAdmin) {
      updateDoc(doc(db, "tickets", chat.id), { unreadByAdmin: false });
    }
  };

  // Filtered Chats list based on tab & search query
  const filteredChats = chats.filter((c) => {
    // Status Filter
    const matchStatus = 
      filter === "all" ? true :
      filter === "pending" ? (c.status === "open" || c.status === "new") :
      c.status === filter;

    if (!matchStatus) return false;

    // Search query
    if (searchQuery.trim() === "") return true;
    const s = searchQuery.toLowerCase();
    
    const emailMatch = c.userEmail?.toLowerCase().includes(s);
    const subjectMatch = c.subject?.toLowerCase().includes(s);
    const idMatch = c.id?.toLowerCase().includes(s);
    const orderMatch = c.details?.orderId?.toLowerCase().includes(s);
    
    // Check inside message text
    const msgMatch = c.messages?.some((m: any) => m.text?.toLowerCase().includes(s));

    return emailMatch || subjectMatch || idMatch || orderMatch || msgMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-600 text-white";
      case "new": case "open": return "bg-amber-500 text-white";
      case "closed": return "bg-red-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const renderAttachments = (urls: string[]) => {
    if (!urls || urls.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {urls.map((url, idx) => {
          const isVid = url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") || url.includes(".avi");
          return isVid ? (
            <video key={idx} src={url} controls className="max-h-40 rounded-xl border border-gray-200 shadow-sm" />
          ) : (
            <img 
              key={idx} 
              src={url} 
              alt="attachment" 
              className="max-h-40 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-95 object-cover" 
              onClick={() => window.open(url, "_blank")} 
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[650px] relative">
      
      {/* Top Console Title Banner */}
      <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <h3 className="font-extrabold text-sm uppercase tracking-widest font-sans flex items-center gap-1.5">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Support Chat Center Console
          </h3>
        </div>
        <div className="text-xs font-bold text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          Total Active: {chats.filter(c => c.status !== "closed").length}
        </div>
      </div>

      {/* Main Split Console Interface */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT COLUMN: Support Queue list & Filters */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50 shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Quick Filters */}
          <div className="p-3 bg-white border-b border-gray-100 space-y-2">
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              {(["all", "pending", "answered", "closed"] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1 px-1 text-[10px] font-black uppercase rounded-md tracking-wider transition ${
                    filter === f 
                      ? "bg-white shadow-sm text-indigo-600 font-extrabold" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "pending" ? "Active" : f}
                </button>
              ))}
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder="Search user, ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Active Queue listing */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredChats.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-2 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-bold">No active chat sessions found</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = activeChat?.id === chat.id;
                const lastMsg = chat.messages?.[chat.messages.length - 1];
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenChat(chat)}
                    className={`w-full text-left p-3.5 rounded-2xl transition duration-150 flex items-start gap-3 border ${
                      isActive 
                        ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' 
                        : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-800 shadow-sm'
                    } relative`}
                  >
                    {/* Unread dot from User */}
                    {chat.unreadByAdmin && (
                      <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-[10px] truncate uppercase tracking-tight text-gray-400 font-mono">
                          ID: {chat.id.slice(0, 6)}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">
                          {new Date(chat.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-xs text-gray-900 truncate max-w-[150px]">
                        {chat.userEmail || "Anonymous User"}
                      </h4>
                      
                      <p className="text-[11px] text-gray-500 font-bold truncate leading-snug mt-0.5">
                        {chat.subject}
                      </p>

                      <p className="text-[10px] text-gray-400 truncate mt-1">
                        {lastMsg?.senderName === "Support" ? "👤 Admin: " : "👤 User: "}
                        {lastMsg?.text || "Sent an attachment"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          chat.status === "closed"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : chat.status === "answered"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {chat.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel */}
        <div className={`flex-1 flex flex-col bg-gray-50 relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Active Chat Meta Info Header */}
              <div className="px-5 py-3 bg-white border-b border-gray-150 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-gray-900 leading-none">
                        {activeChat.userEmail}
                      </h4>
                      <span className="font-mono text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
                        UID: {activeChat.userId?.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-600 font-extrabold mt-1 leading-none">
                      Subject: {activeChat.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Order ID tracking if available */}
                  {activeChat.details?.orderId && (
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold text-[10px] px-2 py-1 rounded-xl">
                      Order/TX: {activeChat.details.orderId}
                    </span>
                  )}
                  
                  {activeChat.status !== "closed" ? (
                    <button
                      onClick={handleCloseChat}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm shadow-red-500/10"
                    >
                      <X className="w-3.5 h-3.5" /> Resolve Chat
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenChat}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Reopen Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages flow area (WhatsApp style background) */}
              <div 
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                style={{
                  backgroundColor: "var(--wa-bg, #efeae2)",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.16 0 6-2.51 6-6s-2.84-6-6-6-6 2.51-6 6 2.84 6 6 6zm-.5 17c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm-.5 35c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM19 70c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm51-34c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-3-22c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm7 5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM40 5c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM9 56c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0-20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0-30C4.97 6 2 8.97 2 13s2.97 7 7 7 7-2.97 7-7-2.97-7-7-7zm0 10c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm11 35c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm15 15c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm3-15c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm34-31c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm0-20c4.03 0 7 2.97 7 7s-2.97 7-7 7-7-2.97-7-7 2.97-7 7-7zm0 10c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm12 55c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-20 4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM3 80c.828 0 1.5-.672 1.5-1.5S3.828 77 3 77s-1.5.672-1.5 1.5S2.172 80 3 80zm74 0c.828 0 1.5-.672 1.5-1.5S77.828 77 77 77s-1.5.672-1.5 1.5.672 1.5 1.5 1.5zM2 47c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm16-16c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm43 36c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm17-17c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {/* Custom styling variables injected on current feed container */}
                <style dangerouslySetInnerHTML={{ __html: `
                  .dark [style*="--wa-bg"] { --wa-bg: #0b141a !important; }
                ` }} />

                {activeChat.messages?.map((msg: any, i: number) => {
                  const isAdmin = msg.senderId === auth.currentUser?.uid || msg.senderName === "Support";
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${
                        isAdmin ? 'self-end ml-auto items-end' : 'self-start mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 px-1.5 text-[9px] font-black uppercase text-gray-500 tracking-wider">
                        <span>{isAdmin ? "You (Support)" : "User"}</span>
                      </div>
                      
                      <div className={`p-3.5 rounded-xl shadow-sm border relative ${
                        isAdmin 
                          ? 'bg-[#d9fdd3] dark:bg-[#005c4b] border-[#cbf0c5] dark:border-[#024e40] text-[#303030] dark:text-[#f1f3f4] rounded-tr-none' 
                          : 'bg-white dark:bg-[#202c33] border-gray-100 dark:border-[#2d3a43] text-[#303030] dark:text-[#f1f3f4] rounded-tl-none'
                      }`}>
                        {msg.text && (
                          <p className="whitespace-pre-wrap text-[13.5px] font-medium leading-relaxed select-text tracking-wide">
                            {msg.text}
                          </p>
                        )}
                        {renderAttachments(msg.attachments)}

                        {/* Time & Read indicator embedded beautifully in the bubble corner like WA */}
                        <div className="flex items-center justify-end gap-1 mt-1.5 -mb-1 ml-auto text-[9px] font-bold text-gray-500/80 dark:text-gray-400/80">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isAdmin && (
                            msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Template Replies chips panel with solid higher-contrast borders */}
              {activeChat.status !== "closed" && (
                <div className="px-4 py-3 bg-[#f0f2f5] dark:bg-[#1f2c34] border-t border-gray-300 dark:border-gray-800 shrink-0">
                  <div className="flex items-center gap-1 mb-2 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#00a884]" />
                    Quick Responses (Bengali)
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                    {QUICK_REPLIES.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUseQuickReply(qr)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 dark:bg-[#2a3942] dark:hover:bg-[#374955] border-2 border-gray-300 dark:border-gray-700 hover:border-emerald-500 text-[10px] text-gray-700 dark:text-gray-200 hover:text-emerald-700 font-extrabold rounded-full transition whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
                      >
                        {qr.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Send Reply dock (WhatsApp style with prominent high-contrast border) */}
              <div className="p-3.5 bg-[#f0f2f5] dark:bg-[#1f2c34] border-t border-gray-300 dark:border-gray-800 shrink-0">
                {activeChat.status !== "closed" ? (
                  <div className="flex flex-col gap-2">
                    {replyFiles && replyFiles.length > 0 && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-[#e1fbc4] dark:bg-[#005c4b]/30 px-3 py-2 rounded-xl flex justify-between items-center border border-emerald-300/40 shadow-sm">
                        <span className="flex items-center gap-1.5">
                          <Image className="w-4 h-4 text-emerald-600" />
                          {replyFiles.length} file(s) selected for upload
                        </span>
                        <button onClick={() => setReplyFiles(null)} className="hover:text-red-500 cursor-pointer p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <label className="cursor-pointer bg-white dark:bg-[#2a3942] hover:bg-gray-100 dark:hover:bg-[#374955] p-3 rounded-full transition text-gray-600 dark:text-gray-300 flex items-center justify-center border border-gray-300 dark:border-gray-700 w-11 h-11 shrink-0 shadow-sm">
                        <Paperclip className="w-5 h-5" />
                        <input 
                          type="file" 
                          className="hidden" 
                          multiple 
                          accept="image/*,video/*" 
                          onChange={(e) => setReplyFiles(e.target.files)} 
                        />
                      </label>
                      
                      <textarea 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type reply or click a quick response above..."
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a3942] rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:border-emerald-600 resize-none h-11 max-h-24 leading-normal transition font-medium text-gray-800 dark:text-white shadow-inner"
                      />
                      
                      <button 
                        onClick={handleReply} 
                        disabled={isUploading || (!replyMessage.trim() && (!replyFiles || replyFiles.length === 0))}
                        className="bg-[#00a884] hover:bg-[#008f72] disabled:bg-gray-300 dark:disabled:bg-[#2a3942] text-white w-11 h-11 rounded-full font-bold transition flex items-center justify-center disabled:opacity-50 shrink-0 cursor-pointer shadow-md border-b-2 border-[#007f65]"
                      >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-center py-3 rounded-xl text-red-600 dark:text-red-400 font-extrabold text-xs shadow-sm">
                    🔒 This support chat has been resolved and closed. Reopen to reply.
                  </div>
                )}
              </div>
            </>
          ) : (
            // Active Chat placeholder
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="max-w-md space-y-3">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                    No active chat selected
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                    Choose a user's direct chat session from the queue list on the left to start real-time messaging, review user details, attach files, or use quick Bengali answers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
