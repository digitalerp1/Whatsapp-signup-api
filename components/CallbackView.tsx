import React from 'react';
import { JsonDisplay } from './JsonDisplay';

interface CallbackViewProps {
  code: string;
  accessToken?: string;
  error?: string;
  errorDescription?: string;
  fullUrl: string;
  backendResponse?: any;
  onBack: () => void;
}

export const CallbackView: React.FC<CallbackViewProps> = ({ code, accessToken, error, errorDescription, fullUrl, backendResponse, onBack }) => {
  const isSuccess = !!code && !error;
  const allParams = Object.fromEntries(new URLSearchParams(window.location.search));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Status Header */}
        <div className={`border rounded-xl p-8 text-center shadow-sm ${
          isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isSuccess ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${
            isSuccess ? 'text-green-800' : 'text-red-800'
          }`}>
            {isSuccess ? 'Authorization Successful!' : 'Authorization Failed'}
          </h2>
          
          <p className={`text-lg ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {isSuccess 
              ? 'We have successfully captured the Authorization Code from Facebook.'
              : 'Facebook returned an error during the authentication process.'}
          </p>
          
          {errorDescription && (
             <p className={`mt-4 p-3 rounded-lg text-sm font-mono inline-block whitespace-pre-wrap ${
               isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
             }`}>
               {errorDescription}
             </p>
          )}
        </div>

        {/* Data Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Response Details</h3>
          
          {isSuccess && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Authorization Code
              </label>
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full h-20 bg-green-50 border border-green-200 rounded-lg p-3 text-sm font-mono text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={code}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                This code was received from the initial redirect.
              </p>
            </div>
          )}

          {/* New Access Token Display */}
          {accessToken && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Temporary Access Token
              </label>
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full h-20 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm font-mono text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={accessToken}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Exchanged from Code. Valid for ~1 hour. Used to generate the Permanent Token.
              </p>
            </div>
          )}

          {/* New Backend Response Display */}
          {backendResponse && (
            <div className="mb-6">
              <JsonDisplay title="Full Token Exchange Data (Saved to Database)" data={backendResponse} />
            </div>
          )}

          <JsonDisplay 
            title="All URL Parameters" 
            data={allParams} 
          />
        </div>

        <div className="text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            &larr; Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};