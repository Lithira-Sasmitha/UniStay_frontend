import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ShieldAlert, AlertTriangle, ShieldCheck, FileText, ArrowLeft,
    TrendingUp, TrendingDown, Minus, Clock, MapPin, CheckCircle, XCircle
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import SafetyAssistantChat from '../../components/common/SafetyAssistantChat';

export default function SafetyDecisionHub() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/safety/'+id+'/decision')
            .then(res => setData(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Intelligence...</div>;
    if (!data) return <div className="flex h-screen items-center justify-center font-bold text-red-500">Failed to load property intelligence.</div>;

    const { propertyName, safetyStatus, reasons, riskTrend, insightMessage, sharedLiving, recommendation, timeline } = data;

    const getStatusColors = (status) => {
        if (status === 'Safe') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'Caution') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getStatusIcon = (status) => {
        if (status === 'Safe') return <ShieldCheck className="w-12 h-12 text-green-600" />;
        if (status === 'Caution') return <AlertTriangle className="w-12 h-12 text-amber-600" />;
        return <ShieldAlert className="w-12 h-12 text-red-600" />;
    };

    const getTrendIcon = (trend) => {
        if (trend === 'Increasing') return <TrendingUp className="w-6 h-6 text-red-500" />;
        if (trend === 'Improving') return <TrendingDown className="w-6 h-6 text-green-500" />;
        return <Minus className="w-6 h-6 text-amber-500" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Nav */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Property
                </button>

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-slate-900">Safety Decision Hub</h1>
                    <p className="text-slate-500 text-lg flex items-center gap-2 font-medium">
                        <MapPin className="w-5 h-5" /> {propertyName}
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Safety Status */}
                    <div className={"col-span-1 md:col-span-2 rounded-3xl p-8 border-2 flex flex-col items-center justify-center text-center " + getStatusColors(safetyStatus)}>
                        {getStatusIcon(safetyStatus)}
                        <h2 className="text-3xl font-black mt-4 mb-2 uppercase tracking-wide">{safetyStatus}</h2>
                        <p className="font-bold opacity-80 max-w-lg">Based on our advanced risk analysis and real-time incident tracking.</p>
                    </div>

                    {/* 2. Explainable Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
                        <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-800">
                            <FileText className="w-6 h-6 text-blue-500" /> Why this status?
                        </h3>
                        <ul className="space-y-3 font-semibold text-slate-600 mt-2">
                            {reasons.length > 0 ? reasons.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-blue-600">&bull;</span> {r}
                                </li>
                            )) : (
                                <li className="flex items-center gap-3 bg-green-50 p-3 rounded-xl text-green-700 border border-green-100">
                                    <CheckCircle className="w-5 h-5"/> No active concerns or recent severe incidents.
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* 3 & 4. Risk Trend & Insight */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 justify-between">
                        <div>
                            <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-800 mb-4">
                                {getTrendIcon(riskTrend)} Risk Trend: {riskTrend}
                            </h3>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <p className="font-bold text-slate-700 leading-relaxed text-lg">"{insightMessage}"</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Shared Living Suggestion */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
                        <div className="absolute -right-10 -top-10 bg-indigo-500 opacity-20 w-40 h-40 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            ?? Shared Living Insight
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Total Rent</p>
                                <p className="text-3xl font-black">Rs. {sharedLiving.rent.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Per Person (Split)</p>
                                <p className="text-3xl font-black">Rs. {sharedLiving.perPerson.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center justify-center text-center">
                                <p className={"font-bold text-lg " + (recommendation.variant === 'danger' ? 'text-red-300' : 'text-green-300')}>
                                    {sharedLiving.safetyMessage}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 6. AI Chat (Floating / Embedded) */}
                    <SafetyAssistantChat propertyId={id} propertyName={propertyName} />

                    {/* 7. Timeline */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-extrabold flex items-center gap-2 text-slate-800 mb-6">
                            <Clock className="w-6 h-6 text-slate-400" /> Recent Incident Timeline
                        </h3>
                        <div className="space-y-4">
                            {timeline.length > 0 ? timeline.map(inc => (
                                <div key={inc.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100">
                                    <div className="w-32 flex-shrink-0 text-sm font-bold text-slate-500">
                                        {new Date(inc.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex-1 font-bold text-slate-800">{inc.title}</div>
                                    <div className="flex items-center gap-3">
                                        <span className={"px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider " + (inc.severity==='High'?'bg-red-100 text-red-600':inc.severity==='Medium'?'bg-amber-100 text-amber-600':'bg-slate-200 text-slate-600')}>
                                            {inc.severity}
                                        </span>
                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 capitalize">
                                            {inc.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 font-bold p-4 text-center">No recent incidents recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* 8. Final Decision Box */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                        <div className={"rounded-3xl p-10 text-center border-4 " + 
                            (recommendation.variant === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 
                             recommendation.variant === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-900' : 
                             'bg-green-50 border-green-500 text-green-900')
                        }>
                            <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-3">Final Recommendation</p>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-4">
                                {recommendation.variant === 'danger' ? <XCircle className="w-10 h-10 md:w-14 md:h-14"/> : 
                                 recommendation.variant === 'warning' ? <AlertTriangle className="w-10 h-10 md:w-14 md:h-14"/> : 
                                 <CheckCircle className="w-10 h-10 md:w-14 md:h-14"/>}
                                {recommendation.text}
                            </h2>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}


