import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Loader2, User as UserIcon, Mail, Phone, MapPin,
  GraduationCap, RefreshCw, ArrowLeft, Sparkles, ShieldCheck,
  Moon, Sun, Brush, Volume2, BookOpen, Users, Coffee, Beer,
  DoorOpen, Wallet, ChevronDown, ChevronUp, Building, Star,
  Wifi, Droplets, Wind, Tv, Award, Check
} from 'lucide-react';
import authService from '../../services/authService';
import ContactModal from '../../components/modals/ContactModal';

const CATEGORY_META = {
  sleepSchedule: { label: 'Sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
  cleanliness: { label: 'Clean', icon: Brush, color: 'bg-emerald-100 text-emerald-600' },
  noiseLevel: { label: 'Noise', icon: Volume2, color: 'bg-pink-100 text-pink-600' },
  studyHabits: { label: 'Study', icon: BookOpen, color: 'bg-violet-100 text-violet-600' },
  socialLevel: { label: 'Social', icon: Users, color: 'bg-orange-100 text-orange-600' },
  smoking: { label: 'Smoking', icon: Coffee, color: 'bg-red-100 text-red-600' },
  drinking: { label: 'Drinking', icon: Beer, color: 'bg-amber-100 text-amber-600' },
  guestPolicy: { label: 'Guests', icon: DoorOpen, color: 'bg-blue-100 text-blue-600' },
  budget: { label: 'Budget', icon: Wallet, color: 'bg-teal-100 text-teal-600' },
};

const LABEL_MAP = {
  early_bird: 'Early Bird', night_owl: 'Night Owl', flexible: 'Flexible',
  very_tidy: 'Very Tidy', moderate: 'Moderate', relaxed: 'Relaxed',
  quiet: 'Quiet', lively: 'Lively',
  in_room: 'In Room', library: 'Library', mixed: 'Mixed',
  introvert: 'Introvert', ambivert: 'Ambivert', extrovert: 'Extrovert',
  no: 'No', occasionally: 'Occasionally', yes: 'Yes',
  no_guests: 'No Guests', occasional: 'Occasional', open: 'Open Door',
  low: 'Budget', high: 'Premium',
};

const BUDGET_LABELS = {
  low: 'Under LKR 15,000/mo',
  moderate: 'LKR 10,000 — 25,000/mo',
  high: 'LKR 20,000+/mo',
};

const FACILITY_ICONS = {
  'AC': Wind, 'Wi-Fi': Wifi, 'Hot Water': Droplets, 'TV': Tv,
  'Fan': Wind, 'Study Table': BookOpen, 'Wardrobe': DoorOpen,
  'Attached Bath': Droplets, 'Mini Fridge': Building, 'Mini Kitchen': Building,
  'Shared Bathroom': Droplets,
};

const RoommateRecommendations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roommates');
  const [matches, setMatches] = useState([]);
  const [boardings, setBoardings] = useState([]);
  const [budgetLabel, setBudgetLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [boardingsLoading, setBoardingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getMatches();
      if (res.success) {
        setMatches(res.matches || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardings = async () => {
    setBoardingsLoading(true);
    try {
      const res = await authService.getRecommendedBoardings();
      if (res.success) {
        setBoardings(res.boardings || []);
        setBudgetLabel(BUDGET_LABELS[res.budget] || '');
      }
    } catch (err) {
      console.error('Failed to load boardings:', err);
    } finally {
      setBoardingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchBoardings();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-400 to-green-500';
    if (score >= 60) return 'from-blue-400 to-indigo-500';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const BADGE_COLORS = {
    gold: 'from-amber-400 to-yellow-500',
    silver: 'from-slate-300 to-slate-400',
    bronze: 'from-orange-400 to-amber-500',
    unverified: 'from-slate-200 to-slate-300',
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-24 pt-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-primary-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                AI Matched
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">Your Recommendations</h1>
            <p className="text-slate-500 font-medium text-lg">
              Roommates & boardings tailored to your lifestyle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/questionnaire')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/student')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary-600 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('roommates')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'roommates' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Roommates ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('boardings')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'boardings' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          Boardings ({boardings.length})
        </button>
      </div>

      {/* ======== ROOMMATES TAB ======== */}
      {activeTab === 'roommates' && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Calculating compatibility...</p>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-red-50 rounded-[3rem] border-2 border-dashed border-red-200">
              <p className="text-2xl font-black text-slate-900 mb-2">Oops!</p>
              <p className="text-slate-500 font-medium mb-6">{error}</p>
              <button onClick={() => navigate('/student/questionnaire')} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold">
                Take the Questionnaire
              </button>
            </motion.div>
          ) : matches.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Matches Yet</h3>
              <p className="text-slate-500 font-medium mb-6">No other verified students have completed the questionnaire yet.</p>
            </motion.div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              {matches.map((match, index) => {
                const student = match.student;
                const isExpanded = expandedId === student._id;
                return (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-6">
                        <div className="text-center shrink-0">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getScoreColor(match.compatibility)} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                            #{index + 1}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-50 shadow-sm">
                            {student.profileImage ? (
                              <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserIcon className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-900 truncate">{student.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>{student.faculty || 'Student'}</span>
                              <span>·</span>
                              <span>{student.year || ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{student.hometown || 'Anywhere'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`text-3xl font-black bg-gradient-to-br ${getScoreColor(match.compatibility)} bg-clip-text text-transparent`}>
                            {match.compatibility}%
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {getScoreLabel(match.compatibility)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => setMessageTarget({ id: student._id, name: student.name })}
                          className="flex-1 py-3 bg-primary-600 text-white rounded-2xl font-bold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-100"
                        >
                          <Mail className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : student._id)}
                          className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-6 md:px-8 pb-8 border-t border-slate-50 pt-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compatibility Breakdown</p>
                            <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                              {Object.entries(match.breakdown).map(([cat, info]) => {
                                const meta = CATEGORY_META[cat];
                                const Icon = meta.icon;
                                return (
                                  <div key={cat} className="text-center">
                                    <div className={`w-12 h-12 mx-auto rounded-2xl ${meta.color} flex items-center justify-center mb-2 ${info.score === 10 ? 'ring-2 ring-emerald-300 ring-offset-2' : info.score === 5 ? 'ring-2 ring-amber-300 ring-offset-2' : 'opacity-40'}`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-wide">{meta.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{LABEL_MAP[info.theirs] || info.theirs}</p>
                                    <p className={`text-[9px] font-black mt-1 ${info.score === 10 ? 'text-emerald-600' : info.score === 5 ? 'text-amber-600' : 'text-red-400'}`}>
                                      {info.score === 10 ? '✓ Match' : info.score === 5 ? '~ Close' : '✗ Diff'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-6">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="font-bold">{student.email}</span>
                              </div>
                              {student.phonenumber && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <span className="font-bold">{student.phonenumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ======== BOARDINGS TAB ======== */}
      {activeTab === 'boardings' && (
        <>
          {budgetLabel && (
            <div className="flex items-center gap-3 mb-8 bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-indigo-900 font-bold">
                Showing boardings matching your budget: <span className="text-indigo-600">{budgetLabel}</span>
              </p>
            </div>
          )}

          {boardingsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Finding boardings...</p>
            </div>
          ) : boardings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Building className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Boardings Found</h3>
              <p className="text-slate-500 font-medium">No verified boardings match your budget range right now.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              {boardings.map((item, index) => (
                <motion.div
                  key={item.property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                >
                  {/* Property Header */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${BADGE_COLORS[item.property.trustBadge] || BADGE_COLORS.unverified} flex items-center justify-center text-white shadow-md`}>
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {item.property.trustBadge} Verified
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                          {item.property.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate font-medium">{item.property.address}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-primary-600">
                          {item.availableSlots}
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slots Free</p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                      {item.property.description}
                    </p>
                  </div>

                  {/* Rooms */}
                  <div className="px-6 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Rooms</p>
                    <div className="space-y-2">
                      {item.rooms.map((room) => (
                        <div key={room._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{room.roomType}</p>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {room.facilities.slice(0, 3).map((f) => (
                                <span key={f} className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                  {f}
                                </span>
                              ))}
                              {room.facilities.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400">+{room.facilities.length - 3}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-lg font-black text-primary-600">LKR {room.monthlyRent.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400">{room.availableSlots}/{room.totalCapacity} slots</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-2">
                    <button
                      onClick={() => navigate(`/listings/${item.property._id}`)}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Building className="w-4 h-4" />
                      View Full Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Message Modal */}
      <ContactModal
        isOpen={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        receiverId={messageTarget?.id}
        receiverName={messageTarget?.name}
        receiverRole="student"
      />
    </div>
  );
};

export default RoommateRecommendations;
