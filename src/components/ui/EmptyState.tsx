import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#1B1C26]/60 border border-[#343541] rounded-2xl border-dashed">
      {icon ? (
        <div className="p-3 bg-[#20212C] text-[#BFA7FF] rounded-xl mb-3 border border-[#343541]">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full border border-[#343541] flex items-center justify-center text-[#74747D] font-mono mb-3">
          ∅
        </div>
      )}
      <h4 className="text-base font-bold text-[#F5F5F2] uppercase tracking-wide">{title}</h4>
      <p className="text-xs text-[#A7A7AD] max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
