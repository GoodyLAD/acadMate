// Environment configuration for Verifiable Credentials
export const config = {
  baseUrl: import.meta.env.VITE_BASE_URL || window.location.origin,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Helper function to get the base URL
export const getBaseUrl = () => {
  return config.baseUrl;
};

// Helper function to get verification URL
export const getVerificationUrl = (token: string) => {
  return `${getBaseUrl()}/verify?t=${token}`;
};

// Helper function to get credential URL
export const getCredentialUrl = (vcId: string) => {
  return `${getBaseUrl()}/api/v1/credentials/${vcId}`;
};

// Helper function to get status URL
export const getStatusUrl = (vcId: string) => {
  return `${getBaseUrl()}/api/v1/status/${vcId}`;
};
