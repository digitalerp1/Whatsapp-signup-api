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
import { ApiDocsPage } from './pages/ApiDocsPage'; // New Import
import { CallbackView } from './components/CallbackView';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// Constants
const DEFAULT_BACKEND_URL = 'https://whatsapp-api.digitalerp.shop';
const WORKER_BACKEND_URL = 'https://api.teamdigitalerp.workers.dev';

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

// OAuth Callback Route Helper with Auto-Send
const OAuthCallback: React.FC = () => {
  const { user, session } = useAuth(); // Added session to get tokens
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [backendData, setBackendData] = useState<any>(null);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const error = params.get('error') || params.get('error_code') || '';
  const errorDescription = params.get('error_message') || params.get('error_description') || '';

  useEffect(() => {
    const sendCodeToBackend = async () => {
      if (code && !error && user && sendStatus === 'idle') {
        setSendStatus('sending');
        try {
          // Determine the redirect URI exactly as it was calculated in InstagramPage
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const origin = isLocal ? window.location.origin : 'https://whatsapp-signup-api.pages.dev';
          const redirectUri = `${origin}/oauth`;

          // Construct Complete Data Payload
          const payload = {
            event: 'oauth_callback_received',
            timestamp: new Date().toISOString(),
            provider: 'instagram',
            code: code, // The temporary authorization code
            redirect_uri: redirectUri, // Required for the backend to exchange the code
            app_user: {
              id: user.id,
              email: user.email,
              aud: user.aud,
              role: user.role
            },
            // Added Supabase Credentials
            supabase_session: {
                access_token: session?.access_token,
                refresh_token: session?.refresh_token,
                expires_at: session?.expires_at,
                token_type: session?.token_type
            },
            context: {
              origin: window.location.origin,
              full_url: window.location.href,
              user_agent: navigator.userAgent
            }
          };

          // Sending to the specific Worker URL as requested
          const response = await fetch(WORKER_BACKEND_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            setSendStatus('success');
            // Try to parse JSON to display details if the server returns them
            try {
                const json = await response.json();
                setBackendData(json);
                setApiResponse('Successfully transmitted data to Worker. See response below.');
            } catch (e) {
                setApiResponse('Successfully transmitted credentials to Worker.');
            }
          } else {
            setSendStatus('error');
            const text = await response.text();
            setApiResponse(`Worker Error: ${response.status} - ${text}`);
          }
        } catch (err: any) {
          setSendStatus('error');
          setApiResponse(`Network Error: ${err.message}`);
        }
      }
    };

    sendCodeToBackend();
  }, [code, error, user, session, sendStatus]);

  // Inject status into the view description
  let statusMessage = "";
  if (sendStatus === 'sending') statusMessage = "Sending complete data (including Supabase session) to Worker...";
  if (sendStatus === 'success') statusMessage = apiResponse;
  if (sendStatus === 'error') statusMessage = "Failed to sync with backend: " + apiResponse;

  return (
    <CallbackView 
        code={code}
        error={error}
        errorDescription={errorDescription || statusMessage}
        backendResponse={backendData}
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