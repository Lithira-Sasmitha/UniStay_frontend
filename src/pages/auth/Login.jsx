import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Chrome, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { validateEmail, validatePassword } from '../../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (errors.form) setErrors((prev) => ({ ...prev, form: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password, true);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      // Redirect based on role returned from backend
      navigate(result.redirectPath, { replace: true });
    } else {
      setErrors({ form: result.error });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
          Welcome Back.
        </h2>
        <p className="text-slate-500 font-medium text-base leading-relaxed">
          Sign in to your UniStay account to continue.
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="e.g., student@university.lk"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          required
          autoComplete="current-password"
        />

        {/* Error Banner */}
        {errors.form && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-700">{errors.form}</p>
          </motion.div>
        )}

        <div className="mt-2">
          <Button
            type="submit"
            className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-primary-200/50 group"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </span>
            )}
          </Button>
        </div>
      </motion.form>

      {/* Divider */}
      <motion.div variants={itemVariants} className="mt-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-slate-50 font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all border border-slate-100">
          <Chrome className="w-5 h-5 text-red-500" />
          Google
        </button>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Don't have an account?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="text-primary-600 font-bold hover:text-primary-700 transition-colors inline-flex items-center gap-1"
          >
            Create Account
            <Sparkles className="w-3.5 h-3.5" />
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
