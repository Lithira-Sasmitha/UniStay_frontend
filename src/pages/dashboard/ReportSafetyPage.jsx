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
  Low: 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-500',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-500',
  High: 'text-rose-700 bg-rose-50 border-rose-200 ring-rose-500',
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white p-8 text-center transform transition-all animate-in fade-in zoom-in duration-500">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-tr from-emerald-400 to-emerald-500 text-white w-full h-full rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <ShieldCheck className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Report Received</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for helping keep our community safe. Our security team has been notified and will review your report immediately.
          </p>
          
          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 mb-8 text-left space-y-3 backdrop-blur-sm">
             <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500 text-sm font-medium">Category</span>
              <span className="text-slate-800 font-semibold bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-sm">{form.category}</span>
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
            className="w-full py-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
          >
            Submit Another Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-rose-100 text-rose-600 rounded-2xl mb-4 shadow-sm shadow-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-4">
            Report Safety Concern
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Your safety is our priority. Please provide details of the incident. All reports are handled with strict confidentiality.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] border border-white p-6 sm:p-10 transition-all">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            
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
                    className={"w-full px-5 py-3.5 rounded-2xl bg-white/50 border-2 appearance-none text-slate-700 font-medium transition-all duration-200 outline-none " + 
                      (errors.category 
                        ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" 
                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10")}
                  >
                    <option value="" disabled>Select category...</option>
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
                        className={"py-3 px-2 rounded-2xl text-sm font-bold transition-all duration-200 border-2 flex flex-col items-center justify-center gap-1 " +
                          (isSelected ? SEVERITY_STYLES[sev] + " shadow-sm scale-[1.02]" 
                                       : "border-slate-200 bg-white/50 text-slate-500 hover:border-slate-300 hover:bg-slate-50") + 
                          " " + (errors.severity && !isSelected ? "border-rose-200" : "")
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
                <span className={"text-xs font-semibold px-2 py-1 rounded-md " + (form.description.length >= 20 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
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
                className={"w-full px-5 py-4 rounded-2xl bg-white/50 border-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 outline-none resize-none " +
                  (errors.description 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" 
                    : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10")}
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
                  className="mt-2 group relative border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white/40 hover:bg-white/80 rounded-3xl p-8 transition-all duration-300 cursor-pointer text-center"
                >
                  <div className="mx-auto w-16 h-16 bg-slate-100 group-hover:bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 mb-1">Click to upload photo</h3>
                  <p className="text-sm text-slate-500">Supports JPG, PNG up to 10MB</p>
                  
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
                <div className="relative mt-2 rounded-3xl overflow-hidden border-2 border-slate-200 group">
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-sm">
                     <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white/20 hover:bg-rose-500 text-white p-3 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <X className="w-6 h-6" />
                      </button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                   <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 z-20">
                     <p className="text-white font-medium text-sm truncate">{imageName}</p>
                   </div>
                </div>
              )}
            </div>

            <hr className="border-slate-200" />

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={fillDummy}
                className="py-4 px-6 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98] border border-slate-200 sm:w-1/3 flex items-center justify-center gap-2"
              >
                Auto Fill
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-4 px-8 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 transition-all active:scale-[0.98] shadow-lg shadow-rose-200 sm:w-2/3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit Report <AlertTriangle className="w-5 h-5" /></>
                )}
              </button>
            </div>

          </form>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-end encrypted submission
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReportSafetyPage;
