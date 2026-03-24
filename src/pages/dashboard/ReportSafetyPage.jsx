import React, { useState, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Theft', 'Harassment', 'Infrastructure'];
const SEVERITIES = ['Low', 'Medium', 'High'];

const DUMMY_DATA = {
  category: 'Harassment',
  severity: 'High',
  description:
    'A fellow resident was verbally harassed by an unknown individual near the common kitchen area on the 2nd floor at approximately 9:30 PM. The incident was witnessed by two other residents.',
};

const SEVERITY_COLORS = {
  Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  High: 'text-red-600 bg-red-50 border-red-200',
};

// ─── Component ────────────────────────────────────────────────────────────────
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
  const fileInputRef = useRef(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
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
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ category: '', severity: '', description: '', image: null });
    setErrors({});
    setImageName('');
    setImagePreview(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Submitted</h2>
          <p className="text-slate-500 text-sm mb-1">
            Your safety report has been received and will be reviewed by the admin team.
          </p>
          <div className="mt-4 mb-6 text-left bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Category</span>
              <span className="text-slate-700 font-semibold">{form.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Severity</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full border text-xs ${SEVERITY_COLORS[form.severity]}`}>
                {form.severity}
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-semibold text-red-500 tracking-wide uppercase">Safety Report</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Report Safety Issue</h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            All reports are confidential and reviewed within 24 hours.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Card top stripe */}
          <div className="h-1 bg-gradient-to-r from-red-400 via-orange-400 to-amber-400" />

          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-6">

            {/* Row: Category + Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Incident Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 bg-white appearance-none
                    focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all duration-150
                    ${errors.category ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label htmlFor="severity" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Severity Level <span className="text-red-400">*</span>
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 bg-white appearance-none
                    focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all duration-150
                    ${errors.severity ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <option value="">Select severity…</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.severity && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.severity}
                  </p>
                )}

                {/* Severity badge preview */}
                {form.severity && (
                  <span className={`inline-flex mt-2 items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${SEVERITY_COLORS[form.severity]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {form.severity} severity
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                  Description <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs ${form.description.length < 20 ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {form.description.length} / 20 min chars
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what happened, when, and where. Include any relevant details that may help the investigation…"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-700 placeholder:text-slate-300
                  focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none transition-all duration-150
                  ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 hover:border-slate-300'}`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Attach Evidence{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200
                    rounded-xl py-8 px-4 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Click to upload a photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                    <span className="text-xs text-white font-medium truncate flex-1">{imageName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="ml-2 flex-shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Secondary – Fill Dummy Data */}
              <button
                type="button"
                onClick={fillDummy}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold
                  hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-150
                  flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Fill Dummy Data
              </button>

              {/* Primary – Submit */}
              <button
                type="submit"
                id="submit-report-btn"
                className="flex-1 py-2.5 px-6 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-red-500 to-orange-500
                  hover:from-red-600 hover:to-orange-600
                  active:scale-[0.98] shadow-sm shadow-red-200
                  focus:ring-2 focus:ring-red-300 focus:outline-none
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Submit Report
              </button>
            </div>

          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Reports are encrypted and only visible to authorised administrators.
        </p>
      </div>
    </div>
  );
};

export default ReportSafetyPage;
