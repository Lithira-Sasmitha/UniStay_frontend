import React, { useState, useRef } from 'react';
import { ShieldAlert, AlertTriangle, UploadCloud, Info, CheckCircle2, ChevronDown, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['Theft', 'Harassment', 'Infrastructure', 'Medical', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High'];

const DUMMY_DATA = {
  category: 'Harassment',
  severity: 'High',
  description:
    'A fellow resident was verbally harassed by an unknown individual near the common kitchen area on the 2nd floor at approximately 9:30 PM. The incident was witnessed by two other residents.',
};

const SEVERITY_STYLES = {
  Low: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60 shadow-[0_4px_15px_rgba(16,185,129,0.15)] ring-emerald-500',
  Medium: 'text-amber-700 bg-amber-50/80 border-amber-200/60 shadow-[0_4px_15px_rgba(245,158,11,0.15)] ring-amber-500',
  High: 'text-rose-700 bg-rose-50/80 border-rose-200/60 shadow-[0_4px_15px_rgba(244,63,94,0.15)] ring-rose-500',
};

const ReportSafetyPage = () => {
  const [form, setForm] = useState({
    category: '',
    severity: '',
    description: '',
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImageName('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fillDummy = () => {
    setForm((prev) => ({ ...prev, ...DUMMY_DATA }));
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = 'Please select an incident category.';
    if (!form.severity) newErrors.severity = 'Please select a severity level.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    else if (form.description.trim().length < 20)
      newErrors.description = 'Description must be at least 20 characters.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setForm({ category: '', severity: '', description: '', image: null });
    setErrors({});
    setImageName('');
    setImagePreview(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SUCCESS STATE VIEW
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-6 text-slate-800">
        <div className="fixed inset-0 z-0 bg-slate-50 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 via-slate-50 to-indigo-100/50 opacity-100"></div>
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-emerald-300/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-5000"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-300/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-7000"></div>
        </div>

        <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-8 text-center transform transition-all animate-in fade-in zoom-in duration-500">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-emerald-200/50 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-tr from-emerald-400 to-emerald-500 text-white w-full h-full rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.35)]">
              <ShieldCheck className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Report Received</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for helping keep our community safe. Our security team has been notified and will review your report immediately.
          </p>
          
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100/60 mb-8 text-left space-y-3 backdrop-blur-md">
             <div className="flex justify-between items-center pb-3 border-b border-slate-100/80">
              <span className="text-slate-500 text-sm font-medium">Category</span>
              <span className="text-slate-800 font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-sm">{form.category}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500 text-sm font-medium">Severity</span>
              <span className={"text-xs font-bold px-3 py-1.5 rounded-full border " + SEVERITY_STYLES[form.severity]}>
                 {form.severity}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
          >
            Submit Another Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0 bg-slate-50 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-rose-50/80 opacity-100"></div>
        <div className="absolute top-[10%] left-[-5%] w-[45%] h-[45%] bg-indigo-300/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-10000"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[55%] h-[55%] bg-rose-200/40 rounded-full blur-[140px] mix-blend-multiply animate-pulse duration-7000"></div>
        <div className="absolute top-[30%] left-[50%] w-[35%] h-[35%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-8000"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 text-rose-500 bg-white backdrop-blur-md rounded-2xl mb-5 border border-rose-100 shadow-xl shadow-rose-200/40 relative">
            <div className="absolute inset-0 bg-rose-500/10 rounded-2xl animate-ping opacity-20"></div>
            <ShieldAlert className="w-8 h-8 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 drop-shadow-sm">
            Report Safety Concern
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Your safety is our priority. Please provide details of the incident. All reports are handled with strict confidentiality.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] border border-white p-6 sm:p-10 transition-all text-slate-800 relative overflow-hidden">
          {/* Subtle inner top glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          
          <form onSubmit={handleSubmit} noValidate className="space-y-8 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label htmlFor="category" className="flex items-center text-sm font-bold text-slate-700">
                  Incident Category <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={"w-full px-5 py-3.5 rounded-2xl bg-white/70 border-2 appearance-none text-slate-800 font-medium transition-all duration-300 outline-none shadow-sm backdrop-blur-sm " + 
                      (errors.category 
                        ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/50" 
                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white")}
                  >
                    <option value="" disabled className="text-slate-400">Select category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5 group-hover:text-slate-600 transition-colors" />
                </div>
                {errors.category && (
                  <p className="text-rose-500 text-sm font-medium flex items-center gap-1.5 mt-1 animate-in slide-in-from-top-1">
                    <Info className="w-4 h-4" /> {errors.category}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center text-sm font-bold text-slate-700">
                  Severity Level <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SEVERITIES.map((sev) => {
                    const isSelected = form.severity === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => {
                          setForm(p => ({ ...p, severity: sev }));
                          if (errors.severity) setErrors(p => ({ ...p, severity: '' }));
                        }}
                        className={"py-3 px-2 rounded-2xl text-sm font-bold transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1 shadow-sm " +
                          (isSelected ? SEVERITY_STYLES[sev] + " scale-[1.02] bg-white" 
                                       : "border-slate-100 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-700 shadow-sm") + 
                          " " + (errors.severity && !isSelected ? "border-rose-300 bg-rose-50/50" : "")
                        }
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {sev}
                      </button>
                    );
                  })}
                </div>
                {errors.severity && (
                  <p className="text-rose-500 text-sm font-medium flex items-center gap-1.5 mt-2 animate-in slide-in-from-top-1">
                    <Info className="w-4 h-4" /> {errors.severity}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <label htmlFor="description" className="flex items-center text-sm font-bold text-slate-700">
                  Description <span className="text-rose-500 ml-1">*</span>
                </label>
                <span className={"text-xs font-semibold px-2 py-1 rounded-md transition-colors " + (form.description.length >= 20 ? "bg-emerald-100/80 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                  {form.description.length} / 20 min
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Please describe exactly what happened, when and where. Include any specific details..."
                className={"w-full px-5 py-4 rounded-2xl bg-white/70 shadow-sm backdrop-blur-sm border-2 text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal transition-all duration-300 outline-none resize-none " +
                  (errors.description 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/50" 
                    : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-white")}
              />
               {errors.description && (
                  <p className="text-rose-500 text-sm font-medium flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <Info className="w-4 h-4" /> {errors.description}
                  </p>
                )}
            </div>

            <div className="space-y-2.5">
               <label className="flex items-center text-sm font-bold text-slate-700">
                  Attach Evidence <span className="text-slate-400 ml-2 font-medium">(Optional)</span>
                </label>
              
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 group relative border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white/40 hover:bg-white/80 rounded-3xl p-8 transition-all duration-300 cursor-pointer text-center overflow-hidden shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="mx-auto w-16 h-16 bg-slate-50 group-hover:bg-indigo-100/50 rounded-2xl flex items-center justify-center mb-4 transition-colors relative z-10 shadow-sm">
                    <UploadCloud className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1 relative z-10">Click to upload photo</h3>
                  <p className="text-sm text-slate-500 relative z-10">Supports JPG, PNG up to 10MB</p>
                  
                  <input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative mt-2 rounded-3xl overflow-hidden border-4 border-white shadow-xl group">
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-sm">
                     <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white/20 hover:bg-rose-500 text-white p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-2xl"
                      >
                        <X className="w-6 h-6" />
                      </button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover transform transition-transform group-hover:scale-105 duration-700"
                  />
                   <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pt-12 pb-4 px-5 z-20">
                     <p className="text-white font-medium text-sm truncate drop-shadow-md">{imageName}</p>
                   </div>
                </div>
              )}
            </div>

            <hr className="border-slate-200" />

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={fillDummy}
                className="py-4 px-6 rounded-2xl font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all active:scale-[0.98] sm:w-1/3 flex items-center justify-center gap-2 hover:border-slate-300"
              >
                Auto Fill
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative py-4 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 hover:from-rose-600 hover:via-pink-600 hover:to-indigo-600 transition-all active:scale-[0.98] shadow-lg shadow-rose-500/25 sm:w-2/3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden bg-[length:200%_auto] hover:bg-right"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Submit Report <AlertTriangle className="w-5 h-5" /></>
                  )}
                </span>
              </button>
            </div>

          </form>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-slate-500 font-medium text-sm flex items-center justify-center gap-2 backdrop-blur-sm inline-flex px-4 py-2 rounded-full bg-white/40 border border-white/50 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-end encrypted submission
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReportSafetyPage;
