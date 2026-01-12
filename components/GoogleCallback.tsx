import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JsonDisplay } from './JsonDisplay';

// --- CONFIGURATION ---
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';

export const GoogleCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  useEffect(() => {
    const process = async () => {
      // 1. Get Code from URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        addLog(`Error from Google: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        addLog('No authorization code found in URL.');
        return;
      }

      addLog('Authorization Code captured.');

      try {
        // 2. Determine Redirect URI
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const origin = isLocal ? window.location.origin : 'https://whatsapp-signup-api.pages.dev';
        const redirectUri = `${origin}/oauth/google`;
        
        addLog(`Exchange URI: ${redirectUri}`);

        // 3. Exchange Code for Token via Codetabs Proxy
        // We use a proxy because Google's token endpoint doesn't support CORS for client-side apps with Client Secret.
        addLog('Exchanging code for tokens via Proxy...');
        
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(tokenEndpoint)}`;

        const bodyParams = new URLSearchParams();
        bodyParams.append('client_id', GOOGLE_CLIENT_ID);
        bodyParams.append('client_secret', GOOGLE_CLIENT_SECRET);
        bodyParams.append('code', code);
        bodyParams.append('grant_type', 'authorization_code');
        bodyParams.append('redirect_uri', redirectUri);

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: bodyParams
        });

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`Token exchange failed: ${errText.substring(0, 150)}...`);
        }

        const tokens = await response.json();
        addLog('Tokens received successfully.');
        
        // 4. Save to Local Storage
        const storageData = {
          ...tokens,
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('gmail_credentials', JSON.stringify(storageData));
        addLog('Saved to localStorage key: "gmail_credentials"');
        
        setData(storageData);
        setStatus('success');

      } catch (err: any) {
        console.error(err);
        setStatus('error');
        addLog(`Exception: ${err.message}`);
      }
    };

    process();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className={`p-6 text-center border-b ${
            status === 'success' ? 'bg-green-50 border-green-100' : 
            status === 'error' ? 'bg-red-50 border-red-100' : 'bg-slate-50'
        }`}>
          {status === 'processing' && (
            <>
               <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
               <h2 className="text-xl font-bold text-slate-800">Connecting to Google...</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
               <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
               <h2 className="text-xl font-bold text-green-800">Connected Successfully!</h2>
               <p className="text-green-700 mt-2">Your Gmail credentials have been saved to Local Storage.</p>
            </>
          )}

          {status === 'error' && (
            <>
               <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
               <h2 className="text-xl font-bold text-red-800">Connection Failed</h2>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Logs */}
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 h-40 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 border-b border-slate-800 pb-1 last:border-0">
                <span className="text-slate-500 mr-2">&gt;</span>{log}
              </div>
            ))}
          </div>

          {/* Result Data */}
          {data && (
            <JsonDisplay title="Saved Credentials" data={data} />
          )}

          <div className="flex justify-center pt-4">
             <Link to="/gmail" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               <ArrowLeft size={18} />
               Back to Gmail Manager
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
};