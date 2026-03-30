import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IssueCredentialModal } from './IssueCredentialModal';
import { StudentCredentials } from './StudentCredentials';
import { Shield, Award, Download, Share2 } from 'lucide-react';

interface VCIntegrationExampleProps {
  studentId: string;
  studentName: string;
  userRole: 'student' | 'faculty' | 'admin';
}

export const VCIntegrationExample: React.FC<VCIntegrationExampleProps> = ({
  studentId,
  studentName,
  userRole,
}) => {
  const [showCredentials, setShowCredentials] = useState(false);

  const handleCredentialIssued = () => {
    // You can add additional logic here, such as:
    // - Show success notification
    // - Refresh student data
    // - Send email notification
  };

  if (userRole === 'student') {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-6 w-6 text-blue-600' />
              <span>My Verifiable Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-4'>
              View and manage your digital credentials. These can be shared with
              employers, colleges, or other institutions for verification.
            </p>
            <Button onClick={() => setShowCredentials(!showCredentials)}>
              {showCredentials ? 'Hide Credentials' : 'View My Credentials'}
            </Button>
          </CardContent>
        </Card>

        {showCredentials && <StudentCredentials studentId={studentId} />}
      </div>
    );
  }

  if (userRole === 'faculty' || userRole === 'admin') {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Award className='h-6 w-6 text-green-600' />
              <span>Issue Verifiable Credential</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-4'>
              Issue a digitally signed, verifiable credential to {studentName}{' '}
              for their activities, achievements, or accomplishments.
            </p>

            <IssueCredentialModal
              studentId={studentId}
              studentName={studentName}
              onCredentialIssued={handleCredentialIssued}
            >
              <Button className='w-full'>
                <Shield className='h-4 w-4 mr-2' />
                Issue New Credential
              </Button>
            </IssueCredentialModal>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credential Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-start space-x-3'>
                <div className='bg-green-100 p-2 rounded-full'>
                  <Shield className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    Cryptographically Secure
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Digital signatures ensure authenticity and prevent tampering
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='bg-blue-100 p-2 rounded-full'>
                  <Download className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Easy Sharing</h4>
                  <p className='text-sm text-gray-600'>
                    QR codes and verification links for instant sharing
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='bg-purple-100 p-2 rounded-full'>
                  <Award className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    Verifiable Anywhere
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Anyone can verify credentials using the public verification
                    system
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='bg-orange-100 p-2 rounded-full'>
                  <Share2 className='h-5 w-5 text-orange-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Portable</h4>
                  <p className='text-sm text-gray-600'>
                    Students own their credentials and can use them anywhere
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <Badge variant='outline' className='mt-1'>
                  1
                </Badge>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    Issue Credential
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Faculty creates a credential with activity details and
                    evidence files
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Badge variant='outline' className='mt-1'>
                  2
                </Badge>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    Digital Signature
                  </h4>
                  <p className='text-sm text-gray-600'>
                    System signs the credential with cryptographic keys for
                    authenticity
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Badge variant='outline' className='mt-1'>
                  3
                </Badge>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    QR Code Generation
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Generate shareable QR code and verification link for the
                    student
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Badge variant='outline' className='mt-1'>
                  4
                </Badge>
                <div>
                  <h4 className='font-semibold text-gray-900'>Verification</h4>
                  <p className='text-sm text-gray-600'>
                    Anyone can scan the QR code to verify the credential's
                    authenticity
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

// Example usage in a student dashboard
export const StudentDashboardWithVC = () => {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Student Dashboard</h1>

      {/* Existing dashboard content */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>{/* Course content */}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Activities</CardTitle>
          </CardHeader>
          <CardContent>{/* Activity content */}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Achievements</CardTitle>
          </CardHeader>
          <CardContent>{/* Achievement content */}</CardContent>
        </Card>
      </div>

      {/* Verifiable Credentials Integration */}
      <VCIntegrationExample
        studentId='student-123'
        studentName='John Doe'
        userRole='student'
      />
    </div>
  );
};

// Example usage in a faculty dashboard
export const FacultyDashboardWithVC = () => {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Faculty Dashboard</h1>

      {/* Existing faculty content */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Student list with issue credential buttons */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <p className='font-medium'>John Doe</p>
                  <p className='text-sm text-gray-600'>Computer Science</p>
                </div>
                <VCIntegrationExample
                  studentId='student-123'
                  studentName='John Doe'
                  userRole='faculty'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>{/* Activity content */}</CardContent>
        </Card>
      </div>
    </div>
  );
};
