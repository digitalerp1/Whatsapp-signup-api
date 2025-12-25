import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-slate bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <p>Last updated: December 22, 2025</p>
        <p>Your privacy is important to us. It is SocialSuite's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <h3>1. Information We Collect</h3>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
        <h3>2. Log Data</h3>
        <p>When you visit our website, our servers may automatically log the standard data provided by your web browser.</p>
        <h3>3. Facebook Data</h3>
        <p>We use Facebook SDK to authenticate you for specific business management features. We do not store your Facebook Access Tokens permanently on our servers without your explicit permission.</p>
      </div>
    </div>
  );
};