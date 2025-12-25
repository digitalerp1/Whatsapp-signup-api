import React from 'react';
import { useLocation } from 'react-router-dom';
import { Server, ShieldAlert, Code, Copy, Check } from 'lucide-react';

export const WebhookHandlerPage: React.FC = () => {
  const location = useLocation();
  const [copied, setCopied] = React.useState(false);

  // Determine which webhook is being accessed based on URL
  const isDeauth = location.pathname.includes('deauthorize');
  const title = isDeauth ? 'Deauthorization Callback' : 'Data Deletion Request';
  const endpoint = isDeauth ? '/webhook/facebook/deauthorize' : '/webhook/facebook/data-deletion';

  const backendCode = `
/* 
  ------------------------------------------------------------------
  NODE.JS / EXPRESS BACKEND HANDLER
  ------------------------------------------------------------------
  Deploy this code to: https://whatsapp-api.digitalerp.shop
  Ensure you have the 'body-parser' or 'express.json' middleware.
*/

const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Your Facebook App Secret (Keep this secure!)
const APP_SECRET = process.env.FB_APP_SECRET || 'your_app_secret_here';

// Helper: Decode Signed Request
function parseSignedRequest(signedRequest, appSecret) {
  try {
    const [encodedSig, payload] = signedRequest.split('.');
    
    // Decode payload
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Verify Signature (Optional but recommended for security)
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=/g, '');
      
    if (encodedSig !== expectedSig) {
      console.warn('Signature mismatch');
      // return null; // Uncomment to enforce signature check
    }
    
    return data;
  } catch (e) {
    console.error('Error parsing signed request', e);
    return null;
  }
}

// Route: ${endpoint}
app.post('${endpoint}', (req, res) => {
  console.log('Received POST to ${endpoint}');
  
  const signedRequest = req.body.signed_request;
  if (!signedRequest) {
    return res.status(400).send('No signed_request provided');
  }

  const data = parseSignedRequest(signedRequest, APP_SECRET);
  if (!data) {
    return res.status(400).send('Invalid signed_request');
  }

  const userId = data.user_id;
  console.log('${isDeauth ? 'Deauthorizing' : 'Deleting data for'} User:', userId);

  // TODO: Perform database operations here
  // 1. Find user by userId (Facebook ID)
  // 2. ${isDeauth ? 'Mark as inactive / remove tokens' : 'Delete PII data'}

  // Response for Facebook
  const confirmationCode = 'del_' + Date.now(); // Unique code
  const statusUrl = 'https://whatsapp-signup-api.pages.dev/deletion-status?code=' + confirmationCode;

  res.json({
    url: statusUrl,
    confirmation_code: confirmationCode
  });
});

app.get('${endpoint}', (req, res) => {
  res.status(405).send('This is a webhook endpoint. It expects a POST request from Facebook.');
});
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(backendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm">
         <h1 className="text-xl font-bold text-amber-800 flex items-center gap-3">
            <Server size={28} />
            {title} - Browser View
         </h1>
         <p className="mt-3 text-amber-800 leading-relaxed">
            <strong>Warning:</strong> You are viewing this page in a browser (GET Request). <br/>
            Facebook communicates with this URL via <strong>POST</strong> requests sent directly from their servers to yours.
         </p>
         
         <div className="mt-4 flex gap-3 text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
            <ShieldAlert className="shrink-0" size={20} />
            <div>
              <p className="font-semibold">Action Required:</p>
              <p>
                Since this application is the Frontend (User Interface), it cannot process secure webhook events directly.
                You must copy the code below and deploy it to your Backend server at <code>https://whatsapp-api.digitalerp.shop</code>.
              </p>
            </div>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Code size={20} className="text-indigo-600" />
                Backend Implementation Code (Node.js)
            </h2>
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                    copied 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
            </button>
        </div>
        
        <div className="bg-[#1e1e1e] p-6 overflow-x-auto custom-scrollbar">
            <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                {backendCode}
            </pre>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500">
            Paste this into your <code>server.js</code> or main backend file.
        </div>
      </div>
    </div>
  );
};