import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import DatabaseTest from '@/components/admin/DatabaseTest';
import {
  RefreshCw,
  Database,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Settings,
  Download,
  Terminal,
  Bug,
  Info,
} from 'lucide-react';

const AdminDebug = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch,
  } = useProfile();
  const [systemStats, setSystemStats] = useState<any>(null);
  const [dbConnection, setDbConnection] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setLoadingStats(true);
    try {
      // Test database connection
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      setDbConnection(!error);

      // Get system statistics
      const [profilesResult, facultyResult, studentsResult] = await Promise.all(
        [
          supabase.from('profiles').select('id, role', { count: 'exact' }),
          supabase
            .from('faculty')
            .select('id, is_verified', { count: 'exact' }),
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'student'),
        ]
      );

      setSystemStats({
        totalProfiles: profilesResult.count || 0,
        totalFaculty: facultyResult.count || 0,
        verifiedFaculty:
          facultyResult.data?.filter(f => f.is_verified).length || 0,
        totalStudents: studentsResult.count || 0,
        dbConnected: !error,
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setDbConnection(false);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className='h-5 w-5 text-green-500' />
    ) : (
      <XCircle className='h-5 w-5 text-red-500' />
    );
  };

  const getStatusBadge = (status: boolean, text: string) => {
    return (
      <Badge
        className={
          status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }
      >
        {status ? (
          <CheckCircle className='h-3 w-3 mr-1' />
        ) : (
          <XCircle className='h-3 w-3 mr-1' />
        )}
        {text}
      </Badge>
    );
  };

  return (
    <div className='space-y-8'>
      {/* Hero Header */}
      <div className='relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-3xl mb-8'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative px-8 py-12 text-white'>
          <div className='flex items-center justify-between'>
            <div className='max-w-3xl'>
              <Badge className='mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30'>
                <Bug className='w-3 h-3 mr-1' />
                Debug Console
              </Badge>
              <h1 className='text-4xl font-bold mb-4 leading-tight'>
                Admin Debug Console
              </h1>
              <p className='text-xl text-orange-100 mb-6 leading-relaxed'>
                Comprehensive system diagnostics, database status, and
                troubleshooting tools for administrators.
              </p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  size='lg'
                  className='bg-white text-orange-600 hover:bg-orange-50 font-semibold'
                  onClick={fetchSystemStats}
                >
                  <RefreshCw className='w-5 h-5 mr-2' />
                  Refresh All Data
                </Button>
                <Button
                  size='lg'
                  className='bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 shadow-lg'
                  onClick={handleRefresh}
                >
                  <Terminal className='w-5 h-5 mr-2' />
                  Reload System
                </Button>
              </div>
            </div>
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/10 rounded-full flex items-center justify-center'>
                <Bug className='w-16 h-16 text-white/80' />
              </div>
            </div>
          </div>
        </div>
        <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full'></div>
        <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full'></div>
      </div>

      {/* System Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 group-hover:scale-110 transition-transform'>
                <Database className='h-6 w-6 text-white' />
              </div>
              {getStatusIcon(dbConnection)}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>Database</p>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {dbConnection ? 'Connected' : 'Disconnected'}
              </p>
              <p className='text-xs text-gray-500'>Supabase connection</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform'>
                <User className='h-6 w-6 text-white' />
              </div>
              {getStatusIcon(!!user)}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Authentication
              </p>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {user ? 'Active' : 'Inactive'}
              </p>
              <p className='text-xs text-gray-500'>User session</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform'>
                <Shield className='h-6 w-6 text-white' />
              </div>
              {getStatusIcon(profile?.role === 'admin')}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Admin Access
              </p>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {profile?.role === 'admin' ? 'Granted' : 'Denied'}
              </p>
              <p className='text-xs text-gray-500'>Role verification</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 group-hover:scale-110 transition-transform'>
                <Activity className='h-6 w-6 text-white' />
              </div>
              {getStatusIcon(!profileLoading && !authLoading)}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                System Status
              </p>
              <p className='text-2xl font-bold text-gray-900 mb-1'>
                {profileLoading || authLoading ? 'Loading' : 'Ready'}
              </p>
              <p className='text-xs text-gray-500'>Overall health</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Authentication Status */}
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg'>
                <User className='h-5 w-5 text-white' />
              </div>
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Loading State</span>
                {getStatusBadge(
                  !authLoading,
                  authLoading ? 'Loading...' : 'Complete'
                )}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>User Session</span>
                {getStatusBadge(!!user, user ? 'Active' : 'Not Found')}
              </div>
              {user && (
                <>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Email</span>
                    <span className='text-sm text-gray-600 font-mono'>
                      {user.email}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>User ID</span>
                    <span className='text-sm text-gray-600 font-mono'>
                      {user.id}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Created At</span>
                    <span className='text-sm text-gray-600'>
                      {new Date(user.created_at).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg'>
                <Shield className='h-5 w-5 text-white' />
              </div>
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Loading State</span>
                {getStatusBadge(
                  !profileLoading,
                  profileLoading ? 'Loading...' : 'Complete'
                )}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Error State</span>
                {getStatusBadge(
                  !profileError,
                  profileError ? 'Error' : 'No Errors'
                )}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Profile Loaded</span>
                {getStatusBadge(!!profile, profile ? 'Yes' : 'No')}
              </div>
              {profileError && (
                <div className='p-3 bg-red-50 rounded-lg'>
                  <p className='text-sm text-red-800 font-mono'>
                    {profileError.message}
                  </p>
                </div>
              )}
              {profile && (
                <>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Role</span>
                    <Badge className='bg-purple-100 text-purple-800'>
                      {profile.role}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Full Name</span>
                    <span className='text-sm text-gray-600'>
                      {profile.full_name}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Email</span>
                    <span className='text-sm text-gray-600 font-mono'>
                      {profile.email}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Statistics */}
      {systemStats && (
        <Card className='border-0 bg-white/80 backdrop-blur-sm mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              System Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600 mb-2'>
                  {systemStats.totalProfiles}
                </div>
                <div className='text-sm text-gray-600'>Total Profiles</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600 mb-2'>
                  {systemStats.totalStudents}
                </div>
                <div className='text-sm text-gray-600'>Students</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-purple-600 mb-2'>
                  {systemStats.totalFaculty}
                </div>
                <div className='text-sm text-gray-600'>Faculty Members</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-orange-600 mb-2'>
                  {systemStats.verifiedFaculty}
                </div>
                <div className='text-sm text-gray-600'>Verified Faculty</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions and Instructions */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg'>
                <Settings className='h-5 w-5 text-white' />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button onClick={refetch} className='w-full justify-start'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh Profile Data
              </Button>
              <Button
                onClick={fetchSystemStats}
                variant='outline'
                className='w-full justify-start'
              >
                <Database className='h-4 w-4 mr-2' />
                Test Database Connection
              </Button>
              <Button
                onClick={handleRefresh}
                variant='outline'
                className='w-full justify-start'
              >
                <Terminal className='h-4 w-4 mr-2' />
                Reload Application
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Download className='h-4 w-4 mr-2' />
                Export Debug Log
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-cyan-500 to-cyan-600 p-2 rounded-lg'>
                <Info className='h-5 w-5 text-white' />
              </div>
              Troubleshooting Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm'>
              <div className='flex items-start space-x-2'>
                <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold'>
                  1
                </div>
                <p>Ensure you're logged in with an admin account</p>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold'>
                  2
                </div>
                <p>Verify your profile loaded correctly and role is 'admin'</p>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold'>
                  3
                </div>
                <p>Check database connection and migration status</p>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold'>
                  4
                </div>
                <p>If errors persist, check browser console and network tab</p>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold'>
                  5
                </div>
                <p>Contact system administrator for database issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Test */}
      <div className='mb-8'>
        <DatabaseTest />
      </div>
    </div>
  );
};

export default AdminDebug;
