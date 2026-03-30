import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DatabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testDatabase = async () => {
    setTesting(true);
    setResults(null);

    try {
      // Test basic connection
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      // Test if faculty table exists
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('count')
        .limit(1);

      // Test if student_mentor_assignments table exists
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('student_mentor_assignments')
        .select('count')
        .limit(1);

      // Test profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(5);

      setResults({
        connection: { success: true, error: null },
        faculty: {
          success: !facultyError,
          error: facultyError?.message || null,
          count: facultyData?.length || 0,
        },
        assignments: {
          success: !assignmentsError,
          error: assignmentsError?.message || null,
          count: assignmentsData?.length || 0,
        },
        profiles: {
          success: !profilesError,
          error: profilesError?.message || null,
          data: profilesData || [],
          count: profilesData?.length || 0,
        },
      });
    } catch (error) {
      setResults({
        connection: { success: false, error: error.message },
        faculty: {
          success: false,
          error: 'Not tested due to connection error',
        },
        assignments: {
          success: false,
          error: 'Not tested due to connection error',
        },
        profiles: {
          success: false,
          error: 'Not tested due to connection error',
        },
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Database className='w-5 h-5' />
          Database Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button onClick={testDatabase} disabled={testing} className='w-full'>
          {testing ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Testing Database...
            </>
          ) : (
            <>
              <Database className='w-4 h-4 mr-2' />
              Test Database Connection
            </>
          )}
        </Button>

        {results && (
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Test Results:</h3>

            {/* Connection Test */}
            <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50'>
              {results.connection.success ? (
                <CheckCircle className='w-5 h-5 text-green-500' />
              ) : (
                <XCircle className='w-5 h-5 text-red-500' />
              )}
              <span className='font-medium'>Database Connection:</span>
              <span
                className={
                  results.connection.success ? 'text-green-600' : 'text-red-600'
                }
              >
                {results.connection.success ? 'Success' : 'Failed'}
              </span>
              {results.connection.error && (
                <span className='text-red-500 text-sm ml-2'>
                  ({results.connection.error})
                </span>
              )}
            </div>

            {/* Faculty Table Test */}
            <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50'>
              {results.faculty.success ? (
                <CheckCircle className='w-5 h-5 text-green-500' />
              ) : (
                <XCircle className='w-5 h-5 text-red-500' />
              )}
              <span className='font-medium'>Faculty Table:</span>
              <span
                className={
                  results.faculty.success ? 'text-green-600' : 'text-red-600'
                }
              >
                {results.faculty.success ? 'Exists' : 'Missing'}
              </span>
              {results.faculty.count > 0 && (
                <span className='text-blue-600 text-sm ml-2'>
                  ({results.faculty.count} records)
                </span>
              )}
              {results.faculty.error && (
                <span className='text-red-500 text-sm ml-2'>
                  ({results.faculty.error})
                </span>
              )}
            </div>

            {/* Assignments Table Test */}
            <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50'>
              {results.assignments.success ? (
                <CheckCircle className='w-5 h-5 text-green-500' />
              ) : (
                <XCircle className='w-5 h-5 text-red-500' />
              )}
              <span className='font-medium'>
                Student-Mentor Assignments Table:
              </span>
              <span
                className={
                  results.assignments.success
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {results.assignments.success ? 'Exists' : 'Missing'}
              </span>
              {results.assignments.count > 0 && (
                <span className='text-blue-600 text-sm ml-2'>
                  ({results.assignments.count} records)
                </span>
              )}
              {results.assignments.error && (
                <span className='text-red-500 text-sm ml-2'>
                  ({results.assignments.error})
                </span>
              )}
            </div>

            {/* Profiles Table Test */}
            <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50'>
              {results.profiles.success ? (
                <CheckCircle className='w-5 h-5 text-green-500' />
              ) : (
                <XCircle className='w-5 h-5 text-red-500' />
              )}
              <span className='font-medium'>Profiles Table:</span>
              <span
                className={
                  results.profiles.success ? 'text-green-600' : 'text-red-600'
                }
              >
                {results.profiles.success ? 'Exists' : 'Missing'}
              </span>
              {results.profiles.count > 0 && (
                <span className='text-blue-600 text-sm ml-2'>
                  ({results.profiles.count} records)
                </span>
              )}
              {results.profiles.error && (
                <span className='text-red-500 text-sm ml-2'>
                  ({results.profiles.error})
                </span>
              )}
            </div>

            {/* Sample Profiles Data */}
            {results.profiles.success && results.profiles.data.length > 0 && (
              <div className='mt-4'>
                <h4 className='font-medium mb-2'>Sample Profiles Data:</h4>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <pre className='text-sm overflow-x-auto'>
                    {JSON.stringify(results.profiles.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseTest;
