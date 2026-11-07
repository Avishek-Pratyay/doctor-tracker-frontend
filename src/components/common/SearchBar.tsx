import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  debounceMs = 350,
}) => {
  const [innerVal, setInnerVal] = useState(value);

  useEffect(() => {
    setInnerVal(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (innerVal !== value) {
        onChange(innerVal);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [innerVal, debounceMs, onChange, value]);

  const handleClear = () => {
    setInnerVal('');
    onChange('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={innerVal}
        onChange={(e) => setInnerVal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
      />
      {innerVal && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
