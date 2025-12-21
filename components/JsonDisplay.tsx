import React, { useState } from 'react';

interface JsonDisplayProps {
  title: string;
  data: any;
  className?: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ title, data, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isEmpty = !data || (typeof data === 'object' && Object.keys(data).length === 0);

  if (isEmpty) return null;

  return (
    <div className={`border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm ${className}`}>
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">{title}</h3>
        <button
          onClick={handleCopy}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            copied 
              ? 'bg-green-100 text-green-700' 
              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <div className="bg-[#1e1e1e] p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-xs font-mono text-blue-300 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};