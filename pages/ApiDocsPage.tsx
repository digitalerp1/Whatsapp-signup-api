import React from 'react';
import { JsonDisplay } from '../components/JsonDisplay';
import { FileJson, Webhook, Database, Lock } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  // Example Data: Instagram OAuth Callback
  const instagramPayload = {
    short_lived: {
        access_token: "IGQWR...",
        user_id: 1234567890
    },
    long_lived: {
        access_token: "IGQWR... (Long Lived)",
        token_type: "bearer",
        expires_in: 5184000
    },
    user_profile_id: 1234567890,
    updated_at: "2025-10-24T10:00:00.000Z"
  };

  // Example Data: WhatsApp Connection
  const whatsappPayload = {
    event: 'facebook_connected',
    timestamp: '2025-10-24T10:15:00.000Z',
    facebook_auth: {
      accessToken: 'EAAG...',
      userID: '1000123456789',
      expiresIn: 5184000,
      signedRequest: 'XXXYYYZZZ...'
    },
    facebook_profile: {
      name: 'John Doe',
      id: '1000123456789'
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileJson className="text-indigo-600" size={32} />
          Data Storage Documentation
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Reference for the JSON data structures stored in your Supabase `credentials` table.
        </p>
      </div>

      {/* Section 1: Instagram (Saved to 'instragram' column) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-pink-50 to-white flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Database size={20} className="text-pink-600" />
               Instagram Column (credentials.instragram)
             </h2>
             <p className="text-xs text-slate-500 mt-1">Stored after successful token exchange (Short & Long lived).</p>
           </div>
           <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-mono rounded border border-indigo-200">
             JSONB
           </span>
        </div>
        
        <div className="p-6 space-y-4">
          <JsonDisplay title="Stored JSON Structure" data={instagramPayload} />
        </div>
      </section>

      {/* Section 2: WhatsApp Connection */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-white flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Database size={20} className="text-green-600" />
               WhatsApp Column (credentials.whatsapp)
             </h2>
             <p className="text-xs text-slate-500 mt-1">Stored when a user connects via Facebook Login/Embedded Signup.</p>
           </div>
           <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-mono rounded border border-indigo-200">
             JSONB
           </span>
        </div>
        
        <div className="p-6 space-y-4">
          <JsonDisplay title="Stored JSON Structure" data={whatsappPayload} />
        </div>
      </section>

    </div>
  );
};