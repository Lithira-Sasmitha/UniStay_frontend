import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../services/api';

const SafetyAssistantChat = ({ propertyId, propertyName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            text: `Hi! I'm the Safety Assistant. Ask me anything about the safety, risks, or incident history of ${propertyName || 'this property'}.`,
            sender: 'assistant',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message
        const userMsg = { text: text.trim(), sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await api.post('/safety/chat', {
                propertyId,
                message: text.trim()
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    text: response.data.data.message,
                    sender: 'assistant',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                text: "Sorry, I'm having trouble retrieving safety data right now. Please try again later.",
                sender: 'assistant',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickReply = (text) => {
        handleSendMessage(text);
    };

    const QUICK_QUESTIONS = [
        "Is this place safe?",
        "Why is it under review?",
        "What issues reported?"
    ];

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-50 flex items-center justify-center"
                    aria-label="Open Safety Assistant"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <ShieldAlert className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Safety Assistant</h3>
                                <p className="text-xs text-emerald-100 opacity-90">Powered by Incident Data</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="bg-transparent hover:bg-white/20 text-white p-1.5 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto max-h-80 min-h-[16rem] flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.sender === 'user' 
                                        ? 'bg-emerald-600 text-white rounded-br-none' 
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div className="bg-white border-t border-slate-100 p-2 overflow-x-auto flex gap-2 hide-scrollbar whitespace-nowrap px-4 py-3">
                        {QUICK_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickReply(q)}
                                disabled={isLoading}
                                className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                            className="flex-1 bg-slate-100 text-sm outline-none border-none rounded-full px-4 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                            onClick={() => handleSendMessage(inputValue)}
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SafetyAssistantChat;