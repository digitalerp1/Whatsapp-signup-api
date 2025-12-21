import React from 'react';
import { JsonDisplay } from './JsonDisplay';

interface CallbackViewProps {
  code: string;
  fullUrl: string;
  onBack: () => void;
}

export const CallbackView: React.FC<CallbackViewProps> = ({ code, fullUrl, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800">Callback Received Successfully!</h2>
          <p className="text-green-700 mt-2">
            The WhatsApp Onboarding flow redirected back to this app with an Authorization Code.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Authorization Data</h3>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Authorization Code (Exchange this for Token)</label>
            <textarea 
              readOnly 
              className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={code}
            />
            <p className="text-xs text-slate-400 mt-2">
              This code was extracted from the URL query parameters.
            </p>
          </div>

          <JsonDisplay 
            title="Full URL Parameters" 
            data={Object.fromEntries(new URLSearchParams(window.location.search))} 
          />
        </div>

        <div className="text-center">
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 underline text-sm"
          >
            &larr; Return to Main Debugger
          </button>
        </div>

      </div>
    </div>
  );
};