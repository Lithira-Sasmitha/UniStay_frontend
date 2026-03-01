import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  GraduationCap,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    address: '',
    age: '',
    nic: '',
    phonenumber: '',
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.05 },
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
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || formData.age < 16 || formData.age > 100) newErrors.age = 'Enter a valid age (16-100)';
    if (!formData.nic) newErrors.nic = 'NIC number is required';
    if (!formData.phonenumber) newErrors.phonenumber = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Send registration data (excluding confirmPassword)
      const { confirmPassword, ...payload } = formData;
      // Convert age to number
      payload.age = Number(payload.age);

      await authService.register(payload);
      setIsSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  // ─── Success View ─────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-green-100 border border-green-200">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Successful!</h2>
        <p className="text-slate-500 font-medium leading-relaxed max-w-[320px]">
          Your account has been created. Redirecting you to login...
        </p>
      </motion.div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Create Account
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Join thousands of students staying smart with UniStay.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g., Alex Johnson"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={User}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="email@university.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
            required
          />
        </div>

        <Input
          label="University"
          name="university"
          placeholder="e.g., University of Colombo"
          value={formData.university}
          onChange={handleChange}
          error={errors.university}
          icon={GraduationCap}
          required
        />

        <Input
          label="Address"
          name="address"
          placeholder="e.g., 789 Street, Colombo"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          icon={MapPin}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Age"
            name="age"
            type="number"
            placeholder="22"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            icon={Calendar}
            required
          />
          <Input
            label="NIC Number"
            name="nic"
            placeholder="200298765432"
            value={formData.nic}
            onChange={handleChange}
            error={errors.nic}
            icon={CreditCard}
            required
          />
          <Input
            label="Phone Number"
            name="phonenumber"
            placeholder="0770000000"
            value={formData.phonenumber}
            onChange={handleChange}
            error={errors.phonenumber}
            icon={Phone}
            required
          />
        </div>

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

        <Button
          type="submit"
          className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-primary-200/50 mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create Account
            </span>
          )}
        </Button>
      </motion.form>

      <p className="mt-6 text-center text-sm font-medium text-slate-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
};

export default Register;
