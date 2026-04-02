import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Shield, Info, Loader2, Sparkles, Bot } from 'lucide-react';
import api from '../../services/api';

const SafetyAssistantChat = ({ propertyId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I am your UniStay Safety Assistant. Ask me anything about this property's safety records.", sender: 'assistant' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    const suggestions = [
        "Is this property safe?",
        "Why is this under review?",
        "What issues were reported?"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text = input) => {
        const messageText = text || input;
        if (!messageText.trim() || loading) return;

        setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/safety/chat', { 
                propertyId, 
                message: messageText 
            });
            
            setMessages(prev => [...prev, { 
                text: data.data.message, 
                sender: 'assistant' 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                text: "Sorry, I am unable to connect to my case files at the moment. Please try again later.", 
                sender: 'assistant' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className="absolute bottom-20 right-0 w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-500 p-2.5 rounded-2xl">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-tight">Safety Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always Active</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 rounded-[1.5rem] text-[13px] font-medium leading-relaxed ${
                                        msg.sender === 'user' 
                                            ? 'bg-primary-600 text-white shadow-lg rounded-tr-none' 
                                            : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Consulting Data...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer / Input */}
                        <div className="p-6 bg-white border-t border-slate-100">
                             {/* Suggestions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(s)}
                                        className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-2 rounded-full border border-primary-100/50 hover:bg-primary-100 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your safety concern..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-12 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-300 transition-all outline-none"
                                />
                                <button 
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-200"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
                                <Sparkles className="w-3 h-3 text-amber-500" /> Powered by UniStay AI Governance
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                >
                    {/* Pulsing ring background */}
                    <div className="absolute -inset-2 bg-primary-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                    
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="relative bg-gradient-to-br from-primary-500 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(79,70,229,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(79,70,229,1)] transition-all group border-2 border-white/50"
                    >
                        {/* Bot Icon with Sparkles */}
                        <div className="relative">
                            <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all" />
                        </div>

                        {/* Status Dot */}
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default SafetyAssistantChat;
