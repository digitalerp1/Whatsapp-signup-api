import React from 'react';
import { JsonDisplay } from '../components/JsonDisplay';
import { FileJson, Webhook, Database, Lock } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  // Example Data: Instagram OAuth Callback
  const instagramPayload = {
    event: 'oauth_callback_received',
    timestamp: '2025-10-24T10:00:00.000Z',
    provider: 'instagram',
    code: 'AQBy... (Long Auth Code) ...',
    redirect_uri: 'https://whatsapp-signup-api.pages.dev/oauth',
    app_user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      aud: 'authenticated',
      role: 'authenticated'
    },
    supabase_session: {
      access_token: "eyJhbGciOiJIUzI1NiIsIn...",
      refresh_token: "cF9... (RefreshToken) ...",
      expires_at: 1735312345,
      token_type: "bearer"
    },
    context: {
      origin: 'https://whatsapp-signup-api.pages.dev',
      full_url: 'https://whatsapp-signup-api.pages.dev/oauth?code=AQBy...',
      user_agent: 'Mozilla/5.0 ...'
    }
  };

  // Example Data: WhatsApp Connection
  const whatsappPayload = {
    event: 'facebook_connected',
    timestamp: '2025-10-24T10:15:00.000Z',
    app_user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com'
    },
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

  // Example Data: Facebook Data Deletion
  const deletionPayload = {
    signed_request: "Encoded_JWT_String_From_Facebook..."
  };
  
  // Decoded Deletion Payload (Mental Model)
  const decodedDeletion = {
    user_id: "1234567890",
    algorithm: "HMAC-SHA256",
    issued_at: 1234567890
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileJson className="text-indigo-600" size={32} />
          API Request Documentation
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Reference for JSON payloads sent by this frontend application to your backend servers.
        </p>
      </div>

      {/* Section 1: Instagram (Worker) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-pink-50 to-white flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Webhook size={20} className="text-pink-600" />
               Instagram OAuth Callback
             </h2>
             <p className="text-xs text-slate-500 mt-1">Sent when a user successfully logs in via Instagram.</p>
           </div>
           <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-mono rounded border border-green-200">
             POST
           </span>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-50 p-3 rounded border border-slate-100">
               <span className="block text-xs font-bold text-slate-400 uppercase">Target URL</span>
               <code className="text-slate-700">https://api.teamdigitalerp.workers.dev</code>
             </div>
             <div className="bg-slate-50 p-3 rounded border border-slate-100">
               <span className="block text-xs font-bold text-slate-400 uppercase">Event Type</span>
               <code className="text-slate-700">oauth_callback_received</code>
             </div>
          </div>

          <JsonDisplay title="Example Request Body" data={instagramPayload} />
        </div>
      </section>

      {/* Section 2: WhatsApp Connection */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-white flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Webhook size={20} className="text-green-600" />
               WhatsApp / Facebook Login
             </h2>
             <p className="text-xs text-slate-500 mt-1">Sent when a user connects their Facebook account for WhatsApp.</p>
           </div>
           <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-mono rounded border border-green-200">
             POST
           </span>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <span className="block text-xs font-bold text-slate-400 uppercase">Target URL</span>
            <code className="text-slate-700">https://whatsapp-api.digitalerp.shop</code>
          </div>

          <JsonDisplay title="Example Request Body" data={whatsappPayload} />
        </div>
      </section>

      {/* Section 3: Facebook Webhooks */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
           <div>
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Lock size={20} className="text-blue-600" />
               Facebook Data Deletion / Deauthorize
             </h2>
             <p className="text-xs text-slate-500 mt-1">Incoming POST requests from Facebook to your Backend.</p>
           </div>
           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded border border-blue-200">
             INCOMING POST
           </span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-4 flex-col md:flex-row">
             <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Endpoint 1: Data Deletion</h3>
                <code className="block bg-slate-800 text-white p-2 rounded text-xs mb-2">/webhook/facebook/data-deletion</code>
                <p className="text-xs text-slate-500">
                    Received when a user removes the app via Facebook Settings &gt; Apps and Websites &gt; Remove &gt; Remove Data.
                </p>
             </div>
             <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Endpoint 2: Deauthorize</h3>
                <code className="block bg-slate-800 text-white p-2 rounded text-xs mb-2">/webhook/facebook/deauthorize</code>
                <p className="text-xs text-slate-500">
                    Received when a user removes the app via Facebook Settings but does not explicitly request data deletion.
                </p>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
             <h4 className="text-sm font-bold text-slate-700 mb-3">Payload Format</h4>
             <p className="text-xs text-slate-500 mb-3">Facebook sends data as <code>application/x-www-form-urlencoded</code> containing a <code>signed_request</code>.</p>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <JsonDisplay title="Raw Body (x-www-form-urlencoded)" data={deletionPayload} />
                <JsonDisplay title="Decoded signed_request JSON" data={decodedDeletion} />
             </div>
          </div>
        </div>
      </section>

    </div>
  );
};