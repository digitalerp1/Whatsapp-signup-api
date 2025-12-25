import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Facebook, Instagram, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'WhatsApp Numbers', value: '1', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-100', link: '/whatsapp' },
    { name: 'Facebook Pages', value: '0', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-100', link: '/facebook' },
    { name: 'Instagram Accounts', value: '0', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100', link: '/instagram' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your accounts today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              <Link to={stat.link} className="inline-flex items-center text-sm font-medium text-indigo-600 mt-4 hover:text-indigo-500">
                Manage <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Quick Actions</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/whatsapp" className="group p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded text-green-600"><MessageCircle size={20} /></div>
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-700">Connect WhatsApp</span>
                </div>
                <p className="text-xs text-slate-500">Launch the Embedded Signup flow to add a number.</p>
            </Link>
            {/* Add more cards for other actions */}
        </div>
      </div>
    </div>
  );
};