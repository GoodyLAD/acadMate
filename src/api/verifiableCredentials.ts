import { createClient } from '@supabase/supabase-js';
import { verifiableCredentialService } from '../services/verifiableCredentialService';
import { keyManagementService } from '../services/keyManagementService';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// Middleware to check authentication
const authenticateUser = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  return user;
};

// Middleware to check admin role
const requireAdmin = async (req: Request) => {
  const user = await authenticateUser(req);
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export default async function handler(req: Request) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // JWKS endpoint (public)
    if (path === '/.well-known/jwks.json' && req.method === 'GET') {
      const jwks = await keyManagementService.getJWKS();
      return new Response(JSON.stringify(jwks), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Issue credential
    if (path === '/api/v1/credentials/issue' && req.method === 'POST') {
      const user = await authenticateUser(req);
      const body = await req.json();

      const result = await verifiableCredentialService.issueCredential({
        activityId: body.activityId,
        studentId: body.studentId,
        evidenceIds: body.evidenceIds || [],
        issuedByUserId: user.id,
        activityData: body.activityData,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get credential by ID
    if (path.startsWith('/api/v1/credentials/') && req.method === 'GET') {
      const vcId = path.split('/').pop();
      if (!vcId) {
        throw new Error('VC ID required');
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

    // Revoke credential
    if (
      path.startsWith('/api/v1/credentials/') &&
      path.endsWith('/revoke') &&
      req.method === 'POST'
    ) {
      const user = await requireAdmin(req);
      const vcId = path.split('/')[3];
      const body = await req.json();

      const success = await verifiableCredentialService.revokeCredential(
        vcId,
        user.id,
        body.reason || 'No reason provided'
      );

      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify credential
    if (path === '/api/v1/verify' && req.method === 'GET') {
      const url = new URL(req.url);
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
    if (path.startsWith('/api/v1/status/') && req.method === 'GET') {
      const vcId = path.split('/').pop();
      if (!vcId) {
        throw new Error('VC ID required');
      }

      const status =
        await verifiableCredentialService.getCredentialStatus(vcId);
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get student credentials
    if (path === '/api/v1/credentials/student' && req.method === 'GET') {
      const user = await authenticateUser(req);
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const credentials =
        await verifiableCredentialService.getStudentCredentials(profile.id);
      return new Response(JSON.stringify(credentials), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create issuer (admin only)
    if (path === '/api/v1/issuers' && req.method === 'POST') {
      const body = await req.json();

      const issuer = await keyManagementService.createIssuer(
        body.name,
        body.did
      );
      return new Response(JSON.stringify(issuer), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rotate issuer key (admin only)
    if (
      path.startsWith('/api/v1/issuers/') &&
      path.endsWith('/rotate') &&
      req.method === 'POST'
    ) {
      const issuerId = path.split('/')[3];

      const newKeyPair = await keyManagementService.rotateIssuerKey(issuerId);
      return new Response(
        JSON.stringify({
          success: true,
          newKeyId: newKeyPair.kid,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
}
