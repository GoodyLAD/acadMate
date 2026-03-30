// Authentication Error Handler
// Handles Supabase auth errors and provides recovery options

import { supabase } from '@/integrations/supabase/client';

export const handleAuthError = async (error: any) => {
  console.error('Auth error:', error);

  // Check if it's a token refresh error
  if (error?.message?.includes('refresh_token') || error?.status === 400) {
    try {
      // Clear the current session
      await supabase.auth.signOut();

      // Clear localStorage
      localStorage.removeItem('sb-kzptmfomlanqiuiqjtfj-auth-token');
      localStorage.removeItem('supabase.auth.token');

      // Redirect to login page
      window.location.href = '/auth';
    } catch (clearError) {
      console.error('Error clearing session:', clearError);
      // Force redirect anyway
      window.location.href = '/auth';
    }
  }
};

// Enhanced Supabase client with error handling
export const createSupabaseClientWithErrorHandling = () => {
  const client = supabase;

  // Override the auth methods to handle errors
  const originalSignIn = client.auth.signInWithPassword;
  const originalSignUp = client.auth.signUp;
  const originalSignOut = client.auth.signOut;

  client.auth.signInWithPassword = async credentials => {
    try {
      return await originalSignIn(credentials);
    } catch (error) {
      await handleAuthError(error);
      throw error;
    }
  };

  client.auth.signUp = async options => {
    try {
      return await originalSignUp(options);
    } catch (error) {
      await handleAuthError(error);
      throw error;
    }
  };

  client.auth.signOut = async () => {
    try {
      return await originalSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear localStorage anyway
      localStorage.removeItem('sb-kzptmfomlanqiuiqjtfj-auth-token');
      localStorage.removeItem('supabase.auth.token');
      throw error;
    }
  };

  return client;
};
