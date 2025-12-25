import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms & Conditions</h1>
      <div className="prose prose-slate bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h3>1. Terms</h3>
        <p>By accessing the website at SocialSuite, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        <h3>2. Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on SocialSuite's website for personal, non-commercial transitory viewing only.</p>
        <h3>3. Disclaimer</h3>
        <p>The materials on SocialSuite's website are provided on an 'as is' basis. SocialSuite makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      </div>
    </div>
  );
};