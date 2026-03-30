import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface Props {
  children: React.ReactElement;
}

const StudentRoute: React.FC<Props> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading || profileLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/auth' state={{ from: location }} replace />;
  }

  // If profile exists and is not student, block access. If profile is null (e.g., just created), keep showing loader via a minimal fallback.
  const metaRole = (user as any)?.user_metadata?.role;
  const isStudent = (profile?.role ?? metaRole) === 'student';
  if (!isStudent) {
    // If we truly know user is not student, redirect home
    if (profile && profile.role !== 'student')
      return <Navigate to='/' replace />;
    // Otherwise, show a brief loader while profile initializes
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Preparing your access…</p>
        </div>
      </div>
    );
  }

  return children;
};

export default StudentRoute;
