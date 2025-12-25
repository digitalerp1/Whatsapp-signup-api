import React from 'react';
import { Facebook } from 'lucide-react';

export const FacebookPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="p-4 bg-blue-100 rounded-full mb-4">
        <Facebook size={48} className="text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Facebook Page Management</h2>
      <p className="text-slate-500 mt-2 max-w-md">
        This module is currently under development. Soon you will be able to manage your Facebook Pages and Posts here.
      </p>
    </div>
  );
};