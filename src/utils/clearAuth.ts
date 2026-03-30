// Clear Authentication State
// Use this to fix token refresh issues

export const clearAuthState = () => {
  // Clear Supabase auth tokens
  const keysToRemove = [
    'sb-kzptmfomlanqiuiqjtfj-auth-token',
    'supabase.auth.token',
    'supabase.auth.refresh_token',
    'supabase.auth.access_token',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Clear any other auth-related keys
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      sessionStorage.removeItem(key);
    }
  });
  // Redirect to login
  window.location.href = '/auth';
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).clearAuth = clearAuthState;
}
