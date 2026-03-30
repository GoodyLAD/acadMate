import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface Props {
  children: React.ReactElement;
}

const FacultyRoute: React.FC<Props> = ({ children }) => {
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

  if (!user) return <Navigate to='/auth' state={{ from: location }} replace />;

  const metaRole = (user as any)?.user_metadata?.role;
  const isFaculty = (profile?.role ?? metaRole) === 'faculty';
  if (!isFaculty) {
    if (profile && profile.role !== 'faculty')
      return <Navigate to='/' replace />;
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

export default FacultyRoute;
