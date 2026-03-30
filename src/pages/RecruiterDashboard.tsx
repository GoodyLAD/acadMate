import { useState, useEffect } from 'react';
import { useRecruiter } from '@/hooks/useRecruiter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Filter,
  Building2,
  LogOut,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Award,
  GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  graduation_year: number;
  avatar_url?: string;
  total_certificates: number;
  approved_certificates: number;
  pending_certificates: number;
  achievements: number;
  last_activity: string;
}

const RecruiterDashboard = () => {
  const { recruiter, logout } = useRecruiter();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (recruiter) {
      fetchStudents();
    }
  }, [recruiter]);

  useEffect(() => {
    filterStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, searchTerm, selectedDepartment]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Mock data for demo - in real app, this would fetch from API
      const mockStudents: StudentProfile[] = [
        {
          id: '1',
          full_name: 'Alice Johnson',
          email: 'alice.johnson@student.edu',
          student_id: '2024-CSE-001',
          department: 'Computer Science',
          graduation_year: 2024,
          total_certificates: 8,
          approved_certificates: 6,
          pending_certificates: 2,
          achievements: 12,
          last_activity: '2024-01-15',
        },
        {
          id: '2',
          full_name: 'Bob Smith',
          email: 'bob.smith@student.edu',
          student_id: '2024-ECE-001',
          department: 'Electronics',
          graduation_year: 2024,
          total_certificates: 5,
          approved_certificates: 5,
          pending_certificates: 0,
          achievements: 8,
          last_activity: '2024-01-14',
        },
        {
          id: '3',
          full_name: 'Carol Davis',
          email: 'carol.davis@student.edu',
          student_id: '2024-MEC-001',
          department: 'Mechanical',
          graduation_year: 2024,
          total_certificates: 12,
          approved_certificates: 10,
          pending_certificates: 2,
          achievements: 15,
          last_activity: '2024-01-16',
        },
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        student =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        student => student.department === selectedDepartment
      );
    }

    setFilteredStudents(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/recruiter/login');
  };

  const getVerificationStatus = (student: StudentProfile) => {
    if (student.approved_certificates === student.total_certificates) {
      return { status: 'verified', icon: CheckCircle, color: 'text-green-600' };
    } else if (student.approved_certificates > 0) {
      return { status: 'partial', icon: Clock, color: 'text-yellow-600' };
    } else {
      return { status: 'pending', icon: XCircle, color: 'text-red-600' };
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading student profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-3'>
              <Building2 className='h-8 w-8 text-blue-600' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Recruiter Portal
                </h1>
                <p className='text-sm text-gray-600'>
                  {recruiter?.company_name}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-600'>
                Welcome, {recruiter?.contact_person}
              </span>
              <Button variant='outline' size='sm' onClick={handleLogout}>
                <LogOut className='h-4 w-4 mr-2' />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search and Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='Search students by name, ID, or department...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md text-sm'
                >
                  <option value='all'>All Departments</option>
                  <option value='Computer Science'>Computer Science</option>
                  <option value='Electronics'>Electronics</option>
                  <option value='Mechanical'>Mechanical</option>
                </select>
                <Button variant='outline' size='sm'>
                  <Filter className='h-4 w-4 mr-2' />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <GraduationCap className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Students
                  </p>
                  <p className='text-2xl font-semibold'>{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Verified Profiles
                  </p>
                  <p className='text-2xl font-semibold'>
                    {
                      students.filter(
                        s => s.approved_certificates === s.total_certificates
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Award className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Certificates
                  </p>
                  <p className='text-2xl font-semibold'>
                    {students.reduce(
                      (sum, s) => sum + s.approved_certificates,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Star className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    Top Performers
                  </p>
                  <p className='text-2xl font-semibold'>
                    {students.filter(s => s.achievements >= 10).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <div className='space-y-4'>
          {filteredStudents.map(student => {
            const verification = getVerificationStatus(student);
            const StatusIcon = verification.icon;

            return (
              <Card
                key={student.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback>
                          {student.full_name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {student.full_name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {student.student_id}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {student.department} • {student.graduation_year}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <div className='flex items-center gap-2 mb-1'>
                          <StatusIcon
                            className={`h-4 w-4 ${verification.color}`}
                          />
                          <span className='text-sm font-medium capitalize'>
                            {verification.status}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          {student.approved_certificates}/
                          {student.total_certificates} verified
                        </p>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            navigate(`/recruiter/student/${student.id}`)
                          }
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          View Profile
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Download className='h-4 w-4 mr-2' />
                          Download CV
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center gap-6 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <Award className='h-4 w-4' />
                      <span>{student.achievements} achievements</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <CheckCircle className='h-4 w-4' />
                      <span>
                        {student.approved_certificates} verified certificates
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>
                        Last active:{' '}
                        {new Date(student.last_activity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className='p-12 text-center'>
              <GraduationCap className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No students found
              </h3>
              <p className='text-gray-600'>
                Try adjusting your search criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
