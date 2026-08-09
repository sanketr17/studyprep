import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  percentage: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'lime' | 'lavender' | 'auto';
  showLabel?: boolean;
  className?: string;
  value?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  value,
  height = 'sm',
  size,
  color = 'auto',
  showLabel = false,
  className = '',
}) => {
  const actualPercent = percentage !== undefined ? percentage : (value !== undefined ? value : 0);
  const actualHeight = size || height;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const clamped = Math.min(100, Math.max(0, actualPercent));

  let barColor = 'bg-[#BFA7FF]';
  if (color === 'lime' || (color === 'auto' && clamped >= 75)) {
    barColor = 'bg-[#D8FF9A]';
  } else if (color === 'lavender') {
    barColor = 'bg-[#BFA7FF]';
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
          <span className="text-[#A7A7AD]">Progress</span>
          <span className="text-[#F5F5F2] font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#15161F] border border-[#343541]/80 rounded-full overflow-hidden ${heightClasses[actualHeight]}`}>
        <motion.div
          className={`${barColor} h-full rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

