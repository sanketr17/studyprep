import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading your preparation data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-[#343541]" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#BFA7FF] border-r-[#D8FF9A] animate-spin" />
      </div>
      <p className="text-xs font-mono text-[#A7A7AD] uppercase tracking-wider animate-pulse">
        {message}
      </p>
    </div>
  );
};
