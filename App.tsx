

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WhatsAppPage } from './pages/WhatsAppPage';
import { InstagramPage } from './pages/InstagramPage';
import { FacebookPage } from './pages/FacebookPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { WebhookHandlerPage } from './pages/WebhookHandlerPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { CallbackView } from './components/CallbackView';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// Constants
const INSTAGRAM_APP_ID = '1176336757947257';
const INSTAGRAM_APP_SECRET = '47d99b25cac2acee7f96970e375b7125'; // Stored client-side as requested

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// OAuth Callback Route Helper with Client-Side Exchange (via Proxy) and Supabase Storage
const OAuthCallback: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string>('');
  const [resultData, setResultData] = useState<any>(null);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const error = params.get('error') || params.get('error_code') || '';
  const errorDescription = params.get('error_message') || params.get('error_description') || '';

  const addToLog = (msg: string) => setLog(prev => prev + '\n' + msg);

  useEffect(() => {
    const processCallback = async () => {
      // Ensure we only run this once per mount when code exists
      if (code && !error && user && status === 'idle') {
        setStatus('processing');
        addToLog('Starting Token Exchange Process (Frontend Proxy)...');

        try {
          // 1. Determine Redirect URI
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const origin = isLocal ? window.location.origin : 'https://whatsapp-signup-api.pages.dev';
          const redirectUri = `${origin}/oauth`; 

          addToLog(`Using Redirect URI: ${redirectUri}`);

          // 2. Exchange Code for Short-Lived Token
          // NOTE: We use corsproxy.io to bypass the browser's CORS restriction on the Instagram API
          addToLog('Exchanging code for short-lived token via Proxy...');
          
          const formData = new FormData();
          formData.append('client_id', INSTAGRAM_APP_ID);
          formData.append('client_secret', INSTAGRAM_APP_SECRET);
          formData.append('grant_type', 'authorization_code');
          formData.append('redirect_uri', redirectUri);
          formData.append('code', code);

          const shortLivedUrl = 'https://api.instagram.com/oauth/access_token';
          const proxyUrlShort = `https://corsproxy.io/?${encodeURIComponent(shortLivedUrl)}`;

          const shortRes = await fetch(proxyUrlShort, {
            method: 'POST',
            body: formData
          });

          if (!shortRes.ok) {
            const errText = await shortRes.text();
            throw new Error(`Short-lived token failed: ${errText}`);
          }

          const shortData = await shortRes.json();
          addToLog('Received Short-lived Token.');

          // 3. Exchange Short-Lived for Long-Lived (Permanent) Token
          addToLog('Exchanging for Long-lived (Permanent) token via Proxy...');
          
          const longUrl = new URL('https://graph.instagram.com/access_token');
          longUrl.searchParams.append('grant_type', 'ig_exchange_token');
          longUrl.searchParams.append('client_secret', INSTAGRAM_APP_SECRET);
          longUrl.searchParams.append('access_token', shortData.access_token);

          const proxyUrlLong = `https://corsproxy.io/?${encodeURIComponent(longUrl.toString())}`;

          const longRes = await fetch(proxyUrlLong);
          
          if (!longRes.ok) {
             const errText = await longRes.text();
             throw new Error(`Long-lived token exchange failed: ${errText}`);
          }

          const longData = await longRes.json();
          addToLog('Received Long-lived Token.');

          // 4. Prepare Data for Supabase
          const instagramData = {
            short_lived: shortData,
            long_lived: longData,
            user_profile_id: shortData.user_id, 
            updated_at: new Date().toISOString()
          };
          
          setResultData(instagramData);

          // 5. Save to Supabase 'credentials' table (using 'instragram' column as per schema)
          addToLog('Saving to Supabase credentials table...');
          
          const { data: existingRows, error: fetchError } = await supabase
            .from('credentials')
            .select('*')
            .eq('uid', user.id);

          if (fetchError) throw fetchError;

          let upsertError;
          
          if (existingRows && existingRows.length > 0) {
            // Update existing
            const { error } = await supabase
              .from('credentials')
              .update({ instragram: instagramData })
              .eq('uid', user.id);
            upsertError = error;
          } else {
            // Insert new
            const { error } = await supabase
              .from('credentials')
              .insert([
                { 
                  uid: user.id, 
                  instragram: instagramData 
                }
              ]);
             upsertError = error;
          }

          if (upsertError) throw upsertError;

          addToLog('Successfully saved to Supabase!');
          setStatus('success');

        } catch (err: any) {
          console.error(err);
          addToLog(`Error: ${err.message}`);
          setStatus('error');
        }
      }
    };

    processCallback();
  }, [code, error, user, status]);

  // Status Message for UI
  let statusMessage = log;
  if (status === 'success') statusMessage = "Success! Permanent Token saved to Supabase.\n" + log;
  if (status === 'error') statusMessage = "Failed.\n" + log;

  return (
    <CallbackView 
        code={code}
        error={error}
        errorDescription={errorDescription || statusMessage}
        backendResponse={resultData}
        fullUrl={window.location.href}
        onBack={() => {
            window.location.href = '/instagram'; 
        }} 
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Callback route */}
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route path="/oauth.html" element={<OAuthCallback />} />

          {/* Webhook Help Routes (Publicly accessible) */}
          <Route path="/webhook/facebook/data-deletion" element={<WebhookHandlerPage />} />
          <Route path="/webhook/facebook/deauthorize" element={<WebhookHandlerPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/instagram" element={<InstagramPage />} />
            <Route path="/facebook" element={<FacebookPage />} />
            
            {/* Documentation & Support */}
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
