import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'btn-base select-none';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-500/20 active:shadow-none',
    secondary: 'bg-white text-gray-700 border border-gray-200/60 hover:bg-gray-50/50 backdrop-blur-md active:bg-gray-100',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-500/20',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 active:bg-white/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base font-bold uppercase tracking-widest',
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className={cn('mr-2', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />}
      {children}
    </motion.button>
  );
};

export default Button;
