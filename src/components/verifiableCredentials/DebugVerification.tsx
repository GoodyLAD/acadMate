import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Bug } from 'lucide-react';
import { verifiableCredentialServiceSimple } from '../../services/verifiableCredentialServiceSimple';
import { supabase } from '@/integrations/supabase/client';

export const DebugVerification: React.FC = () => {
  const [verificationToken, setVerificationToken] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDebugVerification = async () => {
    if (!verificationToken.trim()) return;

    setLoading(true);
    setDebugInfo(null);

    try {
      // Step 1: Check if credential exists in database
      const { data: vcData, error: vcError } = await supabase
        .from('verifiable_credentials')
        .select('*')
        .eq('short_token', verificationToken)
        .single();
      if (vcError || !vcData) {
        setDebugInfo({
          step: 'database_lookup',
          error: 'Credential not found in database',
          details: vcError?.message || 'No data returned',
        });
        return;
      }

      // Step 2: Check issuer
      const { data: issuer, error: issuerError } = await supabase
        .from('issuers')
        .select('*')
        .eq('id', vcData.issuer_id)
        .single();
      // Step 3: Try verification
      const verification =
        await verifiableCredentialServiceSimple.verifyCredential(
          verificationToken
        );
      // Step 4: Check JWKS
      const { data: jwksData, error: jwksError } = await supabase
        .from('issuers')
        .select('public_key_jwk, sign_key_id')
        .eq('status', 'active');
      setDebugInfo({
        step: 'complete',
        vcData,
        issuer,
        verification,
        jwksData,
        errors: {
          vcError: vcError?.message,
          issuerError: issuerError?.message,
          jwksError: jwksError?.message,
        },
      });
    } catch (error) {
      console.error('Debug verification failed:', error);
      setDebugInfo({
        step: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className='h-6 w-6 text-green-600' />;
      case 'revoked':
        return <XCircle className='h-6 w-6 text-red-600' />;
      default:
        return <AlertTriangle className='h-6 w-6 text-yellow-600' />;
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Bug className='h-6 w-6 text-red-600' />
            <span>Debug Credential Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Verification Token
              </label>
              <div className='flex space-x-2'>
                <Input
                  value={verificationToken}
                  onChange={e => setVerificationToken(e.target.value)}
                  placeholder='Enter verification token'
                  className='flex-1'
                />
                <Button
                  onClick={handleDebugVerification}
                  disabled={loading || !verificationToken.trim()}
                >
                  {loading ? 'Debugging...' : 'Debug Verify'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {debugInfo && (
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                {getStatusIcon(
                  debugInfo.step === 'complete' ? 'valid' : 'invalid'
                )}
                <span>Debug Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold mb-2'>Step: {debugInfo.step}</h3>
                  {debugInfo.error && (
                    <Alert>
                      <AlertTriangle className='h-4 w-4' />
                      <AlertDescription>
                        <strong>Error:</strong> {debugInfo.error}
                        {debugInfo.details && (
                          <div className='mt-2'>
                            <strong>Details:</strong>{' '}
                            {JSON.stringify(debugInfo.details, null, 2)}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {debugInfo.vcData && (
                  <div>
                    <h4 className='font-semibold mb-2'>Credential Data:</h4>
                    <pre className='bg-gray-100 p-3 rounded text-xs overflow-auto'>
                      {JSON.stringify(debugInfo.vcData, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.issuer && (
                  <div>
                    <h4 className='font-semibold mb-2'>Issuer Data:</h4>
                    <pre className='bg-gray-100 p-3 rounded text-xs overflow-auto'>
                      {JSON.stringify(debugInfo.issuer, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.verification && (
                  <div>
                    <h4 className='font-semibold mb-2'>Verification Result:</h4>
                    <pre className='bg-gray-100 p-3 rounded text-xs overflow-auto'>
                      {JSON.stringify(debugInfo.verification, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.jwksData && (
                  <div>
                    <h4 className='font-semibold mb-2'>JWKS Data:</h4>
                    <pre className='bg-gray-100 p-3 rounded text-xs overflow-auto'>
                      {JSON.stringify(debugInfo.jwksData, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.errors && (
                  <div>
                    <h4 className='font-semibold mb-2'>Errors:</h4>
                    <pre className='bg-red-100 p-3 rounded text-xs overflow-auto'>
                      {JSON.stringify(debugInfo.errors, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
