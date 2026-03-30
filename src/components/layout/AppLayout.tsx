import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className='min-h-screen bg-gray-100 overflow-x-hidden'>
      {user && <Navbar />}
      <Outlet />
    </div>
  );
}
