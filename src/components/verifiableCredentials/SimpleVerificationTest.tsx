import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Bug } from 'lucide-react';
import { keyManagementService } from '../../services/keyManagementService';
import { supabase } from '@/integrations/supabase/client';

export const SimpleVerificationTest: React.FC = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testVerification = async () => {
    if (!token.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Step 1: Get credential from database
      const { data: vcData, error: vcError } = await supabase
        .from('verifiable_credentials')
        .select('*')
        .eq('short_token', token)
        .single();
      if (vcError || !vcData) {
        setResult({
          step: 'database',
          success: false,
          error: 'Credential not found in database',
          details: vcError?.message,
        });
        return;
      }

      // Step 2: Check if we have a JWS
      const credential = vcData.credential_json;
      const jws = credential.proof?.jws;
      if (!jws) {
        setResult({
          step: 'jws',
          success: false,
          error: 'No JWS found in credential proof',
          details: 'The credential does not have a valid signature',
        });
        return;
      }

      // Step 3: Try to verify the JWS
      try {
        const verification = await keyManagementService.verifyJWT(jws);
        setResult({
          step: 'verification',
          success: true,
          message: 'Credential verification successful',
          details: {
            credential: credential,
            verification: verification,
            jws: jws,
          },
        });
      } catch (verifyError) {
        console.error('JWT verification failed:', verifyError);

        setResult({
          step: 'verification',
          success: false,
          error: 'JWT verification failed',
          details:
            verifyError instanceof Error
              ? verifyError.message
              : 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        step: 'error',
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Bug className='h-6 w-6 text-blue-600' />
            <span>Simple Verification Test</span>
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
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder='Enter verification token'
                  className='flex-1'
                />
                <Button
                  onClick={testVerification}
                  disabled={loading || !token.trim()}
                >
                  {loading ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              {result.success ? (
                <CheckCircle className='h-6 w-6 text-green-600' />
              ) : (
                <XCircle className='h-6 w-6 text-red-600' />
              )}
              <span>Test Result - Step: {result.step}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {result.success ? (
                <Alert>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>
                    <strong>Success:</strong> {result.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <XCircle className='h-4 w-4' />
                  <AlertDescription>
                    <strong>Error:</strong> {result.error}
                    {result.details && (
                      <div className='mt-2'>
                        <strong>Details:</strong> {result.details}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {result.details && typeof result.details === 'object' && (
                <div>
                  <h4 className='font-semibold mb-2'>Full Details:</h4>
                  <pre className='bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96'>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
