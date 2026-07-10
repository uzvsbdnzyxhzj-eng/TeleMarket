import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";
import { 
  Plus, X, MessageSquare, Clock, CheckCircle, Send, ChevronLeft, 
  Paperclip, Loader2, Sparkles, User, ShieldCheck, Image, FileText,
  AlertCircle, HelpCircle, ArrowRight, Check, CheckCheck
} from "lucide-react";
import { toast } from "react-hot-toast";

const CHAT_SUBJECTS_BN = [
  "বিকাশ/নগদ বা পেমেন্ট সমস্যা 💳",
  "টেলিগ্রাম অ্যাকাউন্ট কেনার সমস্যা 📱",
  "এসএমএম প্যানেল বা অর্ডার ডেলিভারি সমস্যা 🚀",
  "একাউন্ট বা সাবস্ক্রিপশন এক্টিভেশন ⚡",
  "অন্যান্য বা সাধারণ সাহায্য 🤝"
];

const CHAT_SUBJECTS_EN = [
  "Payment / Bkash / Nagad Issue 💳",
  "Buy Telegram Account Issue 📱",
  "SMM Service or Delivery Issue 🚀",
  "Account / Subscription Activation ⚡",
  "Other / General Support 🤝"
];

interface SupportTicketsProps {
  onBack?: () => void;
}

export default function SupportTickets({ onBack }: SupportTicketsProps) {
  const [lang, setLang] = useState<string>("bn");
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  
  // Create New Chat Mode
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  
  // Real-time message/input states
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto detect current language from HTML lang or fallback
  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    if (htmlLang === "en") {
      setLang("en");
      setSubject(CHAT_SUBJECTS_EN[0]);
    } else {
      setLang("bn");
      setSubject(CHAT_SUBJECTS_BN[0]);
    }
  }, []);

  // Fetch chats in real-time
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "tickets"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("lastUpdate", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
      
      // Keep active chat reference synchronized with latest real-time updates
      if (activeChat) {
        const updatedActive = chatList.find(c => c.id === activeChat.id);
        if (updatedActive) {
          setActiveChat(updatedActive);
        }
      }
    });
    return () => unsub();
  }, [activeChat?.id]);

  // Scroll to bottom whenever messages list or active chat changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, activeChat?.id]);

  // Synchronize read status in SupportTickets (User side)
  useEffect(() => {
    if (!auth.currentUser || !activeChat || !activeChat.id) return;
    
    // Check if there are any unread messages from the admin (Support)
    const hasUnreadFromAdmin = activeChat.messages?.some(
      (msg: any) => msg.senderName === "Support" && !msg.read
    );

    if (hasUnreadFromAdmin) {
      const updatedMessages = activeChat.messages.map((msg: any) => {
        if (msg.senderName === "Support" && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });

      // Update in Firestore
      const ticketRef = doc(db, "tickets", activeChat.id);
      updateDoc(ticketRef, {
        messages: updatedMessages,
        unreadByUser: false // Also clear the overall unread flag
      }).catch(err => console.error("Error marking messages read by user:", err));
    }
  }, [activeChat?.messages, activeChat?.id]);

  // Upload attachments helper
  const uploadFiles = async (fileList: FileList) => {
    const urls: string[] = [];
    const uid = auth.currentUser?.uid || "anon";
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileRef = ref(storage, `tickets/${uid}/${Date.now()}_${file.name}`);
      await uploadBytesResumable(fileRef, file);
      const url = await getDownloadURL(fileRef);
      urls.push(url);
    }
    return urls;
  };

  // Start new live support chat
  const handleStartChat = async () => {
    if (!auth.currentUser) return;
    if (!firstMessage.trim() && (!files || files.length === 0)) {
      toast.error(lang === "bn" ? "দয়া করে প্রথম বার্তা লিখুন বা কোনো ফাইল সিলেক্ট করুন!" : "Please write a first message or select a file!");
      return;
    }

    setIsLoading(true);
    try {
      let attachmentUrls: string[] = [];
      if (files && files.length > 0) {
        attachmentUrls = await uploadFiles(files);
      }

      const chatData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "Unknown",
        subject,
        status: "open", // Directly set to active open chat
        createdAt: Date.now(),
        lastUpdate: Date.now(),
        unreadByAdmin: true,
        unreadByUser: false,
        details: orderId.trim() ? { orderId: orderId.trim() } : {},
        messages: [{
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || "User",
          text: firstMessage,
          attachments: attachmentUrls,
          createdAt: Date.now(),
          read: false
        }]
      };

      const docRef = await addDoc(collection(db, "tickets"), chatData);
      toast.success(lang === "bn" ? "সাপোর্ট চ্যাট সেশন শুরু হয়েছে!" : "Support chat session started!");
      
      // Automatically open the newly created chat
      setActiveChat({ id: docRef.id, ...chatData });
      setShowNewChatModal(false);
      setFirstMessage("");
      setOrderId("");
      setFiles(null);
    } catch (e: any) {
      toast.error(lang === "bn" ? "চ্যাট শুরু করতে সমস্যা হয়েছে: " + e.message : "Failed to start chat: " + e.message);
    }
    setIsLoading(false);
  };

  // Send a reply in existing chat
  const handleSendReply = async () => {
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
          senderName: auth.currentUser.displayName || "User",
          text: replyMessage,
          attachments: attachmentUrls,
          createdAt: Date.now(),
          read: false
        }),
        status: "open", 
        lastUpdate: Date.now(),
        unreadByAdmin: true
      });
      setReplyMessage("");
      setReplyFiles(null);
    } catch (e: any) {
      toast.error(lang === "bn" ? "মেসেজ পাঠানো ব্যর্থ হয়েছে: " + e.message : "Failed to send message: " + e.message);
    }
    setIsUploading(false);
  };

  // Handle keydown Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Render attachments inside message bubbles
  const renderAttachments = (urls: string[]) => {
    if (!urls || urls.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {urls.map((url, idx) => {
          const isVid = url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") || url.includes(".avi");
          return isVid ? (
            <video 
              key={idx} 
              src={url} 
              controls 
              className="max-h-48 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm" 
            />
          ) : (
            <img 
              key={idx} 
              src={url} 
              alt="attachment" 
              className="max-h-48 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm cursor-pointer hover:opacity-95 object-cover transition" 
              onClick={() => window.open(url, "_blank")} 
            />
          );
        })}
      </div>
    );
  };

  // Mark unread messages as read when opening a chat
  const handleOpenChat = (chat: any) => {
    setActiveChat(chat);
    if (chat.unreadByUser) {
      updateDoc(doc(db, "tickets", chat.id), { unreadByUser: false });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[650px] relative">
      
      {/* Top Banner Status Info */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 px-4 py-3 text-white flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <p className="text-[11px] sm:text-xs font-extrabold tracking-wide font-sans">
            {lang === "bn" 
              ? "⚡ লাইভ কাস্টমার সাপোর্ট এজেন্ট সক্রিয় (গড় রিপ্লাই সময়: ৫ মিনিট)" 
              : "⚡ Live Customer Support Active (Average response: 5 mins)"}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Chat</span>
        </div>
      </div>

      {/* Main Dual-Panel Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR: Chat Threads List (Visible on desktop, hidden on mobile when activeChat is set) */}
        <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
            <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" />
              {lang === "bn" ? "আলাপচারিতা" : "Support Chats"}
            </h3>
            
            {/* Start Chat Button */}
            <button
              onClick={() => {
                setSubject(lang === "bn" ? CHAT_SUBJECTS_BN[0] : CHAT_SUBJECTS_EN[0]);
                setShowNewChatModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-extrabold cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 shadow-sm border-b-2 border-blue-800"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "bn" ? "নতুন চ্যাট" : "New Chat"}</span>
            </button>
          </div>

          {/* List of active threads */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {chats.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {lang === "bn" ? "কোনো চ্যাট সেশন নেই" : "No Chats Found"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto leading-normal">
                    {lang === "bn" 
                      ? "পেমেন্ট, অর্ডার ডেলিভারি অথবা যেকোনো সমস্যায় আমাদের সাথে সরাসরি কথা বলুন!" 
                      : "Start a chat for instant help with payments, orders, or activations!"}
                  </p>
                </div>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = activeChat?.id === chat.id;
                const lastMsg = chat.messages?.[chat.messages.length - 1];
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleOpenChat(chat)}
                    className={`w-full text-left p-3 rounded-2xl transition duration-200 flex items-start gap-3 border ${
                      isActive 
                        ? 'bg-blue-50/70 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 text-blue-950 dark:text-blue-200' 
                        : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                    } relative`}
                  >
                    {/* Unread dot */}
                    {chat.unreadByUser && (
                      <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
                    )}

                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      chat.status === "closed" 
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800" 
                        : "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                    }`}>
                      <MessageSquare className="w-4.5 h-4.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-[11px] truncate uppercase tracking-tight text-slate-400 dark:text-slate-500 font-sans">
                          ID: {chat.id.slice(0, 6)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {new Date(chat.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 leading-snug truncate">
                        {chat.subject}
                      </h4>
                      
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-1 leading-normal font-semibold">
                        {lastMsg?.senderName === "Support" ? "👤 Support: " : "You: "}
                        {lastMsg?.text || "Sent an attachment"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                          chat.status === "closed"
                            ? "bg-red-50 text-red-500 dark:bg-red-950/30"
                            : chat.status === "answered"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                        }`}>
                          {chat.status === "closed" 
                            ? (lang === "bn" ? "বন্ধ" : "Closed") 
                            : chat.status === "answered"
                            ? (lang === "bn" ? "রিপ্লাই করা হয়েছে" : "Answered")
                            : (lang === "bn" ? "পেন্ডিং" : "Active")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT AREA: Message Flow (Visible on desktop, full-width on mobile if activeChat is set) */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setActiveChat(null)} 
                    className="md:hidden p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-slate-800 dark:text-white leading-none">
                        {activeChat.subject}
                      </span>
                      {activeChat.details?.orderId && (
                        <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                          ID: {activeChat.details.orderId}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">
                      {lang === "bn" ? "অফিসিয়াল চ্যাট চ্যানেল" : "Official Support Channel"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    activeChat.status === "closed"
                      ? "bg-red-50 text-red-500 dark:bg-red-950/20"
                      : "bg-green-50 text-green-600 dark:bg-green-950/20"
                  }`}>
                    {activeChat.status === "closed" ? (lang === "bn" ? "সম্পন্ন" : "Closed") : (lang === "bn" ? "চলমান চ্যাট" : "Live Chat")}
                  </span>
                </div>
              </div>

              {/* Chat Messages Scrolling Window (WhatsApp style background) */}
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

                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3 flex gap-3 text-left shadow-sm max-w-lg mx-auto">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h6 className="text-[12px] font-black text-emerald-800 dark:text-emerald-300">
                      {lang === "bn" ? "🔒 অ্যান্ড-টু-অ্যান্ড ইনক্রিপ্টেড লাইভ চ্যাট" : "🔒 End-to-End Encrypted Support"}
                    </h6>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400/90 leading-relaxed font-bold">
                      {lang === "bn"
                        ? "আপনার সকল চ্যাট ও পেমেন্ট স্ক্রিনশট সম্পূর্ণ নিরাপদ। যেকোনো হেল্পের জন্য আপনার বার্তা নিচে লিখুন।"
                        : "Messages and calls are encrypted. Feel free to upload billing screenshots or specify issues below."}
                    </p>
                  </div>
                </div>

                {activeChat.messages?.map((msg: any, i: number) => {
                  const isUser = msg.senderId === auth.currentUser?.uid;
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${
                        isUser ? 'self-end ml-auto items-end' : 'self-start mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 px-1.5 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                        <span>{isUser ? (lang === "bn" ? "আপনি" : "You") : (lang === "bn" ? "সাপোর্ট এজেন্ট 👤" : "Support Agent 👤")}</span>
                      </div>
                      
                      <div className={`p-3.5 rounded-xl shadow-sm border relative ${
                        isUser 
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
                          {isUser && (
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

              {/* Chat Input Dock (WhatsApp style with prominent high-contrast border) */}
              <div className="p-3.5 bg-[#f0f2f5] dark:bg-[#1f2c34] border-t border-gray-300 dark:border-gray-800 shrink-0">
                {activeChat.status !== "closed" ? (
                  <div className="flex flex-col gap-2">
                    {replyFiles && replyFiles.length > 0 && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-[#e1fbc4] dark:bg-[#005c4b]/30 px-3 py-2 rounded-xl flex justify-between items-center border border-emerald-300/40 shadow-sm">
                        <span className="flex items-center gap-1.5">
                          <Image className="w-4 h-4 text-emerald-600" />
                          {replyFiles.length} {lang === "bn" ? "টি ফাইল সংযুক্ত" : "file(s) selected"}
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
                        placeholder={lang === "bn" ? "বার্তা লিখুন..." : "Type your message..."}
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a3942] rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:border-emerald-600 resize-none h-11 max-h-24 leading-normal transition font-medium text-gray-800 dark:text-white shadow-inner"
                      />
                      
                      <button 
                        onClick={handleSendReply} 
                        disabled={isUploading || (!replyMessage.trim() && (!replyFiles || replyFiles.length === 0))} 
                        className="bg-[#00a884] hover:bg-[#008f72] disabled:bg-gray-300 dark:disabled:bg-[#2a3942] text-white w-11 h-11 rounded-full font-bold transition flex items-center justify-center disabled:opacity-50 shrink-0 cursor-pointer shadow-md border-b-2 border-[#007f65]"
                      >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-center py-3 rounded-xl text-red-600 dark:text-red-400 font-extrabold text-xs shadow-sm">
                    🔒 {lang === "bn" ? "এই চ্যাট সেশনটি বন্ধ করা হয়েছে।" : "This support chat has been closed."}
                  </div>
                )}
              </div>
            </>
          ) : (
            // No active chat state placeholder
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20 dark:bg-slate-950/10">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang === "bn" ? "লাইভ সাপোর্ট চ্যাট বক্স" : "Live Chat Support Center"}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold mt-1">
                    {lang === "bn" 
                      ? "পেমেন্ট, কোর্স সমস্যা বা যেকোন জিজ্ঞাসায় সরাসরি আমাদের সাথে মেসেজ করতে বাম পাশের আলাপ তালিকা থেকে একটি চ্যাট সিলেক্ট করুন অথবা নিচে ক্লিক করে নতুন চ্যাট শুরু করুন।" 
                      : "Please select an existing chat session from the list or click below to start a direct message thread with our priority customer support desk."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubject(lang === "bn" ? CHAT_SUBJECTS_BN[0] : CHAT_SUBJECTS_EN[0]);
                    setShowNewChatModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-xs transition inline-flex items-center gap-2 cursor-pointer border-b-2 border-blue-800 shadow-md shadow-blue-500/15"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === "bn" ? "নতুন চ্যাট শুরু করুন" : "Start New Live Chat"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: START NEW CHAT FORM */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewChatModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-6 text-white relative">
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="inline-flex bg-white/15 p-2 rounded-2xl mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="text-lg font-black tracking-tight font-sans">
                  {lang === "bn" ? "নতুন লাইভ চ্যাট শুরু করুন" : "Start Live Support Chat"}
                </h3>
                <p className="text-white/80 text-[11px] font-semibold mt-1">
                  {lang === "bn" ? "আপনার ক্যাটাগরি বেছে নিন এবং প্রথম বার্তাটি লিখুন" : "Choose your helper topic and type your starting message."}
                </p>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                {/* Subject Selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    {lang === "bn" ? "চ্যাটের ক্যাটাগরি" : "Topic of Request"}
                  </label>
                  <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {(lang === "bn" ? CHAT_SUBJECTS_BN : CHAT_SUBJECTS_EN).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Order ID */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                    <span>{lang === "bn" ? "অর্ডার আইডি বা ট্রানজেকশন আইডি (ঐচ্ছিক)" : "Order or Transaction ID (Optional)"}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
                    placeholder="e.g. TXN92716492"
                  />
                </div>

                {/* Starting Message */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    {lang === "bn" ? "বার্তা / সমস্যার বিবরণ" : "Describe Your Issue"}
                  </label>
                  <textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-white min-h-[100px] resize-none font-semibold"
                    placeholder={lang === "bn" ? "কিভাবে আপনাকে সাহায্য করতে পারি লিখুন..." : "Hello, explain how our support staff can help you..."}
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span>{lang === "bn" ? "স্ক্রিনশট বা প্রুফ আপলোড করুন (ঐচ্ছিক)" : "Attach Screenshot or File (Optional)"}</span>
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer text-center"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleStartChat}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border-b-2 border-blue-800 shadow-md shadow-blue-500/10 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === "bn" ? "চ্যাট শুরু হচ্ছে..." : "Starting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "চ্যাট শুরু করুন" : "Start Live Chat"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
