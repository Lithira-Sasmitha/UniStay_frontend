import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Image as ImageIcon,
  User,
  Building,
  ChevronRight,
  Loader2,
  Calendar,
  FileText
} from 'lucide-react';
import incidentService from '../../services/incidentService';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

const IncidentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                const res = await incidentService.getIncidentById(id);
                setIncident(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load incident details');
            } finally {
                setLoading(false);
            }
        };
        fetchIncident();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Retrieving Case File...</p>
            </div>
        );
    }

    if (error || !incident) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <div className="bg-rose-50 text-rose-600 p-6 rounded-[2rem] border border-rose-100 mb-6">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-2xl font-black mb-2">Access Denied</h2>
                    <p className="font-medium">{error || 'Incident file not found.'}</p>
                </div>
                <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    const timeline = [
        { 
            label: 'Incident Opened', 
            date: incident.createdAt, 
            status: 'completed',
            icon: Clock,
            desc: `Reported by ${incident.student.name}`
        },
        { 
            label: 'Investigation Started', 
            date: incident.investigationStartedAt, 
            status: incident.investigationStartedAt ? 'completed' : 'pending',
            icon: Shield,
            desc: 'Admin has acknowledged and started review'
        },
        { 
            label: 'Owner Response', 
            date: incident.ownerRespondedAt, 
            status: incident.ownerRespondedAt ? 'completed' : 'pending',
            icon: MessageSquare,
            desc: 'Property owner has submitted their statement'
        },
        { 
            label: 'Resolved', 
            date: incident.resolvedAt, 
            status: incident.resolvedAt ? 'completed' : 'pending',
            icon: CheckCircle2,
            desc: 'Final resolution reached and closed'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header Navigation */}
            <div className="flex items-center gap-4 mb-10">
                <button onClick={() => navigate(-1)} className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-all border border-slate-200 shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{incident.title}</h1>
                        <StatusBadge status={incident.status} />
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        Case ID: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg">#{incident._id.slice(-8).toUpperCase()}</span>
                        • Reported on {format(new Date(incident.createdAt), 'PPP')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description & Evidence */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-500" /> Incident Description
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                            {incident.description}
                        </p>

                        {incident.photoUrl && (
                            <div>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Gallery</h4>
                                <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner group">
                                    <img 
                                        src={incident.photoUrl} 
                                        alt="Evidence" 
                                        className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Resolution & Responses */}
                    <section className="space-y-6">
                        {incident.ownerResponse ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary-50/50 border border-primary-100 rounded-[2.5rem] p-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary-500 p-3 rounded-2xl text-white shadow-lg shadow-primary-200">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 mb-1">Owner Response</h3>
                                        <p className="text-xs text-primary-600 font-bold uppercase tracking-widest mb-3">
                                            Submitted on {format(new Date(incident.ownerRespondedAt), 'PPP')}
                                        </p>
                                        <p className="text-slate-700 font-medium leading-relaxed italic">
                                            "{incident.ownerResponse}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 border-dashed flex flex-col items-center justify-center text-center">
                                <Building className="w-8 h-8 text-slate-300 mb-3" />
                                <p className="text-slate-400 font-bold">Awaiting boarding owner statement...</p>
                            </div>
                        )}

                        {incident.adminNotes && (
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/10 p-3 rounded-2xl">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black mb-1">Admin Investigation Notes</h3>
                                        <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-4">Official Determination</p>
                                        <p className="text-slate-300 font-medium leading-relaxed">
                                            {incident.adminNotes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Lifecycle Timeline */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Clock className="w-20 h-20" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-8 relative z-10 flex items-center gap-2">
                             Lifecycle Timeline
                        </h3>
                        
                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

                            {timeline.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = step.status === 'completed';
                                return (
                                    <div key={idx} className={`relative pl-12 transition-all duration-500 ${!isCompleted ? 'opacity-40 grayscale' : ''}`}>
                                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center z-10 border-2 transition-all duration-500 ${
                                            isCompleted ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-200 scale-110' : 'bg-white border-slate-100 text-slate-300'
                                        }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm mb-0.5 ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                {step.label}
                                            </p>
                                            {step.date ? (
                                                <p className="text-[10px] font-black uppercase text-primary-500 tracking-tighter mb-1">
                                                    {format(new Date(step.date), 'MMM dd, HH:mm')}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter mb-1 font-mono">
                                                    Pending Process
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 font-medium leading-tight">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Property & Student Info */}
                    <section className="space-y-4">
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Involved Property</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                                    {incident.property.photos?.[0]?.url ? (
                                        <img src={incident.property.photos[0].url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-900 truncate">{incident.property.name}</p>
                                    <p className="text-xs font-bold text-slate-400 truncate flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {incident.property.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Complainant</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                                    {incident.student.name[0]}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">{incident.student.name}</p>
                                    <p className="text-xs font-bold text-slate-500">{incident.student.email}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailPage;
