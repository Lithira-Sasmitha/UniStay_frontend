import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShieldCheck, AlertTriangle, ShieldAlert, BadgeCheck } from 'lucide-react';
import incidentService from '../../services/incidentService';

const SafeRoommateSuggestion = ({ property }) => {
    const [safetyLevel, setSafetyLevel] = useState('review'); // safe, caution, review
    const [loading, setLoading] = useState(true);
    const [requestedIds, setRequestedIds] = useState([]);

    const rent = property?.rooms?.[0]?.monthlyRent || 0;
    const split2 = rent / 2;
    const split3 = rent / 3;

    useEffect(() => {
        const fetchSafety = async () => {
            try {
                if (property?._id) {
                    const res = await incidentService.getPropertySafety(property._id);
                    setSafetyLevel(res?.data?.level || 'review');
                }
            } catch (err) {
                console.error('Failed to load safety level:', err);
                setSafetyLevel('review');
            } finally {
                setLoading(false);
            }
        };
        fetchSafety();
    }, [property]);

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

    // Mock students as instructed
    const mockStudents = [
        { id: 1, name: 'Kasun Perera', university: 'NSBM Green University', gender: 'Male', budget: 'LKR 10,000 - 15,000' },
        { id: 2, name: 'Sanduni Fernando', university: 'University of Colombo', gender: 'Female', budget: 'LKR 12,000 - 18,000' },
        { id: 3, name: 'Dinuka Silva', university: 'SLIIT', gender: 'Male', budget: 'LKR 8,000 - 12,000' }
    ];

    if (!rent) return null;

    // HIDE COMPONENT AS PER USER REQUEST (DO NOT DELETE)
    return null;

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

                {/* Sample Roommates */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Suggested Compatibles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mockStudents.map(student => (
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
                                    onClick={() => handleRequestShare(student.id)}
                                    disabled={requestedIds.includes(student.id)}
                                    className={`w-full mt-2 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                                        requestedIds.includes(student.id)
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200'
                                    }`}
                                >
                                    {requestedIds.includes(student.id) ? (
                                        <>
                                            <BadgeCheck className="w-4 h-4" /> Request Sent
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
        </div>
    );
};

export default SafeRoommateSuggestion;
