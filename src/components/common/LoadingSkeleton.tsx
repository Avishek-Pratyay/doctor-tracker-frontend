import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-8 bg-slate-100 rounded flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
};
