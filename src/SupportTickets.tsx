import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";
import { Plus, X, MessageSquare, Clock, CheckCircle, Ticket, Send, ChevronLeft, Paperclip, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const SUBJECTS = ["Buy Telegram account Problem", "Payment problem", "Sell Telegram account problem", "Other"];

interface SupportTicketsProps {
  onBack?: () => void;
}

export default function SupportTickets({ onBack }: SupportTicketsProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  // Reply State
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFiles, setReplyFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "tickets"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("lastUpdate", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

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

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    if (!message.trim() && (!files || files.length === 0)) {
      toast("Please enter a message or attach a file");
      return;
    }
    if (subject.includes("account") && !orderId.trim()) {
      toast("Please enter the Order ID");
      return;
    }

    setIsLoading(true);
    try {
      let attachmentUrls: string[] = [];
      if (files && files.length > 0) {
          attachmentUrls = await uploadFiles(files);
      }

      const ticketData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || "Unknown",
        subject,
        status: "new",
        createdAt: Date.now(),
        lastUpdate: Date.now(),
        unreadByAdmin: true,
        unreadByUser: false,
        details: subject.includes("account") ? { orderId } : {},
        messages: [{
          senderId: auth.currentUser.uid,
          senderName: "User",
          text: message,
          attachments: attachmentUrls,
          createdAt: Date.now()
        }]
      };

      await addDoc(collection(db, "tickets"), ticketData);
      toast("Ticket created successfully!");
      setActiveTab("list");
      setSubject(SUBJECTS[0]);
      setOrderId("");
      setMessage("");
      setFiles(null);
    } catch (e: any) {
      toast("Failed to create ticket: " + e.message);
    }
    setIsLoading(false);
  };

  const handleReply = async () => {
    if (!auth.currentUser || !viewingTicket) return;
    if (!replyMessage.trim() && (!replyFiles || replyFiles.length === 0)) return;
    
    setIsUploading(true);
    try {
      let attachmentUrls: string[] = [];
      if (replyFiles && replyFiles.length > 0) {
          attachmentUrls = await uploadFiles(replyFiles);
      }

      const ticketRef = doc(db, "tickets", viewingTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion({
          senderId: auth.currentUser.uid,
          senderName: "User",
          text: replyMessage,
          attachments: attachmentUrls,
          createdAt: Date.now()
        }),
        status: "open", 
        lastUpdate: Date.now(),
        unreadByAdmin: true
      });
      setReplyMessage("");
      setReplyFiles(null);
    } catch (e: any) {
      toast("Failed to send reply: " + e.message);
    }
    setIsUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-600 text-white";
      case "new": return "bg-gray-200 text-gray-700";
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
                      <video key={idx} src={url} controls className="max-h-40 rounded-lg border border-gray-200 shadow-sm" />
                  ) : (
                      <img key={idx} src={url} alt="attachment" className="max-h-40 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 object-cover" onClick={() => window.open(url, "_blank")} />
                  );
              })}
          </div>
      );
  };

  if (viewingTicket) {
    if (viewingTicket.unreadByUser) {
        updateDoc(doc(db, "tickets", viewingTicket.id), { unreadByUser: false });
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 mb-16 md:mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <button onClick={() => setViewingTicket(null)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <ChevronLeft className="w-5 h-5" /> Back to Tickets
            </button>
            <div className="font-bold text-gray-700">Ticket #{viewingTicket.id.slice(0, 6).toUpperCase()}</div>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 h-[400px] overflow-y-auto flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-900 mb-2">
                <div className="font-bold mb-1">Subject: {viewingTicket.subject}</div>
                {viewingTicket.details?.orderId && (
                    <>
                        <div>Order ID: {viewingTicket.details.orderId}</div>
                    </>
                )}
            </div>

            {viewingTicket.messages?.map((msg: any, i: number) => {
                const isUser = msg.senderId === auth.currentUser?.uid;
                return (
                    <div key={i} className={`flex flex-col max-w-[90%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className="flex items-end gap-2 mb-1 px-1">
                            {!isUser && <span className="font-bold text-xs text-gray-500">Support</span>}
                            {isUser && <span className="font-bold text-xs text-gray-500">You</span>}
                        </div>
                        <div className={`p-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                            {msg.text && <p className="whitespace-pre-wrap text-[15px]">{msg.text}</p>}
                            {renderAttachments(msg.attachments)}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                );
            })}
        </div>
        
        {viewingTicket.status !== "closed" ? (
            <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
                {replyFiles && replyFiles.length > 0 && (
                    <div className="text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded flex justify-between items-center">
                        {replyFiles.length} file(s) selected
                        <button onClick={() => setReplyFiles(null)}><X className="w-4 h-4" /></button>
                    </div>
                )}
                <div className="flex gap-2 items-end">
                    <label className="cursor-pointer bg-gray-100 p-3 rounded-xl hover:bg-gray-200 transition text-gray-600 self-stretch flex items-center justify-center">
                        <Paperclip className="w-5 h-5" />
                        <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e) => setReplyFiles(e.target.files)} />
                    </label>
                    <textarea 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-500 resize-none h-[60px]"
                    />
                    <button onClick={handleReply} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-bold transition flex items-center justify-center h-[60px] disabled:opacity-50">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 border-blue-600" />}
                    </button>
                </div>
            </div>
        ) : (
            <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 font-medium">
                This ticket has been closed.
            </div>
        )}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-6 mb-16 md:mb-6">
      <div className="bg-[#fdf3da] border border-[#f5e3bc] p-4 rounded-xl text-[#8b6508] mb-6 shadow-sm">
        <p className="font-medium text-sm sm:text-base">
          Our Support team will answer your ticket within 0-1 Hours max. Please don't create multiple tickets for the same issue.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-blue-50">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-4 text-center font-bold text-sm transition ${activeTab === "list" ? "bg-[#2AABEE] text-white" : "text-gray-600 hover:bg-blue-100"}`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-4 text-center font-bold text-sm transition ${activeTab === "new" ? "bg-gray-600 text-white" : "text-gray-600 hover:bg-blue-100"}`}
          >
            New Ticket
          </button>
        </div>

        {activeTab === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-bold text-gray-700">ID</th>
                  <th className="p-4 font-bold text-gray-700">Subject</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700">Last update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">No tickets found.</td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setViewingTicket(t)}>
                      <td className="p-4 text-gray-800 font-medium align-top">{t.id.slice(0, 6).toUpperCase()}</td>
                      <td className="p-4 align-top">
                        <div className="text-blue-500 font-bold hover:underline flex items-center gap-2">
                           {t.subject}
                           {t.unreadByUser && <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 align-top">
                        {new Date(t.lastUpdate).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-white">
            <div className="space-y-4 max-w-xl mx-auto">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                    <select 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE]"
                    >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {subject.includes("account") && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Order/Transaction ID</label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE] bg-white"
                                placeholder="Enter Order/Transaction ID..."
                            />
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2AABEE] h-32 resize-none"
                        placeholder="Describe your issue..."
                    />
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" /> Attachments (Images/Videos)
                    </label>
                    <input 
                       type="file" 
                       multiple 
                       accept="image/*,video/*"
                       onChange={(e) => setFiles(e.target.files)}
                       className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full bg-[#2AABEE] flex justify-center items-center gap-2 text-white font-bold py-3.5 rounded-lg shadow-sm hover:bg-blue-500 transition mt-4 disabled:opacity-50"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "SUBMIT NOW"}
                </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
