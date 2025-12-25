import React from 'react';
import { Instagram } from 'lucide-react';

export const InstagramPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="p-4 bg-pink-100 rounded-full mb-4">
        <Instagram size={48} className="text-pink-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Instagram Management</h2>
      <p className="text-slate-500 mt-2 max-w-md">
        This module is currently under development. Soon you will be able to manage your Instagram Business interactions here.
      </p>
    </div>
  );
};