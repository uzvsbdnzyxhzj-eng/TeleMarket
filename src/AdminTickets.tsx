import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./firebase";
import { Send, ChevronLeft, CheckCircle, Ticket, Filter, Paperclip, Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState<"all"|"new"|"open"|"answered"|"closed">("all");
  const [replyFiles, setReplyFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("lastUpdate", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

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
          senderName: "Support",
          text: replyMessage,
          attachments: attachmentUrls,
          createdAt: Date.now()
        }),
        status: "answered",
        lastUpdate: Date.now(),
        unreadByAdmin: false,
        unreadByUser: true
      });
      setReplyMessage("");
      setReplyFiles(null);
    } catch (e: any) {
      toast("Failed to send reply: " + e.message);
    }
    setIsUploading(false);
  };

  const handleCloseTicket = async () => {
    if (!viewingTicket) return;
    try {
        await updateDoc(doc(db, "tickets", viewingTicket.id), {
            status: "closed",
            lastUpdate: Date.now()
        });
        toast("Ticket closed.");
        setViewingTicket(null);
    } catch(e:any) {
        toast("Error: " + e.message);
    }
  };

  const filteredTickets = tickets.filter(t => filter === "all" ? true : t.status === filter || (filter === 'new' && t.status === 'open')); // new and open grouped

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-green-600 text-white";
      case "new": case "open": return "bg-gray-200 text-gray-700";
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
    if (viewingTicket.unreadByAdmin) {
        updateDoc(doc(db, "tickets", viewingTicket.id), { unreadByAdmin: false });
    }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <button onClick={() => setViewingTicket(null)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <ChevronLeft className="w-5 h-5" /> Back to List
            </button>
            <div className="flex items-center gap-3">
                <div className="font-bold text-gray-700">Ticket #{viewingTicket.id.slice(0, 6).toUpperCase()}</div>
                <button onClick={handleCloseTicket} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1">
                    Close Ticket
                </button>
            </div>
        </div>

        <div className="px-4 py-3 bg-gray-100 flex flex-col md:flex-row gap-4 justify-between border-b border-gray-200 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="font-bold">{viewingTicket.userEmail}</span></div>
            <div><span className="text-gray-500">Subject:</span> <span className="font-bold">{viewingTicket.subject}</span></div>
            {viewingTicket.details?.orderId && <div><span className="text-gray-500">Order:</span> <span className="font-bold">{viewingTicket.details.orderId} ({viewingTicket.details.requestType})</span></div>}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 h-[400px] overflow-y-auto flex flex-col gap-4">
            {viewingTicket.messages?.map((msg: any, i: number) => {
                const isAdmin = msg.senderId === auth.currentUser?.uid || msg.senderName === "Support";
                return (
                    <div key={i} className={`flex flex-col max-w-[90%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className="flex items-end gap-2 mb-1 px-1">
                            {isAdmin && <span className="font-bold text-xs text-gray-500">Support (You)</span>}
                            {!isAdmin && <span className="font-bold text-xs text-gray-500">User</span>}
                        </div>
                        <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
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
                    <div className="text-xs text-indigo-600 font-bold bg-indigo-50 p-2 rounded flex justify-between items-center">
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
                        placeholder="Type reply to user..."
                        className="flex-1 border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 resize-none h-[60px]"
                    />
                    <button onClick={handleReply} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition flex items-center justify-center h-[60px] disabled:opacity-50 gap-2">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Reply</>}
                    </button>
                </div>
            </div>
        ) : (
             <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 font-medium">
                Ticket Closed
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6 text-indigo-500" /> Support Tickets</h3>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(["all", "new", "answered", "closed"] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${filter === f ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        {f === 'new' ? 'New/Open' : f}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-bold text-gray-700 text-sm">ID</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">User</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Subject</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">No tickets found.</td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className={`hover:bg-gray-50 transition cursor-pointer ${t.unreadByAdmin ? "bg-blue-50/50" : ""}`} onClick={() => setViewingTicket(t)}>
                      <td className="p-4 text-gray-800 font-mono text-sm align-top">{t.id.slice(0, 6).toUpperCase()}</td>
                      <td className="p-4 align-top">
                        <div className="text-sm font-medium">{t.userEmail}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-indigo-600 font-bold flex items-center gap-2">
                           {t.subject}
                           {t.unreadByAdmin && <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getStatusColor(t.status)}`}>
                          {t.status === 'open' ? 'new' : t.status}
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
    </div>
  );
}
