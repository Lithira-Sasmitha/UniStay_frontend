export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password, isLogin = false) => {
  if (!password) return 'Password is required';
  if (!isLogin && password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateName = (name) => {
  if (!name || name.trim() === '') return 'Full name is required';
  if (name.length < 3) return 'Name must be at least 3 characters';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const re = /^(?:0|0094|\+94)?(?:7[01245678]\d{7}|[1-9]\d{8})$/;
  if (!re.test(phone.replace(/\s+/g, ''))) return 'Enter a valid Sri Lankan phone number';
  return null;
};

export const validateNIC = (nic) => {
  if (!nic) return 'NIC is required';
  const oldNicRegex = /^[0-9]{9}[vVxX]$/;
  const newNicRegex = /^[0-9]{12}$/;
  if (!oldNicRegex.test(nic) && !newNicRegex.test(nic)) return 'Enter a valid NIC (e.g., 981234567V or 199812345678)';
  return null;
};

export const validateAge = (age) => {
  if (!age) return 'Age is required';
  const numAge = Number(age);
  if (isNaN(numAge)) return 'Age must be a number';
  if (numAge < 16 || numAge > 100) return 'Age must be between 16 and 100';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === '') return `${fieldName} is required`;
  return null;
};
