import React, { useState } from 'react';
import { MessageSquare, X, SendHorizontal, Phone } from 'lucide-react';

export default function ChatDrawer({ isOpen, onClose, chats, setChats, activeChatId, setActiveChatId }) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const currentChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentChat) return;

    const userMsg = {
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = chats.map(c => {
      if (c.id === currentChat.id) {
        return {
          ...c,
          messages: [...c.messages, userMsg]
        };
      }
      return c;
    });

    setChats(updatedChats);
    setInputText('');

    // Trigger simulated reply if available
    if (currentChat.replies && currentChat.replyIndex < currentChat.replies.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyText = currentChat.replies[currentChat.replyIndex];
        const replyMsg = {
          sender: 'them',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChats(prevChats => prevChats.map(c => {
          if (c.id === currentChat.id) {
            return {
              ...c,
              messages: [...c.messages, replyMsg],
              replyIndex: c.replyIndex + 1
            };
          }
          return c;
        }));
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C160F]/40 backdrop-blur-xs flex justify-end">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="h-full w-full sm:w-[480px] bg-white shadow-2xl flex flex-col transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-amber-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-lg text-[#1C160F]">Active Negotiations</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-amber-50 flex items-center justify-center text-slate-400 hover:text-[#1C160F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Rooms Selector */}
        {chats.length > 0 && (
          <div className="flex gap-2 p-3 bg-amber-50/50 border-b border-amber-100 overflow-x-auto scrollbar-none shrink-0">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-colors ${
                  chat.id === currentChat.id
                    ? 'bg-amber-500 text-[#1C160F] border-amber-500 shadow-xs'
                    : 'bg-white text-slate-600 border-amber-100 hover:bg-amber-50'
                }`}
              >
                <img src={chat.participantAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="truncate max-w-[110px]">{chat.participantName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Active Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6]">
          {currentChat && (
            <>
              <div className="px-5 py-3 border-b border-amber-100 bg-white flex items-center gap-3 shrink-0">
                <img src={currentChat.participantAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-100" />
                <div>
                  <h4 className="font-bold text-xs text-[#1C160F]">{currentChat.participantName}</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online &amp; Negotiating
                  </span>
                </div>
              </div>

              {/* Messages History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {currentChat.messages.map((msg, idx) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-amber-500 text-[#1C160F] rounded-t-2xl rounded-l-2xl' 
                          : 'bg-[#F3ECE0] text-[#1C160F] rounded-t-2xl rounded-r-2xl'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <span>{currentChat.participantName.split(' ')[0]} is typing</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Form */}
              <div className="p-3 bg-white border-t border-amber-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-amber-500 bg-amber-50/20 text-[#1C160F]" 
                  />
                  <button 
                    type="submit" 
                    className="w-11 h-11 bg-[#1C160F] text-white hover:bg-amber-500 hover:text-[#1C160F] rounded-xl flex items-center justify-center transition-all shrink-0"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-2 text-center">
                  <a 
                    href={`https://wa.me/251911223344?text=${encodeURIComponent('Hi, inquiring about P2P package carriage terms.')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" /> Continue via WhatsApp direct link
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
