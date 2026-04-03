import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Sparkles, Brush, Volume2, VolumeX, BookOpen, Library, Users,
  User, Coffee, Beer, DoorClosed, DoorOpen, Wallet, CheckCircle, Loader2,
  ArrowLeft, Save, Settings, ChevronRight, AlertCircle, Trash2, Edit3
} from 'lucide-react';
import authService from '../../services/authService';

const PREFERENCE_FIELDS = [
  {
    key: 'sleepSchedule',
    title: 'Sleep Schedule',
    subtitle: 'When do you usually go to bed and wake up?',
    icon: Moon,
    options: [
      { value: 'early_bird', label: 'Early Bird', desc: 'Sleep early & wake early', icon: Sun, gradient: 'from-amber-400 to-orange-500' },
      { value: 'flexible', label: 'Flexible', desc: 'Adapt to any schedule', icon: Sparkles, gradient: 'from-violet-400 to-purple-500' },
      { value: 'night_owl', label: 'Night Owl', desc: 'Stay up late & sleep in', icon: Moon, gradient: 'from-indigo-400 to-blue-600' },
    ],
  },
  {
    key: 'cleanliness',
    title: 'Cleanliness',
    subtitle: 'How tidy do you keep your living space?',
    icon: Brush,
    options: [
      { value: 'very_tidy', label: 'Very Tidy', desc: 'Everything in its place', icon: Sparkles, gradient: 'from-emerald-400 to-green-600' },
      { value: 'moderate', label: 'Moderate', desc: 'Clean enough, not obsessive', icon: Brush, gradient: 'from-sky-400 to-blue-500' },
      { value: 'relaxed', label: 'Relaxed', desc: 'A bit messy is fine', icon: Coffee, gradient: 'from-amber-400 to-yellow-500' },
    ],
  },
  {
    key: 'noiseLevel',
    title: 'Noise Tolerance',
    subtitle: 'What noise level are you comfortable with?',
    icon: Volume2,
    options: [
      { value: 'quiet', label: 'Quiet', desc: 'Silence is golden', icon: VolumeX, gradient: 'from-slate-400 to-slate-600' },
      { value: 'moderate', label: 'Moderate', desc: 'Some background noise', icon: Volume2, gradient: 'from-blue-400 to-indigo-500' },
      { value: 'lively', label: 'Lively', desc: 'Music, chatter — bring it!', icon: Volume2, gradient: 'from-pink-400 to-rose-500' },
    ],
  },
  {
    key: 'studyHabits',
    title: 'Study Habits',
    subtitle: 'Where do you prefer to study?',
    icon: BookOpen,
    options: [
      { value: 'in_room', label: 'In Room', desc: 'Study at my desk in the room', icon: BookOpen, gradient: 'from-violet-400 to-purple-600' },
      { value: 'mixed', label: 'Mixed', desc: 'Sometimes room, sometimes library', icon: Sparkles, gradient: 'from-cyan-400 to-teal-500' },
      { value: 'library', label: 'Library', desc: 'Always go to the library', icon: Library, gradient: 'from-amber-400 to-orange-500' },
    ],
  },
  {
    key: 'socialLevel',
    title: 'Social Style',
    subtitle: 'How social are you in your living space?',
    icon: Users,
    options: [
      { value: 'introvert', label: 'Introvert', desc: 'Prefer quiet alone time', icon: User, gradient: 'from-slate-400 to-gray-600' },
      { value: 'ambivert', label: 'Ambivert', desc: 'A healthy mix of both', icon: Users, gradient: 'from-teal-400 to-emerald-500' },
      { value: 'extrovert', label: 'Extrovert', desc: 'Love having people around', icon: Users, gradient: 'from-orange-400 to-red-500' },
    ],
  },
  {
    key: 'smoking',
    title: 'Smoking',
    subtitle: 'What is your stance on smoking?',
    icon: Coffee,
    options: [
      { value: 'no', label: 'No Smoking', desc: "Don't smoke at all", icon: VolumeX, gradient: 'from-emerald-400 to-green-600' },
      { value: 'occasionally', label: 'Occasionally', desc: 'Social smoking only', icon: Coffee, gradient: 'from-amber-400 to-yellow-500' },
      { value: 'yes', label: 'Regular', desc: 'Smoke regularly', icon: Coffee, gradient: 'from-red-400 to-rose-600' },
    ],
  },
  {
    key: 'drinking',
    title: 'Drinking',
    subtitle: 'What is your stance on alcohol?',
    icon: Beer,
    options: [
      { value: 'no', label: 'No Drinking', desc: "Don't drink alcohol", icon: VolumeX, gradient: 'from-emerald-400 to-green-600' },
      { value: 'occasionally', label: 'Occasionally', desc: 'Social drinking only', icon: Beer, gradient: 'from-amber-400 to-yellow-500' },
      { value: 'yes', label: 'Regular', desc: 'Drink regularly', icon: Beer, gradient: 'from-red-400 to-rose-600' },
    ],
  },
  {
    key: 'guestPolicy',
    title: 'Guest Policy',
    subtitle: 'How do you feel about guests visiting?',
    icon: DoorOpen,
    options: [
      { value: 'no_guests', label: 'No Guests', desc: 'Prefer no visitors', icon: DoorClosed, gradient: 'from-slate-400 to-gray-600' },
      { value: 'occasional', label: 'Occasional', desc: 'Some friends over is fine', icon: DoorOpen, gradient: 'from-blue-400 to-indigo-500' },
      { value: 'open', label: 'Open Door', desc: 'Visitors always welcome', icon: DoorOpen, gradient: 'from-green-400 to-emerald-500' },
    ],
  },
  {
    key: 'budget',
    title: 'Monthly Budget',
    subtitle: 'What is your budget range for rent?',
    icon: Wallet,
    options: [
      { value: 'low', label: 'Budget-Friendly', desc: 'Under LKR 15,000/month', icon: Wallet, gradient: 'from-emerald-400 to-green-600' },
      { value: 'moderate', label: 'Moderate', desc: 'LKR 15,000 – 25,000/month', icon: Wallet, gradient: 'from-blue-400 to-indigo-500' },
      { value: 'high', label: 'Premium', desc: 'Over LKR 25,000/month', icon: Wallet, gradient: 'from-violet-400 to-purple-600' },
    ],
  },
];

const StudentPreferencesPage = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({});
  const [existingPrefs, setExistingPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await authService.getPreferences();
        if (res.success && res.data) {
          setExistingPrefs(res.data);
          const existingAnswers = {};
          PREFERENCE_FIELDS.forEach((field) => {
            if (res.data[field.key]) existingAnswers[field.key] = res.data[field.key];
          });
          setPreferences(existingAnswers);
        }
      } catch (e) {
        // No existing preferences — first time
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleSelect = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSave = async () => {
    // Validate all fields are filled
    const missing = PREFERENCE_FIELDS.filter((f) => !preferences[f.key]);
    if (missing.length > 0) {
      setSaveError(`Please select your preference for: ${missing.map((m) => m.title).join(', ')}`);
      // Expand the first missing section
      setExpandedSection(missing[0].key);
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await authService.savePreferences(preferences);
      setSaveSuccess(true);
      setExistingPrefs({ ...preferences });
      // Auto-hide success message after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setPreferences({});
    setExistingPrefs(null);
    setSaveSuccess(false);
    setSaveError('');
  };

  const toggleSection = (key) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  const completedCount = PREFERENCE_FIELDS.filter((f) => preferences[f.key]).length;
  const totalCount = PREFERENCE_FIELDS.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-slate-500 font-semibold">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Student Preferences
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                {existingPrefs
                  ? 'Update your lifestyle preferences anytime'
                  : 'Set up your lifestyle preferences to help find your perfect match'}
              </p>
            </div>
          </div>

          {existingPrefs && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">Preferences Saved</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Completion Progress</p>
              <p className="text-xs text-slate-400 font-medium">{completedCount} of {totalCount} preferences set</p>
            </div>
          </div>
          <span className={`text-2xl font-black ${progress === 100 ? 'text-emerald-600' : 'text-primary-600'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-primary-400 to-indigo-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Preference Sections */}
      <motion.div variants={itemVariants} className="space-y-4 mb-8">
        {PREFERENCE_FIELDS.map((field, idx) => {
          const FieldIcon = field.icon;
          const isExpanded = expandedSection === field.key;
          const selectedValue = preferences[field.key];
          const selectedOption = field.options.find((o) => o.value === selectedValue);

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? 'border-primary-200 shadow-xl shadow-primary-50'
                  : selectedValue
                    ? 'border-emerald-100 shadow-sm hover:shadow-md'
                    : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(field.key)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    selectedValue
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'
                  }`}>
                    <FieldIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{field.title}</h3>
                      {selectedValue && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    {selectedOption ? (
                      <p className="text-sm font-semibold text-emerald-600 mt-0.5">
                        {selectedOption.label} — {selectedOption.desc}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 font-medium mt-0.5">
                        {field.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedValue && !isExpanded && (
                    <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-100">
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Expanded Options */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 md:px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {field.options.map((opt) => {
                          const OptIcon = opt.icon;
                          const isSelected = selectedValue === opt.value;
                          return (
                            <motion.button
                              key={opt.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelect(field.key, opt.value)}
                              className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-center text-center gap-3 ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-md'
                              }`}
                            >
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-white shadow-lg ${isSelected ? 'scale-110' : ''} transition-transform`}>
                                <OptIcon className="w-7 h-7" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-base mb-0.5">{opt.label}</p>
                                <p className="text-slate-500 text-xs font-medium">{opt.desc}</p>
                              </div>
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                  <CheckCircle className="w-5 h-5 text-primary-600" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Error / Success Messages */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700">{saveError}</p>
          </motion.div>
        )}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-emerald-700">Preferences saved successfully! Your profile has been updated.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || completedCount === 0}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${
            completedCount === totalCount
              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-primary-200 hover:scale-[1.02]'
              : 'bg-slate-900 text-white hover:bg-primary-600'
          } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {existingPrefs ? 'Update Preferences' : 'Save Preferences'}
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default StudentPreferencesPage;
