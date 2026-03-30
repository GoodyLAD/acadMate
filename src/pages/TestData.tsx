import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Database,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { populateMockData, clearMockData } from '@/scripts/populateMockData';
import { VCIntegrationTest } from '@/components/verifiableCredentials/VCIntegrationTest';

const TestData = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePopulateData = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      await populateMockData();
      setStatus('success');
      setMessage(
        'Mock data populated successfully! Check the dashboard to see the data.'
      );
    } catch (error) {
      setStatus('error');
      setMessage('Failed to populate mock data. Check console for details.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      await clearMockData();
      setStatus('success');
      setMessage('Mock data cleared successfully!');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to clear mock data. Check console for details.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Database Test Page
          </h1>
          <p className='text-lg text-gray-600'>
            Populate the database with mock data to test the dashboard
            functionality
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {/* Populate Data Card */}
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='h-5 w-5 text-green-600' />
                Populate Mock Data
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-gray-600'>
                This will add sample data to your database including:
              </p>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• 2 Students (John Doe & Jane Smith)</li>
                <li>• 4 Certificates (3 approved, 1 pending)</li>
                <li>• 5 Achievements with points</li>
                <li>• 7 Activity records</li>
                <li>• 3 Goals</li>
                <li>• Progress tracking data</li>
              </ul>
              <Button
                onClick={handlePopulateData}
                disabled={loading}
                className='w-full bg-green-600 hover:bg-green-700'
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Populating Data...
                  </>
                ) : (
                  <>
                    <Database className='h-4 w-4 mr-2' />
                    Populate Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Clear Data Card */}
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-red-600' />
                Clear Mock Data
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-gray-600'>
                This will remove all the mock data from your database.
              </p>
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                <p className='text-sm text-yellow-800'>
                  ⚠️ This action cannot be undone. Make sure you want to clear
                  the data.
                </p>
              </div>
              <Button
                onClick={handleClearData}
                disabled={loading}
                variant='destructive'
                className='w-full'
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Clearing Data...
                  </>
                ) : (
                  <>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Clear Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <Card className='shadow-lg'>
            <CardContent className='pt-6'>
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  status === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <AlertCircle className='h-5 w-5 text-red-600' />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {status === 'success' ? 'Success!' : 'Error!'}
                  </p>
                  <p
                    className={`text-sm ${
                      status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Instructions */}
        <Card className='shadow-lg mt-6'>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-1'>
                  1
                </Badge>
                <div>
                  <p className='font-medium'>Populate Mock Data</p>
                  <p className='text-sm text-gray-600'>
                    Click "Populate Data" to add sample data to your database
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-1'>
                  2
                </Badge>
                <div>
                  <p className='font-medium'>Check Dashboard</p>
                  <p className='text-sm text-gray-600'>
                    Go to the student dashboard and log in as one of the test
                    students:
                  </p>
                  <ul className='text-sm text-gray-500 mt-1 ml-4'>
                    <li>
                      • John Doe (ID: 550e8400-e29b-41d4-a716-446655440001)
                    </li>
                    <li>
                      • Jane Smith (ID: 550e8400-e29b-41d4-a716-446655440002)
                    </li>
                  </ul>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-1'>
                  3
                </Badge>
                <div>
                  <p className='font-medium'>Verify Data</p>
                  <p className='text-sm text-gray-600'>
                    Check that the dashboard shows real data: achievements,
                    points, streaks, certificates, etc.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-1'>
                  4
                </Badge>
                <div>
                  <p className='font-medium'>Clear Data (Optional)</p>
                  <p className='text-sm text-gray-600'>
                    Use "Clear Data" to remove the test data when you're done
                    testing
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verifiable Credentials Integration Test */}
        <div className='mt-8'>
          <VCIntegrationTest />
        </div>
      </div>
    </div>
  );
};

export default TestData;
