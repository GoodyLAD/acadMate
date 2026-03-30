import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
  Shield,
  Clock,
  TrendingUp,
  Upload,
  RefreshCw,
  Award,
  Activity,
} from 'lucide-react';
import FacultyForm from '@/components/admin/FacultyForm';
import FacultyTable from '@/components/admin/FacultyTable';
import CSVImportModal from '@/components/admin/CSVImportModal';
import type { Tables } from '@/integrations/supabase/types';

type Faculty = Tables<'faculty'>;

const AdminFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [filterVerified, setFilterVerified] = useState<
    'all' | 'verified' | 'unverified'
  >('all');
  const [showCSVImport, setShowCSVImport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculty();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFaculty = async (
    facultyId: string,
    isVerified: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('faculty')
        .update({ is_verified: isVerified })
        .eq('id', facultyId);

      if (error) throw error;

      setFaculty(prev =>
        prev.map(f =>
          f.id === facultyId ? { ...f, is_verified: isVerified } : f
        )
      );

      toast({
        title: 'Success',
        description: `Faculty ${isVerified ? 'verified' : 'unverified'} successfully`,
      });
    } catch (error) {
      console.error('Error updating faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to update faculty verification status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?'))
      return;

    try {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', facultyId);

      if (error) throw error;

      setFaculty(prev => prev.filter(f => f.id !== facultyId));
      toast({
        title: 'Success',
        description: 'Faculty member deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete faculty member',
        variant: 'destructive',
      });
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterVerified === 'all' ||
      (filterVerified === 'verified' && f.is_verified) ||
      (filterVerified === 'unverified' && !f.is_verified);

    return matchesSearch && matchesFilter;
  });

  const verifiedCount = faculty.filter(f => f.is_verified).length;
  const pendingCount = faculty.filter(f => !f.is_verified).length;
  const verificationRate =
    faculty.length > 0 ? (verifiedCount / faculty.length) * 100 : 0;

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='text-center py-12'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4'></div>
            <div
              className='absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-purple-400 animate-spin mx-auto'
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            ></div>
          </div>
          <p className='text-gray-600 text-lg'>Loading faculty data...</p>
          <p className='text-gray-400 text-sm mt-2'>
            Please wait while we fetch the latest information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Hero Header */}
      <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative px-8 py-12 text-white'>
          <div className='flex items-center justify-between'>
            <div className='max-w-3xl'>
              <Badge className='mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30'>
                <Users className='w-3 h-3 mr-1' />
                Faculty Management
              </Badge>
              <h1 className='text-4xl font-bold mb-4 leading-tight'>
                Faculty Management System
              </h1>
              <p className='text-xl text-blue-100 mb-6 leading-relaxed'>
                Manage faculty members, verify credentials, and oversee academic
                staff with powerful admin tools.
              </p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  size='lg'
                  className='bg-white text-blue-600 hover:bg-blue-50 font-semibold'
                  onClick={() => setShowForm(true)}
                >
                  <Plus className='w-5 h-5 mr-2' />
                  Add New Faculty
                </Button>
                <Button
                  size='lg'
                  className='bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 shadow-lg'
                  onClick={() => setShowCSVImport(true)}
                >
                  <Upload className='w-5 h-5 mr-2' />
                  Import Assignments
                </Button>
              </div>
            </div>
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/10 rounded-full flex items-center justify-center'>
                <Users className='w-16 h-16 text-white/80' />
              </div>
            </div>
          </div>
        </div>
        <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full'></div>
        <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full'></div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110 transition-transform'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <TrendingUp className='w-4 h-4 mr-1' />
                +12%
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Total Faculty
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {faculty.length}
              </p>
              <p className='text-xs text-gray-500'>Registered members</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 group-hover:scale-110 transition-transform'>
                <UserCheck className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <TrendingUp className='w-4 h-4 mr-1' />
                +8%
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Verified Faculty
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {verifiedCount}
              </p>
              <p className='text-xs text-gray-500'>Active and verified</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 group-hover:scale-110 transition-transform'>
                <Clock className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-orange-600 text-sm font-medium'>
                <Activity className='w-4 h-4 mr-1' />
                Pending
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Pending Verification
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {pendingCount}
              </p>
              <p className='text-xs text-gray-500'>Awaiting approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform'>
                <Shield className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-purple-600 text-sm font-medium'>
                <Award className='w-4 h-4 mr-1' />
                {verificationRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Verification Rate
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {verificationRate.toFixed(1)}%
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                <div
                  className='bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full'
                  style={{ width: `${verificationRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filter */}
      <Card className='border-0 bg-white/80 backdrop-blur-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-3 text-xl'>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg'>
                <Search className='h-5 w-5 text-white' />
              </div>
              Search & Filter
            </CardTitle>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={fetchFaculty}>
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4 mr-2' />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                placeholder='Search faculty by name, email, department, or specialization...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-12 h-12 bg-white/50 border-white/20 focus:bg-white focus:border-blue-300 text-lg'
              />
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant={filterVerified === 'all' ? 'default' : 'outline'}
                size='lg'
                onClick={() => setFilterVerified('all')}
                className='px-6'
              >
                <Users className='h-4 w-4 mr-2' />
                All ({faculty.length})
              </Button>
              <Button
                variant={filterVerified === 'verified' ? 'default' : 'outline'}
                size='lg'
                onClick={() => setFilterVerified('verified')}
                className='px-6'
              >
                <UserCheck className='h-4 w-4 mr-2' />
                Verified ({verifiedCount})
              </Button>
              <Button
                variant={
                  filterVerified === 'unverified' ? 'default' : 'outline'
                }
                size='lg'
                onClick={() => setFilterVerified('unverified')}
                className='px-6'
              >
                <UserX className='h-4 w-4 mr-2' />
                Pending ({pendingCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <FacultyTable
        faculty={filteredFaculty}
        onEdit={faculty => {
          setEditingFaculty(faculty);
          setShowForm(true);
        }}
        onDelete={handleDeleteFaculty}
        onVerify={handleVerifyFaculty}
      />

      {/* Faculty Form Modal */}
      <FacultyForm
        open={showForm}
        onOpenChange={setShowForm}
        faculty={editingFaculty}
        onSave={() => {
          setShowForm(false);
          setEditingFaculty(null);
          fetchFaculty();
        }}
      />

      <CSVImportModal
        open={showCSVImport}
        onOpenChange={setShowCSVImport}
        onImport={() => {
          fetchFaculty();
        }}
      />
    </div>
  );
};

export default AdminFaculty;
