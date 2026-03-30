import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  UserCheck,
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Target,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import AssignmentTable from '@/components/admin/AssignmentTable';
import AssignMentorModal from '@/components/admin/AssignMentorModal';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Faculty = Tables<'faculty'>;
type StudentMentorAssignment = Tables<'student_mentor_assignments'>;

interface AssignmentWithDetails extends StudentMentorAssignment {
  student?: Profile;
  mentor?: Faculty;
}

const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterDepartment, setFilterDepartment] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all assignments with student and mentor details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('student_mentor_assignments')
        .select(
          `
          *,
          student:profiles!student_mentor_assignments_student_id_fkey(*),
          mentor:faculty!student_mentor_assignments_mentor_id_fkey(*)
        `
        )
        .order('created_at', { ascending: false });
      if (assignmentsError) {
        console.error('Assignments error:', assignmentsError);
        throw assignmentsError;
      }

      // Fetch all students - try different approaches
      let studentsData = null;
      let studentsError = null;

      // First try with string comparison
      const { data: studentsData1, error: studentsError1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (studentsError1) {
        // If that fails, try with text casting
        const { data: studentsData2, error: studentsError2 } = await supabase
          .from('profiles')
          .select('*')
          .filter('role', 'eq', 'student')
          .order('full_name');

        studentsData = studentsData2;
        studentsError = studentsError2;
      } else {
        studentsData = studentsData1;
        studentsError = studentsError1;
      }
      if (studentsError) {
        console.error('Students error:', studentsError);
        // Don't throw error, just log it and continue with empty array
        studentsData = [];
      }

      // Fetch verified faculty (potential mentors)
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('is_verified', true)
        .order('name');
      if (facultyError) {
        console.error('Faculty error:', facultyError);
        throw facultyError;
      }

      setAssignments(assignmentsData || []);
      setStudents(studentsData || []);
      setFaculty(facultyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch assignment data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    try {
      // Check if assignment already exists
      const existingAssignment = assignments.find(
        a => a.student_id === studentId
      );

      if (existingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('student_mentor_assignments')
          .update({ mentor_id: mentorId })
          .eq('student_id', studentId);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('student_mentor_assignments')
          .insert([{ student_id: studentId, mentor_id: mentorId }]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Mentor assigned successfully',
      });

      fetchData();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign mentor',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignMentor = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unassign this mentor?')) return;

    try {
      const { error } = await supabase
        .from('student_mentor_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mentor unassigned successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error unassigning mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign mentor',
        variant: 'destructive',
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const student = assignment.student;
    const mentor = assignment.mentor;

    const matchesSearch =
      !searchQuery ||
      student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor?.department?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const unassignedStudents = students.filter(
    student =>
      !assignments.some(assignment => assignment.student_id === student.id)
  );

  const assignmentRate =
    students.length > 0 ? (assignments.length / students.length) * 100 : 0;
  const mentorUtilization =
    faculty.length > 0 ? assignments.length / faculty.length : 0;

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
          <p className='text-gray-600 text-lg'>Loading assignment data...</p>
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
      <div className='relative overflow-hidden bg-gradient-to-r from-green-600 via-teal-600 to-cyan-700 rounded-3xl'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative px-8 py-12 text-white'>
          <div className='flex items-center justify-between'>
            <div className='max-w-3xl'>
              <Badge className='mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30'>
                <LinkIcon className='w-3 h-3 mr-1' />
                Mentor Assignments
              </Badge>
              <h1 className='text-4xl font-bold mb-4 leading-tight'>
                Mentor Assignment System
              </h1>
              <p className='text-xl text-green-100 mb-6 leading-relaxed'>
                Connect students with mentors, track relationships, and ensure
                every student has the guidance they need.
              </p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  size='lg'
                  className='bg-white text-green-600 hover:bg-green-50 font-semibold'
                  onClick={() => setShowAssignModal(true)}
                >
                  <Plus className='w-5 h-5 mr-2' />
                  Assign Mentor
                </Button>
                <Button
                  size='lg'
                  className='bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 shadow-lg'
                >
                  <Download className='w-5 h-5 mr-2' />
                  Export Assignments
                </Button>
              </div>
            </div>
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/10 rounded-full flex items-center justify-center'>
                <UserCheck className='w-16 h-16 text-white/80' />
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
                <GraduationCap className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-green-600 text-sm font-medium'>
                <TrendingUp className='w-4 h-4 mr-1' />
                +15%
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Total Students
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {students.length}
              </p>
              <p className='text-xs text-gray-500'>Enrolled students</p>
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
                <CheckCircle className='w-4 h-4 mr-1' />
                {assignmentRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Assigned Students
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {assignments.length}
              </p>
              <p className='text-xs text-gray-500'>With mentors</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 group-hover:scale-110 transition-transform'>
                <AlertCircle className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-orange-600 text-sm font-medium'>
                <Clock className='w-4 h-4 mr-1' />
                Needs Assignment
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Unassigned Students
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {unassignedStudents.length}
              </p>
              <p className='text-xs text-gray-500'>Awaiting mentors</p>
            </div>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='flex items-center text-purple-600 text-sm font-medium'>
                <Target className='w-4 h-4 mr-1' />
                {mentorUtilization.toFixed(1)}/student
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                Available Mentors
              </p>
              <p className='text-3xl font-bold text-gray-900 mb-1'>
                {faculty.length}
              </p>
              <p className='text-xs text-gray-500'>Verified faculty</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              Assignment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between text-sm'>
                <span>Assignment Rate</span>
                <span className='font-semibold'>
                  {assignmentRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={assignmentRate} className='h-3' />
              <div className='flex justify-between text-sm text-gray-600'>
                <span>{assignments.length} assigned</span>
                <span>{unassignedStudents.length} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg'>
                <Activity className='h-5 w-5 text-white' />
              </div>
              Mentor Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between text-sm'>
                <span>Average Students per Mentor</span>
                <span className='font-semibold'>
                  {mentorUtilization.toFixed(1)}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full'
                  style={{ width: `${Math.min(mentorUtilization * 20, 100)}%` }}
                ></div>
              </div>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>{faculty.length} mentors</span>
                <span>{assignments.length} assignments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search */}
      <Card className='border-0 bg-white/80 backdrop-blur-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-3 text-xl'>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg'>
                <Search className='h-5 w-5 text-white' />
              </div>
              Search Assignments
            </CardTitle>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm' onClick={fetchData}>
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
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <Input
              placeholder='Search by student name, email, mentor name, or department...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-12 h-12 bg-white/50 border-white/20 focus:bg-white focus:border-green-300 text-lg'
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Table */}
      {assignments.length === 0 && !loading ? (
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardContent className='p-8 text-center'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                <UserCheck className='w-8 h-8 text-gray-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No Mentor Assignments Found
                </h3>
                <p className='text-gray-600 mb-4'>
                  There are currently no mentor assignments in the system.
                </p>
                <Button
                  onClick={() => setShowAssignModal(true)}
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create First Assignment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AssignmentTable
          assignments={filteredAssignments}
          onUnassign={handleUnassignMentor}
        />
      )}

      {/* Assign Mentor Modal */}
      <AssignMentorModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        students={unassignedStudents}
        faculty={faculty}
        onAssign={handleAssignMentor}
      />
    </div>
  );
};

export default AdminAssignments;
