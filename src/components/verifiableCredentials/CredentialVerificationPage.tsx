import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, QrCode } from 'lucide-react';
import { verifiableCredentialServiceSimple } from '../../services/verifiableCredentialServiceSimple';

export const CredentialVerificationPage: React.FC = () => {
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!verificationToken.trim()) return;

    setLoading(true);
    try {
      const result =
        await verifiableCredentialServiceSimple.verifyCredential(
          verificationToken
        );
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        status: 'invalid',
        errors: ['Verification failed'],
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'revoked':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <QrCode className='h-6 w-6 text-blue-600' />
            <span>Verify Credential</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Verification Token or QR Code URL
              </label>
              <div className='flex space-x-2'>
                <Input
                  value={verificationToken}
                  onChange={e => setVerificationToken(e.target.value)}
                  placeholder='Enter verification token or scan QR code'
                  className='flex-1'
                />
                <Button
                  onClick={handleVerification}
                  disabled={loading || !verificationToken.trim()}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>

            <div className='text-sm text-gray-600'>
              <p>You can verify a credential by:</p>
              <ul className='list-disc list-inside mt-1 space-y-1'>
                <li>Scanning the QR code from a credential</li>
                <li>Pasting the verification URL</li>
                <li>Entering the short token directly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card className={getStatusColor(verificationResult.status)}>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              {getStatusIcon(verificationResult.status)}
              <span>Verification Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>Status:</span>
                <Badge
                  variant={
                    verificationResult.status === 'valid'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {verificationResult.status.toUpperCase()}
                </Badge>
              </div>

              {verificationResult.status === 'valid' && (
                <div className='space-y-3'>
                  <div>
                    <h3 className='font-semibold text-lg'>
                      {verificationResult.credentialSubject?.title ||
                        'Credential'}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Issued by:{' '}
                      {verificationResult.issuer?.name || 'Unknown Issuer'}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='font-medium'>Activity Type:</span>
                      <p>
                        {verificationResult.credentialSubject?.activityType ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Role:</span>
                      <p>
                        {verificationResult.credentialSubject?.role || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Organizer:</span>
                      <p>
                        {verificationResult.credentialSubject?.organizer ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Hours:</span>
                      <p>
                        {verificationResult.credentialSubject?.hours || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Issued Date:</span>
                      <p>
                        {verificationResult.issuedAt
                          ? new Date(
                              verificationResult.issuedAt
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium'>Location:</span>
                      <p>
                        {verificationResult.credentialSubject?.location ||
                          'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className='flex space-x-2'>
                    <Badge variant='outline'>
                      Signature:{' '}
                      {verificationResult.signatureValid ? 'Valid' : 'Invalid'}
                    </Badge>
                    <Badge variant='outline'>
                      Evidence:{' '}
                      {verificationResult.evidenceValidated
                        ? 'Validated'
                        : 'Not Validated'}
                    </Badge>
                  </div>
                </div>
              )}

              {verificationResult.status === 'revoked' && (
                <Alert>
                  <XCircle className='h-4 w-4' />
                  <AlertDescription>
                    This credential has been revoked.
                    {verificationResult.revocationReason && (
                      <span>
                        {' '}
                        Reason: {verificationResult.revocationReason}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {verificationResult.errors &&
                verificationResult.errors.length > 0 && (
                  <Alert>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription>
                      <div>
                        <p className='font-medium'>Verification Errors:</p>
                        <ul className='list-disc list-inside mt-1'>
                          {verificationResult.errors.map(
                            (error: string, index: number) => (
                              <li key={index}>{error}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
