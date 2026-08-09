import React from 'react';

export type BadgeVariant = 'lavender' | 'lime' | 'success' | 'warning' | 'error' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'muted',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    lavender: 'bg-[#BFA7FF]/15 text-[#BFA7FF] border border-[#BFA7FF]/30',
    lime: 'bg-[#D8FF9A]/15 text-[#D8FF9A] border border-[#D8FF9A]/30',
    success: 'bg-[#B8F28A]/15 text-[#B8F28A] border border-[#B8F28A]/30',
    warning: 'bg-[#FFD98A]/15 text-[#FFD98A] border border-[#FFD98A]/30',
    error: 'bg-[#FF8F9A]/15 text-[#FF8F9A] border border-[#FF8F9A]/30',
    muted: 'bg-[#20212C] text-[#A7A7AD] border border-[#343541]',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium tracking-wide uppercase rounded ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
