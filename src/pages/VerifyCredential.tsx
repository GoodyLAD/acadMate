import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Calendar,
  Building,
  ExternalLink,
  Key,
} from 'lucide-react';
import {
  verifiableCredentialService,
  VerificationResult,
} from '../services/verifiableCredentialService';

const VerifyCredential: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('t');

  useEffect(() => {
    if (token) {
      verifyCredential(token);
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token]);

  const verifyCredential = async (verificationToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const result =
        await verifiableCredentialService.verifyCredential(verificationToken);
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-gray-600'>Verifying credential...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <XCircle className='h-12 w-12 text-red-600 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Verification Failed
              </h2>
              <p className='text-gray-600'>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <AlertTriangle className='h-12 w-12 text-yellow-600 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                No Credential Found
              </h2>
              <p className='text-gray-600'>
                The verification token is invalid or expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Credential Verification
          </h1>
          <p className='text-gray-600'>
            Verify the authenticity of a digital credential
          </p>
        </div>

        {/* Status Alert */}
        <Alert
          className={`mb-6 ${verificationResult.status === 'valid' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
        >
          <div className='flex items-center space-x-2'>
            {getStatusIcon(verificationResult.status)}
            <AlertDescription>
              <strong>
                {verificationResult.status === 'valid' && 'Credential Valid'}
                {verificationResult.status === 'revoked' &&
                  'Credential Revoked'}
                {verificationResult.status === 'invalid' &&
                  'Credential Invalid'}
              </strong>
              {verificationResult.status === 'valid' &&
                ' - Digital signature verified and credential is active'}
              {verificationResult.status === 'revoked' &&
                ' - This credential has been revoked by the issuer'}
              {verificationResult.status === 'invalid' &&
                ' - This credential could not be verified'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Main Verification Card */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='bg-blue-100 p-2 rounded-full'>
                  <Shield className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Verification Report</CardTitle>
                  <p className='text-gray-600'>
                    Credential ID: {verificationResult.vcId}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(verificationResult.status)}>
                {verificationResult.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Issuer Information */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                <Building className='h-5 w-5 mr-2' />
                Issuer Information
              </h3>
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Issuer Name
                    </p>
                    <p className='text-gray-900'>
                      {verificationResult.issuer.name}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Issuer ID
                    </p>
                    <p className='text-gray-900 font-mono text-sm'>
                      {verificationResult.issuer.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Details */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
                <Key className='h-5 w-5 mr-2' />
                Verification Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    {verificationResult.signatureValid ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <span className='text-sm font-medium'>
                      Digital Signature
                    </span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {verificationResult.signatureValid ? 'Valid' : 'Invalid'}
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    {!verificationResult.revoked ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <span className='text-sm font-medium'>
                      Revocation Status
                    </span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {verificationResult.revoked ? 'Revoked' : 'Active'}
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    {verificationResult.evidenceValidated ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                    <span className='text-sm font-medium'>Evidence Files</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {verificationResult.evidenceValidated
                      ? 'Validated'
                      : 'Not Validated'}
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span className='text-sm font-medium'>Issued Date</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {formatDate(verificationResult.issuedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revocation Details */}
            {verificationResult.revoked && (
              <div>
                <h3 className='text-lg font-semibold text-red-900 mb-3 flex items-center'>
                  <XCircle className='h-5 w-5 mr-2' />
                  Revocation Details
                </h3>
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm font-medium text-red-700'>
                        Revoked Date
                      </p>
                      <p className='text-red-900'>
                        {verificationResult.revokedAt &&
                          formatDate(verificationResult.revokedAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-red-700'>Reason</p>
                      <p className='text-red-900'>
                        {verificationResult.revocationReason ||
                          'No reason provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {verificationResult.errors &&
              verificationResult.errors.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold text-red-900 mb-3 flex items-center'>
                    <AlertTriangle className='h-5 w-5 mr-2' />
                    Verification Errors
                  </h3>
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <ul className='space-y-1'>
                      {verificationResult.errors.map((error, index) => (
                        <li key={index} className='text-sm text-red-700'>
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3 pt-4 border-t'>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='flex-1'
              >
                Verify Another Credential
              </Button>

              {verificationResult.status === 'valid' && (
                <Button
                  onClick={() =>
                    window.open(
                      `https://jwt.io/?token=${verificationResult.vcId}`,
                      '_blank'
                    )
                  }
                  variant='outline'
                  className='flex-1'
                >
                  <ExternalLink className='h-4 w-4 mr-2' />
                  View on JWT.io
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='text-center text-sm text-gray-500'>
          <p>
            Powered by Smart Student Hub •
            <a
              href='/.well-known/jwks.json'
              className='text-blue-600 hover:underline ml-1'
            >
              Public Keys
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;
