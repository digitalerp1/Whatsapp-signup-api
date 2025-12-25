import React, { useEffect, useState, useCallback } from 'react';
import { FbWindow, FbAuthResponse, DebugLog, UserProfile, FbLoginStatusResponse } from '../types';
import { JsonDisplay } from '../components/JsonDisplay';
import { StatusBadge } from '../components/StatusBadge';
import { supabase } from '../lib/supabase';

// --- CONSTANTS ---
const APP_ID = '878785484691005';
const CONFIG_ID = '1373394650993633'; // Configuration ID for Embedded Signup
const API_VERSION = 'v20.0';
const BACKEND_URL = 'https://whatsapp-api.digitalerp.shop';

export const WhatsAppPage: React.FC = () => {
  // State
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [authResponse, setAuthResponse] = useState<FbAuthResponse | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [windowMessages, setWindowMessages] = useState<any[]>([]);
  
  // Helpers
  const addLog = useCallback((type: DebugLog['type'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, type, message, data }, ...prev]);
  }, []);

  // --- NEW: Send Data to Backend ---
  const sendCredentialsToBackend = async (authData: FbAuthResponse, profileData: any) => {
    try {
      // Get current logged-in user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        event: 'facebook_connected',
        timestamp: new Date().toISOString(),
        app_user: {
          id: user?.id,
          email: user?.email,
          aud: user?.aud
        },
        facebook_auth: {
           accessToken: authData.accessToken,
           code: authData.code,
           userID: authData.userID,
           expiresIn: authData.expiresIn,
           signedRequest: authData.signedRequest
        },
        facebook_profile: profileData
      };

      addLog('info', `Sending credentials to ${BACKEND_URL}...`, payload);

      // Use no-cors if simple fire-and-forget, but standard POST usually requires CORS support on server.
      // Assuming server supports CORS or we just want to attempt it.
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        addLog('success', 'Successfully sent credentials to server');
      } else {
        const text = await response.text();
        addLog('error', `Server responded with ${response.status}`, text);
      }
    } catch (error: any) {
      addLog('error', 'Network error sending credentials', error.message || error);
    }
  };

  // 1. Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSdk = () => {
      const fbWindow = window as unknown as FbWindow;
      
      // Prevent double init if navigating back and forth
      if (document.getElementById('facebook-jssdk')) {
          if (fbWindow.FB) {
             setSdkInitialized(true);
             fbWindow.FB.getLoginStatus(function(response) {
                if (response.status === 'connected' && response.authResponse) {
                    setAuthResponse(response.authResponse);
                    if (response.authResponse.accessToken) {
                        fetchUserData(response.authResponse);
                    }
                }
             });
          }
          return;
      }

      fbWindow.fbAsyncInit = function() {
        fbWindow.FB.init({
          appId: APP_ID,
          cookie: true,
          xfbml: true,
          version: API_VERSION
        });
        
        setSdkInitialized(true);
        addLog('success', 'Facebook SDK Initialized', { appId: APP_ID, version: API_VERSION });

        // Check initial status
        fbWindow.FB.getLoginStatus(function(response) {
            addLog('info', 'Initial Login Status Checked', response);
            if (response.status === 'connected' && response.authResponse) {
                setAuthResponse(response.authResponse);
                if (response.authResponse.accessToken) {
                    fetchUserData(response.authResponse);
                }
            }
        });
      };

      // Load SDK Script
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement; 
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    initFacebookSdk();
  }, [addLog]);

  // 2. Window Message Listener (CRITICAL for Embedded Signup Data)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'object' && event.data !== null) {
          if (event.data.source && event.data.source.includes('react')) return;
      }

      const isTrustedOrigin = event.origin === window.location.origin || 
                              event.origin.includes('facebook.com') ||
                              event.origin.includes('whatsapp.com');

      if (!isTrustedOrigin) {
         return; 
      }
      
      setWindowMessages(prev => [...prev, {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      if (event.data && (event.data.code || event.data.accessToken)) {
         addLog('success', 'Captured Auth Data via PostMessage', event.data);
      } else {
         addLog('event', 'Received Window Message', { origin: event.origin, data: event.data });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // 3. Fetch User Data (Graph API)
  const fetchUserData = (authData: FbAuthResponse) => {
    const fbWindow = window as unknown as FbWindow;
    addLog('info', 'Fetching User Data via Graph API...');
    
    fbWindow.FB.api('/me', (response: any) => { 
        addLog('success', 'Graph API /me Response', response);
        setUserProfile(response);
        
        // Trigger backend sync
        sendCredentialsToBackend(authData, response);
    });
  };

  // 4. Login Handler (Popup Flow)
  const handleLogin = () => {
    const fbWindow = window as unknown as FbWindow;
    if (!sdkInitialized) {
      addLog('error', 'SDK not yet initialized');
      return;
    }

    const loginOptions = {
        config_id: CONFIG_ID,
        response_type: 'code', 
        override_default_response_type: true,
        extras: {
            "sessionInfoVersion": "3", 
            "setup": {
               "external": true 
            }
        }
    };

    addLog('info', 'Launching Embedded Signup Popup...', loginOptions);

    fbWindow.FB.login((response: FbLoginStatusResponse) => {
      console.log('FB.login response:', response);
      
      if (response.status === 'connected' && response.authResponse) {
        addLog('success', 'Popup Login Callback Success', response);
        setAuthResponse(response.authResponse);
        
        // Even if we get a code, we might have an access token depending on response_type.
        // Usually, Embedded Signup returns a code. Standard Login returns a token.
        // If we have a token, we fetch user data.
        if (response.authResponse.accessToken) {
            fetchUserData(response.authResponse);
        } else if (response.authResponse.code) {
            addLog('info', 'Received Authorization Code', { code: response.authResponse.code });
            // If only code is returned, we can't call Graph API from client easily without exchanging it.
            // But we can still send the code to backend.
            sendCredentialsToBackend(response.authResponse, { status: 'code_only_flow' });
        }
      } else {
        addLog('info', 'Popup closed. Checking for postMessage data...');
      }
    }, loginOptions);
  };

  const handleLogout = () => {
     const fbWindow = window as unknown as FbWindow;
     fbWindow.FB.api('/me/permissions', 'delete', () => {
         addLog('info', 'Permissions revoked (Logout)');
         setAuthResponse(null);
         setUserProfile(null);
         setWindowMessages([]);
     });
  };

  const getDisplayCredentials = () => {
    if (!authResponse) return "Waiting for login...";
    if (authResponse.accessToken) return authResponse.accessToken;
    if (authResponse.code) return authResponse.code;
    return "No credentials found in login callback. Check Window Messages below.";
  };

  const getCredentialLabel = () => {
      if (authResponse?.code) return "Authorization Code";
      return "Temporary Access Token";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WhatsApp Manager</h1>
            <p className="text-slate-500">Test Embedded Signup, capture tokens, and debug responses.</p>
          </div>
          <StatusBadge connected={!!authResponse} initialized={sdkInitialized} />
      </div>
        
        {/* Hero / Action Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          {!authResponse ? (
            <div className="space-y-4">
                 <p className="text-slate-500 max-w-2xl mx-auto">
                    Clicking the button below will open the Facebook Popup for WhatsApp Embedded Signup.
                </p>
                <button
                onClick={handleLogin}
                disabled={!sdkInitialized}
                className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {sdkInitialized ? 'Log In with Facebook' : 'Loading SDK...'}
                </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 <span>Successfully Authenticated as <strong>{userProfile?.name || 'Authorized User'}</strong></span>
               </div>
               <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-600 underline">
                 Clear Session & Logout
               </button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column: Primary Data */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636 11.536 9.636m-2.336 4.814A9.956 9.956 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
              Captured Credentials
            </h3>

            {/* Credential Display */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">{getCredentialLabel()}</label>
                 {authResponse && authResponse.expiresIn && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Expires in: {authResponse.expiresIn}s
                    </span>
                 )}
              </div>
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  value={getDisplayCredentials()}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {authResponse?.code 
                  ? "This is an Authorization Code. It must be exchanged on a server for an Access Token." 
                  : "Use this token to make Graph API calls."}
              </p>
              
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                   Credentials automatically sent to backend API
                </p>
              </div>
            </div>

            {/* Raw JSON Responses */}
            <JsonDisplay 
              title="Full Auth Response Object" 
              data={authResponse || { status: 'waiting_for_user_action' }} 
            />
            
            <JsonDisplay 
              title="User Profile (Graph API /me)" 
              data={userProfile || { status: 'Not available (Code flow used or waiting)' }} 
            />
          </div>

          {/* Right Column: Events & Debugging */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               Live Debugger
            </h3>

            {/* Window Messages (Important for Embedded Signup flow) */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h4 className="font-semibold text-sm text-slate-700">Window Messages (postMessage)</h4>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{windowMessages.length} events</span>
              </div>
              <div className="max-h-60 overflow-y-auto p-0 bg-slate-100 custom-scrollbar">
                {windowMessages.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 text-sm">
                     No cross-window messages received yet.
                   </div>
                ) : (
                  windowMessages.map((msg, idx) => (
                    <div key={idx} className="border-b border-slate-200 last:border-0 p-3 bg-white text-xs">
                       <div className="flex justify-between text-slate-400 mb-1">
                         <span>{msg.timestamp}</span>
                         <span>Origin: {msg.origin}</span>
                       </div>
                       <pre className="overflow-x-auto text-slate-700 font-mono mt-1">
                         {JSON.stringify(msg.data, null, 2)}
                       </pre>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Console Logs */}
            <div className="bg-[#1e1e1e] rounded-lg shadow-sm overflow-hidden text-white font-mono text-xs">
              <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d] font-semibold text-gray-300">
                Application Logs
              </div>
              <div className="h-64 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                 {logs.length === 0 && <span className="text-gray-500">Ready...</span>}
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-2">
                     <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                     <div className="break-all">
                       <span className={`
                         ${log.type === 'error' ? 'text-red-400' : ''}
                         ${log.type === 'success' ? 'text-green-400' : ''}
                         ${log.type === 'info' ? 'text-blue-300' : ''}
                         ${log.type === 'event' ? 'text-purple-300' : ''}
                       `}>{log.message}</span>
                       {log.data && (
                         <div className="ml-2 mt-1 border-l-2 border-gray-600 pl-2 text-gray-400 opacity-80">
                           {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>
    </div>
  );
};