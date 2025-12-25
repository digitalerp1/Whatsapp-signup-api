import React, { useState, useEffect } from 'react';
import { Instagram, Copy, ExternalLink, Check } from 'lucide-react';

const INSTAGRAM_APP_ID = '1176336757947257';
// This matches the "Valid OAuth Redirect URIs" you entered in Facebook
const REDIRECT_PATH = '/oauth'; 

const SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
  'instagram_business_content_publish',
  'instagram_business_manage_insights'
].join(',');

export const InstagramPage: React.FC = () => {
  const [redirectUri, setRedirectUri] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Logic: If we are on localhost, keep localhost. 
    // If we are on production, force the exact domain you provided to avoid mismatch errors.
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const origin = isLocal ? window.location.origin : 'https://whatsapp-signup-api.pages.dev';
    
    setRedirectUri(`${origin}${REDIRECT_PATH}`);
  }, []);

  const handleLogin = () => {
    // Construct the Instagram OAuth URL
    // Using force_reauth=true as requested for testing flow
    const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${SCOPES}`;
    
    // Redirect the user
    window.location.href = authUrl;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl text-white shadow-md">
          <Instagram size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instagram Automation</h1>
          <p className="text-slate-500">Connect your Instagram Business account to enable DM automation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Configuration Instructions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
              Configure Facebook Developer Portal
            </h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              To allow users to log in, you must add the exact URL below to your Facebook App settings under 
              <strong> Instagram Basic Display</strong> or <strong>Facebook Login for Business</strong> &gt; <strong>Settings</strong>.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Valid OAuth Redirect URI
              </label>
              <div className="flex gap-2">
                <code className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm font-mono text-slate-700 overflow-x-auto whitespace-nowrap">
                  {redirectUri || 'Loading...'}
                </code>
                <button 
                  onClick={handleCopy}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertIcon />
                Paste this EXACTLY into the "Valid OAuth Redirect URIs" field.
              </p>
            </div>

            <div className="text-xs text-slate-400">
              <p>App ID: <span className="font-mono text-slate-600">{INSTAGRAM_APP_ID}</span></p>
            </div>
          </div>
        </div>

        {/* Right Col: Login Action */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
           <div className="border-b border-slate-100 pb-4 w-full text-left">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
              Connect Account
            </h2>
          </div>

          <div className="py-8">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Instagram size={40} className="text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Connect?</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
              This will redirect you to Instagram. After you approve, you will be returned to this app.
            </p>
            
            <button
              onClick={handleLogin}
              className="group relative inline-flex items-center justify-center gap-2 bg-[#E1306C] hover:bg-[#C13584] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Instagram size={20} />
              Login with Instagram
              <ExternalLink size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-1">Requested Permissions:</h4>
        <p className="text-sm text-blue-700 font-mono break-words">
          {SCOPES.split(',').join(', ')}
        </p>
      </div>
    </div>
  );
};

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);