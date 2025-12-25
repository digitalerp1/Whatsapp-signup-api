import React from 'react';

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Help Center</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">How to use WhatsApp Embedded Signup?</h3>
            <p className="text-slate-600">
                Navigate to the <strong>WhatsApp Manager</strong> tab. Ensure your Facebook account has administrative rights to the business manager. Click "Log In with Facebook" to start the flow. Once completed, the app will capture the access token.
            </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">My Popup is blocked?</h3>
            <p className="text-slate-600">
                Please ensure your browser allows popups from this domain. If the popup closes immediately, check the "Application Logs" section in the dashboard for error details.
            </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Contact Support</h3>
            <p className="text-slate-600">
                For additional support, please contact the developer team at <a href="mailto:support@example.com" className="text-indigo-600 underline">support@example.com</a>.
            </p>
        </div>
      </div>
    </div>
  );
};