import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { verifiableCredentialServiceSimple } from '../../services/verifiableCredentialServiceSimple';
import { keyManagementService } from '../../services/keyManagementService';
import { supabase } from '@/integrations/supabase/client';
import { checkVCSetup } from '../../setup/setupVerifiableCredentialsSimple';

export const VCIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    keyGeneration: boolean;
    credentialIssuance: boolean;
    credentialVerification: boolean;
    jwksEndpoint: boolean;
  }>({
    keyGeneration: false,
    credentialIssuance: false,
    credentialVerification: false,
    jwksEndpoint: false,
  });
  const [loading, setLoading] = useState(false);
  const [testCredential, setTestCredential] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    const results = { ...testResults };

    try {
      // Test 0: Check VC Setup
      const setupCheck = await checkVCSetup();
      if (!setupCheck.isSetup) {
        console.error('VC system not properly set up:', setupCheck.error);
        alert(
          'VC system not set up. Please run the fix_issuer_rls.sql script in Supabase SQL Editor first.'
        );
        setLoading(false);
        return;
      }
      // Test 1: Key Generation
      const keyPair = await keyManagementService.generateKeyPair();
      results.keyGeneration = !!(
        keyPair.publicKey &&
        keyPair.privateKey &&
        keyPair.jwk
      );
      // Test 2: JWKS Endpoint
      const jwks = await keyManagementService.getJWKS();
      results.jwksEndpoint = !!(jwks.keys && jwks.keys.length > 0);
      // Test 3: Credential Issuance
      let issuedCredential = null;

      try {
        // First, get a real student from the database
        const studentRes = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student')
          .limit(1);

        let students = studentRes.data;
        const studentError = studentRes.error;

        if (studentError || !students || students.length === 0) {
          // Generate UUIDs for the test student
          const studentId = crypto.randomUUID();
          const userId = crypto.randomUUID();

          // Create a test student
          const { data: newStudent, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: studentId,
              user_id: userId,
              full_name: 'Test Student VC',
              email: 'test.student.vc@example.com',
              role: 'student',
            })
            .select('id, full_name')
            .single();

          if (createError) {
            throw new Error(
              `Failed to create test student: ${createError.message}`
            );
          }

          students = [newStudent];
        }

        const student = students[0];
        issuedCredential =
          await verifiableCredentialServiceSimple.issueCredential({
            // activityId is optional, so we'll omit it for this test
            studentId: student.id,
            evidenceIds: [],
            issuedByUserId: crypto.randomUUID(), // Generate a proper UUID
            activityData: {
              title: 'Test Conference 2025',
              type: 'Conference',
              organizer: 'Test Organizer',
              role: 'Presenter',
              date: '2025-01-15',
              location: 'Test City',
              hours: 8,
              department: 'Computer Science',
            },
          });

        results.credentialIssuance = !!(
          issuedCredential.vcId && issuedCredential.shortToken
        );
        setTestCredential(issuedCredential);
      } catch (error) {
        console.error('Credential issuance test failed:', error);
        results.credentialIssuance = false;
      }

      // Test 4: Credential Verification
      if (issuedCredential?.shortToken) {
        try {
          const verification =
            await verifiableCredentialServiceSimple.verifyCredential(
              issuedCredential.shortToken
            );
          results.credentialVerification = verification.status === 'valid';
        } catch (error) {
          console.error('Credential verification test failed:', error);
          results.credentialVerification = false;
        }
      } else {
        results.credentialVerification = false;
      }
    } catch (error) {
      console.error('Test suite failed:', error);
    }

    setTestResults(results);
    setLoading(false);
  };

  const allTestsPassed = Object.values(testResults).every(result => result);

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Shield className='h-6 w-6 text-blue-600' />
          <span>Verifiable Credentials Integration Test</span>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        <Alert
          className={
            allTestsPassed
              ? 'border-green-200 bg-green-50'
              : 'border-yellow-200 bg-yellow-50'
          }
        >
          <div className='flex items-center space-x-2'>
            {allTestsPassed ? (
              <CheckCircle className='h-4 w-4 text-green-600' />
            ) : (
              <AlertTriangle className='h-4 w-4 text-yellow-600' />
            )}
            <AlertDescription>
              {allTestsPassed
                ? 'All Verifiable Credentials tests passed! System is ready.'
                : 'Some tests failed. Check the console for details.'}
            </AlertDescription>
          </div>
        </Alert>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Key Generation</span>
            <Badge
              variant={testResults.keyGeneration ? 'default' : 'destructive'}
            >
              {testResults.keyGeneration ? 'Pass' : 'Fail'}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>JWKS Endpoint</span>
            <Badge
              variant={testResults.jwksEndpoint ? 'default' : 'destructive'}
            >
              {testResults.jwksEndpoint ? 'Pass' : 'Fail'}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Credential Issuance</span>
            <Badge
              variant={
                testResults.credentialIssuance ? 'default' : 'destructive'
              }
            >
              {testResults.credentialIssuance ? 'Pass' : 'Fail'}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Credential Verification</span>
            <Badge
              variant={
                testResults.credentialVerification ? 'default' : 'destructive'
              }
            >
              {testResults.credentialVerification ? 'Pass' : 'Fail'}
            </Badge>
          </div>
        </div>

        <Button onClick={runTests} disabled={loading} className='w-full'>
          {loading ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>

        {testCredential && (
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <h4 className='font-medium text-sm mb-2'>
              Test Credential Generated:
            </h4>
            <p className='text-xs text-gray-600 break-all'>
              ID: {testCredential.vcId}
            </p>
            <p className='text-xs text-gray-600 break-all'>
              QR URL: {testCredential.qrUrl}
            </p>
          </div>
        )}

        <div className='text-xs text-gray-500 mt-4'>
          <p>
            This test verifies that the Verifiable Credentials system is
            properly integrated and functional.
          </p>
          <p>Check the browser console for detailed test logs.</p>
        </div>
      </CardContent>
    </Card>
  );
};
