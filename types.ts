// Facebook SDK Types
export interface FbLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FbAuthResponse | null;
}

export interface FbAuthResponse {
  accessToken?: string;
  code?: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
  grantedScopes?: string;
  reauthorize_required_in?: number;
}

export interface FbLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  enable_profile_selector?: boolean;
  profile_selector_ids?: string;
  config_id?: string; // Critical for Embedded Signup V3
  response_type?: string;
  override_default_response_type?: boolean;
  extras?: Record<string, any>;
}

export interface FbWindow extends Window {
  FB: {
    init: (params: {
      appId: string;
      cookie?: boolean;
      xfbml?: boolean;
      version: string;
    }) => void;
    login: (
      callback: (response: FbLoginStatusResponse) => void,
      options?: FbLoginOptions
    ) => void;
    api: (path: string, ...args: any[]) => void;
    getLoginStatus: (callback: (response: FbLoginStatusResponse) => void) => void;
  };
  fbAsyncInit: () => void;
}

// App State Types
export interface DebugLog {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'event';
  message: string;
  data?: any;
}

export interface UserProfile {
  name: string;
  id: string;
  businesses?: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
}