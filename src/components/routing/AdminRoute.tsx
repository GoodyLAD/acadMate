import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Lock,
  RefreshCw,
  Home,
  ArrowLeft,
  Database,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  // Show loading while auth or profile is loading
  if (authLoading || profileLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8'>
        <Card className='w-full max-w-md border-0 bg-white/80 backdrop-blur-sm shadow-2xl'>
          <CardContent className='p-8 text-center'>
            <div className='relative mb-6'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto'></div>
              <div
                className='absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin mx-auto'
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1.5s',
                }}
              ></div>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Loading Admin Portal
            </h2>
            <p className='text-gray-600 mb-4'>
              Please wait while we verify your access...
            </p>
            <div className='flex items-center justify-center space-x-2 text-sm text-gray-500'>
              <Database className='h-4 w-4' />
              <span>Connecting to database</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's a profile error, show error message
  if (profileError) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-8'>
        <Card className='w-full max-w-lg border-0 bg-white/80 backdrop-blur-sm shadow-2xl'>
          <CardHeader className='text-center pb-4'>
            <div className='w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertTriangle className='h-10 w-10 text-white' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Profile Error
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-gray-600'>
              There was an error loading your profile. Please try refreshing the
              page.
            </p>
            <div className='p-4 bg-red-50 rounded-lg'>
              <p className='text-sm text-red-800 font-mono'>
                Error: {profileError.message || 'Unknown error'}
              </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                onClick={() => window.location.reload()}
                className='flex-1'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh Page
              </Button>
              <Button
                variant='outline'
                onClick={() => (window.location.href = '/')}
                className='flex-1'
              >
                <Home className='h-4 w-4 mr-2' />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to='/auth' replace />;
  }

  // If no profile or user is not an admin-level faculty, show access denied
  const isAdmin =
    profile?.role === 'faculty' && profile?.faculty_level === 'admin';
  if (!profile || !isAdmin) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-8'>
        <Card className='w-full max-w-lg border-0 bg-white/80 backdrop-blur-sm shadow-2xl'>
          <CardHeader className='text-center pb-4'>
            <div className='w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Lock className='h-10 w-10 text-white' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-gray-600'>
              You don't have permission to access the Admin Portal.
            </p>
            <div className='flex items-center justify-center space-x-2'>
              <Badge className='bg-red-100 text-red-800'>
                <XCircle className='h-3 w-3 mr-1' />
                Current Role: {profile?.role || 'None'}
              </Badge>
              <Badge className='bg-green-100 text-green-800'>
                <CheckCircle className='h-3 w-3 mr-1' />
                Required: Admin
              </Badge>
            </div>
            <p className='text-sm text-gray-500'>
              Contact your administrator if you believe this is an error.
            </p>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                onClick={() => (window.location.href = '/')}
                className='flex-1'
              >
                <Home className='h-4 w-4 mr-2' />
                Go to Dashboard
              </Button>
              <Button
                variant='outline'
                onClick={() => window.history.back()}
                className='flex-1'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
