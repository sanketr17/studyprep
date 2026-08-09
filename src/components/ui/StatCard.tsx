import React from 'react';
import { Card } from './Card';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: 'lavender' | 'lime' | 'white';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = 'white',
}) => {
  const valueColors = {
    white: 'text-[#F5F5F2]',
    lavender: 'text-[#BFA7FF]',
    lime: 'text-[#D8FF9A]',
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between text-[#A7A7AD] text-xs font-mono tracking-wider uppercase mb-2">
        <span>{label}</span>
        {icon && <span className="text-[#A7A7AD]">{icon}</span>}
      </div>

      <div>
        <motion.div
          key={String(value)}
          initial={{ opacity: 0.8, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`text-3xl font-extrabold tracking-tight ${valueColors[accentColor]}`}
        >
          {value}
        </motion.div>
        {subtext && <p className="text-[11px] text-[#74747D] mt-1 font-medium">{subtext}</p>}
      </div>
    </Card>
  );
};

