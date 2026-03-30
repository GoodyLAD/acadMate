import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Redirect admin-level faculty to admin dashboard
  useEffect(() => {
    if (
      profile &&
      profile.role === 'faculty' &&
      profile.faculty_level === 'admin'
    ) {
      navigate('/admin', { replace: true });
    }
  }, [profile, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 animate-in fade-in duration-300'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 animate-in fade-in duration-300'>
        <div className='text-center space-y-6'>
          <div>
            <h1 className='text-4xl font-bold mb-4'>Smart Student Hub</h1>
            <p className='text-xl text-muted-foreground mb-8'>
              Manage student academic and co-curricular records with ease
            </p>
          </div>
          <div className='space-y-4'>
            <Link to='/auth'>
              <Button size='lg' className='w-full max-w-sm'>
                Sign In / Sign Up
              </Button>
            </Link>
            <p className='text-sm text-muted-foreground'>
              Sign in to access your dashboard and manage certificates
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <main className='animate-in fade-in-50 slide-in-from-bottom-2 duration-300'>
        {profile.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <FacultyDashboard />
        )}
      </main>
    </div>
  );
};

export default Index;
