import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hoverEffect
          ? { y: -3, transition: { duration: 0.18, ease: 'easeOut' } }
          : undefined
      }
      className={`bg-[#1B1C26] border border-[#343541] rounded-xl p-5 shadow-sm transition-colors duration-200 ${
        hoverEffect ? 'hover:border-[#5A5B68]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

