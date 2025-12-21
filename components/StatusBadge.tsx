import React from 'react';

interface StatusBadgeProps {
  connected: boolean;
  initialized: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ connected, initialized }) => {
  if (!initialized) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        SDK Loading...
      </span>
    );
  }

  return connected ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
      Not Connected
    </span>
  );
};