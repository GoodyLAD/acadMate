import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, CheckCircle } from 'lucide-react';
import { verifiableCredentialServiceSimple } from '../../services/verifiableCredentialServiceSimple';
import { useProfile } from '../../hooks/useProfile';

export const StudentCredentialsView: React.FC = () => {
  const { profile } = useProfile();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadCredentials();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const studentCredentials =
        await verifiableCredentialServiceSimple.getStudentCredentials(
          profile.id
        );
      setCredentials(studentCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCredential = (credential: any) => {
    const dataStr = JSON.stringify(credential, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `credential-${credential.id.split(':').pop()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>Loading credentials...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <CheckCircle className='h-6 w-6 text-green-600' />
            <span>My Verifiable Credentials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <CheckCircle className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No credentials issued yet</p>
              <p className='text-sm'>
                Complete activities to earn verifiable credentials
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {credentials.map((credential, index) => (
                <Card key={index} className='border-l-4 border-l-green-500'>
                  <CardContent className='p-4'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-lg'>
                          {credential.credentialSubject?.title ||
                            'Activity Credential'}
                        </h3>
                        <p className='text-sm text-gray-600 mb-2'>
                          {credential.credentialSubject?.organizer ||
                            'Unknown Organizer'}
                        </p>
                        <div className='flex flex-wrap gap-2 mb-3'>
                          <Badge variant='secondary'>
                            {credential.credentialSubject?.activityType ||
                              'Activity'}
                          </Badge>
                          <Badge variant='outline'>
                            {credential.credentialSubject?.role ||
                              'Participant'}
                          </Badge>
                          <Badge variant='outline'>
                            {credential.credentialSubject?.hours || 0} hours
                          </Badge>
                        </div>
                        <p className='text-xs text-gray-500'>
                          Issued:{' '}
                          {new Date(
                            credential.issuanceDate
                          ).toLocaleDateString()}
                        </p>
                        {credential.expirationDate && (
                          <p className='text-xs text-gray-500'>
                            Expires:{' '}
                            {new Date(
                              credential.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className='flex space-x-2 ml-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => downloadCredential(credential)}
                        >
                          <Download className='h-4 w-4 mr-1' />
                          Download
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            window.open(
                              credential.credentialSubject?.verificationUrl,
                              '_blank'
                            )
                          }
                        >
                          <QrCode className='h-4 w-4 mr-1' />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
