import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Home,
  Building2,
  ArrowRight
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import { 
  validateName, 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateNIC, 
  validateAge, 
  validateRequired 
} from '../../utils/validation';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // 'student' or 'boardingowner'
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (errors.form) setErrors((prev) => ({ ...prev, form: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === 'student') {
      const uniError = validateRequired(formData.university, 'University');
      if (uniError) newErrors.university = uniError;
    }

    const addressError = validateRequired(formData.address, 'Address');
    if (addressError) newErrors.address = addressError;

    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;

    const nicError = validateNIC(formData.nic);
    if (nicError) newErrors.nic = nicError;

    const phoneError = validatePhone(formData.phonenumber);
    if (phoneError) newErrors.phonenumber = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      payload.age = Number(payload.age);
      payload.role = role;

      // Only include university for students
      if (role !== 'student') {
        delete payload.university;
      }

      await authService.register(payload);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-full py-4">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Create Account
        </h2>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          Join UniStay as a {role === 'student' ? 'student' : 'boarding owner'}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Role Switcher - Compact & Professional Segmented Control */}
        <div className="flex flex-col gap-3 mb-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Join as a</label>
          <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 relative w-full overflow-hidden">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`
                flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-500 relative z-10
                ${role === 'student' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${role === 'student' ? 'bg-primary-100 text-primary-600' : 'bg-transparent text-slate-400'}`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('boardingowner')}
              className={`
                flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-500 relative z-10
                ${role === 'boardingowner' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${role === 'boardingowner' ? 'bg-primary-100 text-primary-600' : 'bg-transparent text-slate-400'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">Boarding Owner</span>
            </button>

            {/* Sliding Active Indicator */}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              animate={{ x: role === 'student' ? '0%' : '100%' }}
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-xl shadow-primary-500/5 border border-slate-100 pointer-events-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
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
            placeholder={role === 'student' ? 'email@university.com' : 'email@example.com'}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          <AnimatePresence mode="wait">
            {role === 'student' && (
              <motion.div
                key="uni-field"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Age"
              name="age"
              type="number"
              placeholder="e.g., 22"
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
        </div>

        {/* Error Banner */}
        {errors.form && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{errors.form}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full py-4 rounded-[1.5rem] text-base font-black shadow-2xl shadow-primary-200/50 mt-4 h-16"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
              Create Account
              <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
            </span>
          )}
        </Button>
      </form>

      <p className="mt-12 text-center text-lg font-medium text-slate-500 pb-10">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary-600 font-black hover:text-primary-700 transition-all hover:underline underline-offset-8">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
