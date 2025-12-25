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
import { CallbackView } from './components/CallbackView';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// Constants
const BACKEND_URL = 'https://whatsapp-api.digitalerp.shop';

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
  const { user } = useAuth();
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<string>('');

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const error = params.get('error') || params.get('error_code') || '';
  const errorDescription = params.get('error_message') || params.get('error_description') || '';

  useEffect(() => {
    const sendCodeToBackend = async () => {
      if (code && !error && user && sendStatus === 'idle') {
        setSendStatus('sending');
        try {
          const payload = {
            event: 'oauth_callback_received',
            timestamp: new Date().toISOString(),
            provider: 'instagram_or_facebook', // Can be inferred from context if needed
            code: code,
            app_user: {
              id: user.id,
              email: user.email,
              aud: user.aud
            },
            origin: window.location.origin,
            full_url: window.location.href
          };

          const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            setSendStatus('success');
            setApiResponse('Successfully transmitted credentials to server.');
          } else {
            setSendStatus('error');
            setApiResponse(`Server Error: ${response.status} ${response.statusText}`);
          }
        } catch (err: any) {
          setSendStatus('error');
          setApiResponse(`Network Error: ${err.message}`);
        }
      }
    };

    sendCodeToBackend();
  }, [code, error, user, sendStatus]);

  // Inject status into the view description
  let statusMessage = "";
  if (sendStatus === 'sending') statusMessage = "Sending credentials to server...";
  if (sendStatus === 'success') statusMessage = "Credentials successfully saved to backend.";
  if (sendStatus === 'error') statusMessage = "Failed to sync with backend: " + apiResponse;

  return (
    <CallbackView 
        code={code}
        error={error}
        errorDescription={errorDescription || statusMessage}
        fullUrl={window.location.href}
        onBack={() => {
            // Determine where to go back based on history or default to dashboard
            window.location.href = '/instagram'; // Defaulting to Instagram as that's the likely source
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
          
          {/* Callback route must be inside AuthProvider to access user context */}
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route path="/oauth.html" element={<OAuthCallback />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/instagram" element={<InstagramPage />} />
            <Route path="/facebook" element={<FacebookPage />} />
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