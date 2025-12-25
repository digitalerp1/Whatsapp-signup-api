import React from 'react';
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

// OAuth Callback Route Helper
const OAuthCallback: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const error = params.get('error') || params.get('error_code') || '';
  const errorDescription = params.get('error_message') || params.get('error_description') || '';

  return (
    <CallbackView 
        code={code}
        error={error}
        errorDescription={errorDescription}
        fullUrl={window.location.href}
        onBack={() => {
            window.location.href = '/whatsapp';
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