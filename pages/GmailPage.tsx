import React, { useEffect, useState } from 'react';
import { Mail, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { JsonDisplay } from '../components/JsonDisplay';

// --- CONFIGURATION ---
// You must get these from Google Cloud Console (https://console.cloud.google.com)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; 
// Redirect URI must match exactly what is in Google Console
const REDIRECT_PATH = '/oauth/google';

// Scopes for Gmail Automation (Read and Send)
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

export const GmailPage: React.FC = () => {
  const [credentials, setCredentials] = useState<any>(null);
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    // Determine dynamic Redirect URI based on environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const origin = isLocal ? window.location.origin : 'https://whatsapp-signup-api.pages.dev';
    setRedirectUri(`${origin}${REDIRECT_PATH}`);

    // Load from Local Storage on mount
    loadCredentials();
  }, []);

  const loadCredentials = () => {
    const stored = localStorage.getItem('gmail_credentials');
    if (stored) {
      setCredentials(JSON.parse(stored));
    } else {
      setCredentials(null);
    }
  };

  const handleLogin = () => {
    // Construct Google OAuth URL
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', SCOPES);
    // 'offline' is required to get a refresh_token (Permanent Access)
    url.searchParams.append('access_type', 'offline');
    // 'consent' forces the consent screen, ensuring we get a refresh_token every time
    url.searchParams.append('prompt', 'consent');

    window.location.href = url.toString();
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will remove the token from your browser Local Storage.')) {
      localStorage.removeItem('gmail_credentials');
      loadCredentials();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-md">
          <Mail size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gmail Automation</h1>
          <p className="text-slate-500">Connect Google to get permanent access tokens for email automation testing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Connection Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Connection Status</h2>
            
            {credentials ? (
              <div className="flex flex-col gap-4">
                 <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Connected to Gmail</p>
                      <p className="text-xs opacity-80">Credentials stored in Local Storage.</p>
                    </div>
                 </div>
                 
                 <button 
                  onClick={handleClearData}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                 >
                   <Trash2 size={16} />
                   Remove from Local Storage
                 </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Mail size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 mb-6">No credentials found in Local Storage.</p>
                
                {GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' ? (
                   <div className="p-3 bg-amber-50 text-amber-800 text-xs text-left rounded border border-amber-200 mb-4">
                     <strong>Setup Required:</strong> Please open <code>pages/GmailPage.tsx</code> and <code>components/GoogleCallback.tsx</code> and replace <code>YOUR_GOOGLE_CLIENT_ID</code> and <code>YOUR_GOOGLE_CLIENT_SECRET</code>.
                   </div>
                ) : null}

                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="G" />
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <h3 className="text-sm font-semibold text-slate-700 mb-2">Redirect URI Configuration</h3>
             <p className="text-xs text-slate-500 mb-2">
               Add this URI to "Authorized redirect URIs" in your Google Cloud Console Credentials.
             </p>
             <code className="block bg-white border border-slate-300 rounded p-2 text-xs font-mono text-slate-600 break-all">
                {redirectUri || 'Loading...'}
             </code>
          </div>
        </div>

        {/* Right Col: Data Display */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-800">Local Storage Data</h3>
             <button onClick={loadCredentials} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full" title="Refresh View">
               <RefreshCw size={18} />
             </button>
           </div>
           
           {credentials ? (
             <div className="space-y-4">
               <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                 <label className="text-xs font-bold text-green-600 uppercase">Refresh Token (Permanent)</label>
                 <textarea 
                    readOnly 
                    className="w-full h-20 mt-1 bg-green-50 border border-green-200 rounded p-2 text-xs font-mono text-green-800 focus:outline-none"
                    value={credentials.refresh_token || "No refresh token returned. Did you use 'access_type=offline'?"}
                 />
               </div>
               
               <JsonDisplay title="Full JSON (gmail_credentials)" data={credentials} />
             </div>
           ) : (
             <div className="bg-white rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-400 text-sm">
               Data will appear here after login.
             </div>
           )}
        </div>

      </div>
    </div>
  );
};