import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Sparkles, Brush, Volume2, VolumeX, BookOpen, Library, Users,
  User, Coffee, Beer, DoorClosed, DoorOpen, Wallet, ChevronRight, ChevronLeft,
  CheckCircle, Loader2, ArrowRight, Heart
} from 'lucide-react';
import authService from '../../services/authService';

const QUESTIONS = [
  {
    key: 'sleepSchedule',
    title: 'Sleep Schedule',
    subtitle: 'When do you usually go to bed and wake up?',
    options: [
      { value: 'early_bird', label: 'Early Bird', desc: 'I sleep early & wake early', icon: Sun, color: 'from-amber-400 to-orange-400' },
      { value: 'flexible', label: 'Flexible', desc: 'I can adapt to any schedule', icon: Sparkles, color: 'from-violet-400 to-purple-400' },
      { value: 'night_owl', label: 'Night Owl', desc: 'I stay up late & sleep in', icon: Moon, color: 'from-indigo-400 to-blue-500' },
    ],
  },
  {
    key: 'cleanliness',
    title: 'Cleanliness',
    subtitle: 'How tidy do you keep your living space?',
    options: [
      { value: 'very_tidy', label: 'Very Tidy', desc: 'Everything in its place', icon: Sparkles, color: 'from-emerald-400 to-green-500' },
      { value: 'moderate', label: 'Moderate', desc: 'Clean enough, not obsessive', icon: Brush, color: 'from-sky-400 to-blue-400' },
      { value: 'relaxed', label: 'Relaxed', desc: 'A bit messy is fine', icon: Coffee, color: 'from-amber-400 to-yellow-500' },
    ],
  },
  {
    key: 'noiseLevel',
    title: 'Noise Tolerance',
    subtitle: 'What noise level are you comfortable with?',
    options: [
      { value: 'quiet', label: 'Quiet', desc: 'Silence is golden', icon: VolumeX, color: 'from-slate-400 to-slate-500' },
      { value: 'moderate', label: 'Moderate', desc: 'Some background noise is OK', icon: Volume2, color: 'from-blue-400 to-indigo-400' },
      { value: 'lively', label: 'Lively', desc: 'Music, chatter — bring it on!', icon: Volume2, color: 'from-pink-400 to-rose-500' },
    ],
  },
  {
    key: 'studyHabits',
    title: 'Study Habits',
    subtitle: 'Where do you prefer to study?',
    options: [
      { value: 'in_room', label: 'In Room', desc: 'I study at my desk in the room', icon: BookOpen, color: 'from-violet-400 to-purple-500' },
      { value: 'mixed', label: 'Mixed', desc: 'Sometimes room, sometimes library', icon: Sparkles, color: 'from-cyan-400 to-teal-500' },
      { value: 'library', label: 'Library', desc: 'I always go to the library', icon: Library, color: 'from-amber-400 to-orange-400' },
    ],
  },
  {
    key: 'socialLevel',
    title: 'Social Style',
    subtitle: 'How social are you in your living space?',
    options: [
      { value: 'introvert', label: 'Introvert', desc: 'I prefer quiet alone time', icon: User, color: 'from-slate-400 to-gray-500' },
      { value: 'ambivert', label: 'Ambivert', desc: 'A healthy mix of both', icon: Users, color: 'from-teal-400 to-emerald-500' },
      { value: 'extrovert', label: 'Extrovert', desc: 'I love having people around', icon: Users, color: 'from-orange-400 to-red-400' },
    ],
  },
  {
    key: 'smoking',
    title: 'Smoking',
    subtitle: 'What is your stance on smoking?',
    options: [
      { value: 'no', label: 'No Smoking', desc: 'I don\'t smoke at all', icon: VolumeX, color: 'from-emerald-400 to-green-500' },
      { value: 'occasionally', label: 'Occasionally', desc: 'Social smoking only', icon: Coffee, color: 'from-amber-400 to-yellow-500' },
      { value: 'yes', label: 'Regular', desc: 'I smoke regularly', icon: Coffee, color: 'from-red-400 to-rose-500' },
    ],
  },
  {
    key: 'drinking',
    title: 'Drinking',
    subtitle: 'What is your stance on alcohol?',
    options: [
      { value: 'no', label: 'No Drinking', desc: 'I don\'t drink alcohol', icon: VolumeX, color: 'from-emerald-400 to-green-500' },
      { value: 'occasionally', label: 'Occasionally', desc: 'Social drinking only', icon: Beer, color: 'from-amber-400 to-yellow-500' },
      { value: 'yes', label: 'Regular', desc: 'I drink regularly', icon: Beer, color: 'from-red-400 to-rose-500' },
    ],
  },
  {
    key: 'guestPolicy',
    title: 'Guest Policy',
    subtitle: 'How do you feel about guests visiting?',
    options: [
      { value: 'no_guests', label: 'No Guests', desc: 'I prefer no visitors', icon: DoorClosed, color: 'from-slate-400 to-gray-500' },
      { value: 'occasional', label: 'Occasional', desc: 'Some friends over is fine', icon: DoorOpen, color: 'from-blue-400 to-indigo-400' },
      { value: 'open', label: 'Open Door', desc: 'Visitors are always welcome', icon: DoorOpen, color: 'from-green-400 to-emerald-500' },
    ],
  },
  {
    key: 'budget',
    title: 'Monthly Budget',
    subtitle: 'What is your budget range for rent?',
    options: [
      { value: 'low', label: 'Budget-Friendly', desc: 'Under LKR 15,000/month', icon: Wallet, color: 'from-emerald-400 to-green-500' },
      { value: 'moderate', label: 'Moderate', desc: 'LKR 15,000 – 25,000/month', icon: Wallet, color: 'from-blue-400 to-indigo-400' },
      { value: 'high', label: 'Premium', desc: 'Over LKR 25,000/month', icon: Wallet, color: 'from-violet-400 to-purple-500' },
    ],
  },
];

const RoommateQuestionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existingPrefs, setExistingPrefs] = useState(null);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const res = await authService.getPreferences();
        if (res.success && res.data) {
          setExistingPrefs(res.data);
          const prefAnswers = {};
          QUESTIONS.forEach((q) => { if (res.data[q.key]) prefAnswers[q.key] = res.data[q.key]; });
          setAnswers(prefAnswers);
        }
      } catch (e) { /* first time — no prefs */ }
    };
    loadExisting();
  }, []);

  const currentQ = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const selectOption = (value) => {
    setAnswers({ ...answers, [currentQ.key]: value });
    if (step < totalSteps - 1) {
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await authService.savePreferences(answers);
      navigate('/student/recommendations');
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = QUESTIONS.every((q) => answers[q.key]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-24 pt-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-primary-200">
            <Heart className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">Find Your Perfect Roommate</h1>
        <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
          Answer a few quick lifestyle questions and we'll match you with compatible students.
        </p>
        {existingPrefs && (
          <p className="text-primary-600 text-sm font-bold mt-2 bg-primary-50 px-4 py-1 rounded-full inline-block border border-primary-100">
            ✨ Updating your previous answers
          </p>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Question {step + 1} of {totalSteps}
          </span>
          <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{currentQ.title}</h2>
              <p className="text-slate-500 font-medium">{currentQ.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentQ.options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = answers[currentQ.key] === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => selectOption(opt.value)}
                    className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col items-center text-center gap-4 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-xl shadow-primary-100'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white shadow-lg ${isSelected ? 'scale-110' : ''} transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg mb-1">{opt.label}</p>
                      <p className="text-slate-500 text-sm font-medium">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-6 h-6 text-primary-600" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!answers[currentQ.key]}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors shadow-lg"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary-200 transition-all shadow-lg"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Find My Matches
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Step dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-primary-600 w-8' : answers[QUESTIONS[i].key] ? 'bg-primary-300' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoommateQuestionnaire;
