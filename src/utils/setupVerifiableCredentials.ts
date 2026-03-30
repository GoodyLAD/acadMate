// Setup script for Verifiable Credentials system
import { supabase } from '../integrations/supabase/client';

export const setupVerifiableCredentials = async () => {
  try {
    // Check if default issuer exists
    const { data: existingIssuer, error: issuerError } = await supabase
      .from('issuers')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (issuerError && issuerError.code === 'PGRST116') {
      // Create default issuer
    } else if (existingIssuer) {
      /* no-op */
    }
    return true;
  } catch (error) {
    console.error('Error setting up Verifiable Credentials:', error);
    return false;
  }
};

// Auto-setup when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setupVerifiableCredentials().catch(console.error);
}
