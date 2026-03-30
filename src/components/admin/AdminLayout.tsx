import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

const AdminLayout: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <Navbar />
      <main className='pt-16'>
        <div className='px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
