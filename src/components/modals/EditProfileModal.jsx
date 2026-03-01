import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Phone, 
  CreditCard, 
  Calendar,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import { 
  validateName, 
  validatePhone, 
  validateNIC, 
  validateAge, 
  validateRequired 
} from '../../utils/validation';

const EditProfileModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
    age: '',
    nic: '',
    phonenumber: '',
    password: '', // optional password update
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        university: userData.university || '',
        address: userData.address || '',
        age: userData.age || '',
        nic: userData.nic || '',
        phonenumber: userData.phonenumber || '',
        password: '',
      });
    }
  }, [userData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const uniError = validateRequired(formData.university, 'University');
    if (uniError) newErrors.university = uniError;

    const addressError = validateRequired(formData.address, 'Address');
    if (addressError) newErrors.address = addressError;

    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;

    const nicError = validateNIC(formData.nic);
    if (nicError) newErrors.nic = nicError;

    const phoneError = validatePhone(formData.phonenumber);
    if (phoneError) newErrors.phonenumber = phoneError;

    if (formData.password && formData.password.length > 0 && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Clean up data before sending
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      
      const response = await authService.updateProfile(updateData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update local storage data if needed
        const currentUser = authService.getCurrentUser();
        const updatedUserData = { ...currentUser, ...response.user };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        if (onUpdate) onUpdate(updatedUserData);
        
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
              <p className="text-slate-500 text-sm font-medium">Update your account information</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="font-bold text-sm">{message.text}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={User}
              />
              <Input
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                disabled
              />
              <Input
                label="University"
                name="university"
                value={formData.university}
                onChange={handleChange}
                error={errors.university}
                icon={GraduationCap}
              />
              <Input
                label="Phone Number"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleChange}
                error={errors.phonenumber}
                icon={Phone}
              />
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  icon={MapPin}
                />
              </div>
              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                error={errors.age}
                icon={Calendar}
              />
              <Input
                label="NIC Number"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                error={errors.nic}
                icon={CreditCard}
              />
              <div className="md:col-span-2">
                <Input
                  label="Update Password (Optional)"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={Lock}
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
