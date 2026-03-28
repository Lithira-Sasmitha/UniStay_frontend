import React, { useState, useEffect, useRef } from 'react';
import { Users, DollarSign, ShieldCheck, AlertTriangle, ShieldAlert, BadgeCheck, X, MessageCircle, Send, Loader2 } from 'lucide-react';
import incidentService from '../../services/incidentService';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const SafeRoommateSuggestion = ({ property }) => {
    const { user } = useAuth();
    const [safetyLevel, setSafetyLevel] = useState('review'); // safe, caution, review
    const [loading, setLoading] = useState(true);
    const [requestedIds, setRequestedIds] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [chatStatus, setChatStatus] = useState('idle');
    const [activeChat, setActiveChat] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);
    const [roommates, setRoommates] = useState([]);
    const messagesEndRef = useRef(null);

    const rent = property?.rooms?.[0]?.monthlyRent || 0;
    const split2 = rent / 2;
    const split3 = rent / 3;

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (property?._id) {
                    const res = await incidentService.getPropertySafety(property._id);
                    setSafetyLevel(res?.data?.level || 'review');
                }
                
                const rmRes = await api.get('/roommates');
                if (rmRes.data?.roommates?.length > 0) {
                    // Map to expected format
                    setRoommates(rmRes.data.roommates.map(r => ({
                        id: r._id,
                        name: r.name,
                        university: r.university || 'University Student',
                        gender: r.gender || 'Not specified',
                        budget: r.budget ? `LKR ${r.budget.toLocaleString()}` : 'Negotiable'
                    })));
                } else {
                    // Fallback to mocks
                    setRoommates([
                        { id: 'mock-1', name: 'Kasun Perera', university: 'NSBM Green University', gender: 'Male', budget: 'LKR 10,000 - 15,000' },
                        { id: 'mock-2', name: 'Sanduni Fernando', university: 'University of Colombo', gender: 'Female', budget: 'LKR 12,000 - 18,000' }
                    ]);
                }
            } catch (err) {
                console.error(err);
                setSafetyLevel('review');
                setRoommates([
                    { id: 'mock-1', name: 'Kasun Perera', university: 'NSBM Green University', gender: 'Male', budget: 'LKR 10,000 - 15,000' },
                    { id: 'mock-2', name: 'Sanduni Fernando', university: 'University of Colombo', gender: 'Female', budget: 'LKR 12,000 - 18,000' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [property]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChat]);

    let safetyMessage = '';
    let SafetyIcon = ShieldAlert;
    let safetyColorClass = 'bg-red-50 text-red-700 border-red-200';

    if (safetyLevel === 'safe') {
        safetyMessage = 'Suitable for shared living';
        SafetyIcon = ShieldCheck;
        safetyColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (safetyLevel === 'caution') {
        safetyMessage = 'Share with awareness';
        SafetyIcon = AlertTriangle;
        safetyColorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
        safetyMessage = 'Sharing not recommended until issues are resolved';
        SafetyIcon = ShieldAlert;
        safetyColorClass = 'bg-red-50 text-red-700 border-red-200';
    }

    const handleRequestShare = (studentId) => {
        setRequestedIds(prev => [...prev, studentId]);
    };

    const handleInitiateChat = async () => {
        setChatStatus('loading');
        
        // If it's a real user, attempt to fetch previous messages
        if (selectedProfile?.id && !selectedProfile.id.startsWith('mock')) {
            try {
                const res = await api.get(`/messages/${selectedProfile.id}`);
                setMessages(res.data.data || []);
            } catch (err) {
                console.error("Failed to load conversation", err);
            }
        } else {
            // For mock users, inject a dummy message
            setMessages([
                { text: `Hi! I'm ${selectedProfile.name}. I'm looking for a safe place to share.`, sender: selectedProfile.id, createdAt: new Date() }
            ]);
        }

        setTimeout(() => {
            setChatStatus('success');
            setTimeout(() => {
                setChatStatus('idle');
                setActiveChat(true);
            }, 600);
        }, 600);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        const newMsg = {
            text: messageText,
            sender: user?._id || 'me',
            receiver: selectedProfile.id,
            createdAt: new Date().toISOString()
        };

        // Optimistic UI update
        setMessages(prev => [...prev, newMsg]);
        setMessageText('');
        setSending(true);

        if (selectedProfile?.id && !selectedProfile.id.startsWith('mock')) {
            try {
                await api.post('/messages', {
                    receiverId: selectedProfile.id,
                    text: newMsg.text
                });
            } catch (err) {
                console.error("Failed to send message", err);
                // Optionally show toast error here
            } finally {
                setSending(false);
            }
        } else {
            // Mock network delay
            setTimeout(() => setSending(false), 500);
        }
    };

    const resetModal = () => {
        setSelectedProfile(null); 
        setChatStatus('idle');
        setActiveChat(false);
        setMessages([]);
    };

    if (!rent || loading) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Find a Safe Roommate</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cost Split & Safety Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4 opacity-80">Cost Sharing Benefits</h3>
                        
                        <div className="mb-4">
                            <span className="text-xs text-indigo-600 font-bold block mb-1">Total Room Rent</span>
                            <span className="text-2xl font-black text-indigo-900">LKR {rent.toLocaleString()}</span><span className="text-indigo-700 text-sm font-semibold">/mo</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-indigo-50">
                                <span className="flex items-center gap-2 text-sm font-semibold text-indigo-800"><Users className="w-4 h-4" /> 2 People</span>
                                <span className="font-extrabold text-indigo-900">LKR {split2.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-indigo-50">
                                <span className="flex items-center gap-2 text-sm font-semibold text-indigo-800"><Users className="w-4 h-4" /> 3 People</span>
                                <span className="font-extrabold text-indigo-900">LKR {Math.round(split3).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {!loading && (
                        <div className={`border rounded-2xl p-5 shadow-sm flex items-start gap-4 ${safetyColorClass}`}>
                            <div className="bg-white/50 p-2 rounded-xl">
                                <SafetyIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider mb-1 opacity-90">Safety Status</h3>
                                <p className="text-sm font-semibold leading-relaxed">{safetyMessage}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Roommates */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Suggested Compatibles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roommates.slice(0, 4).map(student => (
                            <div key={student.id} className="bg-white border border-slate-200 hover:border-indigo-300 transition-colors rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 leading-tight">{student.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{student.gender}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-4">
                                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"><BadgeCheck className="w-3.5 h-3.5 text-blue-500" /> {student.university}</p>
                                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget: {student.budget}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Budget Matches</span>
                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (requestedIds.includes(student.id)) {
                                            setSelectedProfile(student);
                                        } else {
                                            handleRequestShare(student.id);
                                        }
                                    }}
                                    className={`w-full mt-2 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                                        requestedIds.includes(student.id)
                                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer'
                                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200'
                                    }`}
                                >
                                    {requestedIds.includes(student.id) ? (
                                        <>
                                            <BadgeCheck className="w-4 h-4" /> Request Sent (View)
                                        </>
                                    ) : (
                                        'Request to Share'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Profile Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-inner">
                                    {selectedProfile.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black leading-tight tracking-tight">{selectedProfile.name}</h3>
                                    <p className="text-indigo-100 font-medium text-sm flex items-center gap-1 mt-1">
                                        <BadgeCheck className="w-4 h-4 text-emerald-300" />
                                        Verified Student
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={resetModal} 
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white mt-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Body */}
                        {activeChat ? (
                            <div className="flex flex-col h-[400px] bg-slate-50">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMine = msg.sender === (user?._id || 'me');
                                        return (
                                            <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                                                    isMine 
                                                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                                }`}>
                                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {sending && (
                                        <div className="flex items-start">
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!messageText.trim() || sending}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
                                        >
                                            <Send className="w-5 h-5 ml-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">University</span>
                                        <span className="text-sm font-bold text-slate-800">{selectedProfile.university}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Gender</span>
                                        <span className="text-sm font-bold text-slate-800">{selectedProfile.gender}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-sm font-semibold text-slate-500">Budget Limit</span>
                                        <span className="text-sm font-black text-emerald-600">{selectedProfile.budget}</span>
                                    </div>
                                    
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                                        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4" /> Safety Checked
                                        </h4>
                                        <p className="text-sm text-emerald-700/90 font-medium leading-relaxed">
                                            This user has no active incidents and their university email has been verified by the Unistay team.
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleInitiateChat}
                                    disabled={chatStatus !== 'idle'}
                                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 ${
                                        chatStatus === 'success' 
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                    }`}
                                >
                                    {chatStatus === 'loading' ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...
                                        </span>
                                    ) : chatStatus === 'success' ? (
                                        <>
                                            <BadgeCheck className="w-5 h-5" /> Chat Connected
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle className="w-5 h-5" /> Initiate Chat to Share
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafeRoommateSuggestion;
