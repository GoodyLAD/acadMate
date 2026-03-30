// Simple API handler for Verifiable Credentials
// This can be integrated with your existing API setup

import { verifiableCredentialService } from '../services/verifiableCredentialService';
import { keyManagementService } from '../services/keyManagementService';

export const handleVerifiableCredentialsAPI = async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // JWKS endpoint (public)
    if (path === '/.well-known/jwks.json' && request.method === 'GET') {
      const jwks = await keyManagementService.getJWKS();
      return new Response(JSON.stringify(jwks), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify credential
    if (path === '/api/v1/verify' && request.method === 'GET') {
      const token = url.searchParams.get('t');

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await verifiableCredentialService.verifyCredential(token);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get credential status
    if (path.startsWith('/api/v1/status/') && request.method === 'GET') {
      const vcId = path.split('/').pop();
      if (!vcId) {
        return new Response(JSON.stringify({ error: 'VC ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const status =
        await verifiableCredentialService.getCredentialStatus(vcId);
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Issue credential (requires authentication)
    if (path === '/api/v1/credentials/issue' && request.method === 'POST') {
      const body = await request.json();

      const result = await verifiableCredentialService.issueCredential({
        activityId: body.activityId,
        studentId: body.studentId,
        evidenceIds: body.evidenceIds || [],
        issuedByUserId: body.issuedByUserId || 'system',
        activityData: body.activityData,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get credential by ID
    if (path.startsWith('/api/v1/credentials/') && request.method === 'GET') {
      const vcId = path.split('/').pop();
      if (!vcId) {
        return new Response(JSON.stringify({ error: 'VC ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const credential = await verifiableCredentialService.getCredential(vcId);
      if (!credential) {
        return new Response(JSON.stringify({ error: 'Credential not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(credential), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get student credentials
    if (path === '/api/v1/credentials/student' && request.method === 'GET') {
      const studentId = url.searchParams.get('studentId');
      if (!studentId) {
        return new Response(JSON.stringify({ error: 'Student ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const credentials =
        await verifiableCredentialService.getStudentCredentials(studentId);
      return new Response(JSON.stringify(credentials), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// For development, you can add this to your main.tsx or create a simple server
export const setupVerifiableCredentialsAPI = () => {
  // This is a placeholder for setting up the API
  // In a real implementation, you would integrate this with your existing API setup
};
