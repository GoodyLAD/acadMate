import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertCircle, X } from 'lucide-react';
import { populateMockData, clearMockData } from '@/scripts/populateMockData';
import { useMockData } from '@/hooks/useMockData';

const TestDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { enableMockData, disableMockData } = useMockData();

  const handlePopulateData = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // First try to populate database
      try {
        await populateMockData();
        // Enable mock data and trigger update
        enableMockData();
        setStatus('success');
        setMessage(
          'Mock data loaded to database! The dashboard will now show sample data.'
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (dbError) {
        // If database fails, use local mock data
        enableMockData();
        setStatus('success');
        setMessage(
          'Mock data loaded locally! The dashboard will now show sample data.'
        );
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to load mock data. Check console for details.');
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
      // Clear both database and local mock data
      try {
        await clearMockData();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (dbError) {
        /* ignore */
      }

      disableMockData();
      setStatus('success');
      setMessage('Mock data cleared! The dashboard will now show empty state.');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to clear mock data. Check console for details.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <Card className='w-80 shadow-lg border-2'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-blue-600' />
              <span className='font-medium text-sm'>Test Data</span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowDetails(!showDetails)}
              className='h-6 w-6 p-0'
            >
              {showDetails ? <X className='h-3 w-3' /> : '?'}
            </Button>
          </div>

          {showDetails && (
            <div className='mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600'>
              <p className='mb-1'>
                This will add sample data to test the dashboard:
              </p>
              <ul className='list-disc list-inside space-y-0.5'>
                <li>2 Students with profiles</li>
                <li>4 Certificates (3 approved, 1 pending)</li>
                <li>5 Achievements with points</li>
                <li>7 Activity records</li>
                <li>3 Goals and progress data</li>
              </ul>
            </div>
          )}

          <div className='space-y-2'>
            <Button
              onClick={handlePopulateData}
              disabled={loading}
              size='sm'
              className='w-full bg-green-600 hover:bg-green-700 text-white'
            >
              {loading ? (
                <>
                  <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                  Loading...
                </>
              ) : (
                <>
                  <Database className='h-3 w-3 mr-1' />
                  Load Mock Data
                </>
              )}
            </Button>

            <div className='flex gap-1'>
              <Button
                onClick={handleClearData}
                disabled={loading}
                size='sm'
                variant='outline'
                className='flex-1 text-xs'
              >
                Clear
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                size='sm'
                variant='outline'
                className='flex-1 text-xs'
              >
                Refresh
              </Button>
            </div>
          </div>

          {status !== 'idle' && (
            <div
              className={`mt-2 p-2 rounded text-xs flex items-center gap-1 ${
                status === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle className='h-3 w-3 flex-shrink-0' />
              ) : (
                <AlertCircle className='h-3 w-3 flex-shrink-0' />
              )}
              <span className='text-xs'>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className='mt-2'>
              <Badge variant='outline' className='text-xs'>
                Test Student IDs: 550e8400-e29b-41d4-a716-446655440001,
                550e8400-e29b-41d4-a716-446655440002
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataButton;
