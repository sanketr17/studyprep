import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'lime' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#BFA7FF] text-[#15161F] hover:bg-[#d0bdff] shadow-sm font-semibold',
    lime: 'bg-[#D8FF9A] text-[#15161F] hover:bg-[#e4ffb5] shadow-sm font-semibold',
    secondary: 'bg-transparent text-[#F5F5F2] border border-[#343541] hover:border-[#5A5B68] hover:bg-[#1B1C26]',
    ghost: 'bg-transparent text-[#A7A7AD] hover:text-[#F5F5F2] hover:bg-[#20212C]',
    danger: 'bg-[#FF8F9A]/10 text-[#FF8F9A] border border-[#FF8F9A]/30 hover:bg-[#FF8F9A]/20',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

