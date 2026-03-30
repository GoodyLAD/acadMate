import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserMinus, Search, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IssueCredentialModal } from '../../verifiableCredentials/IssueCredentialModal';

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id?: string;
  department?: string;
  assigned_faculty_id?: string;
}

const StudentManagement: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch only assigned students
  const fetchAssignedStudents = async () => {
    if (!profile || profile.role !== 'faculty') return;

    try {
      setLoadingStudents(true);

      // First get the faculty record
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (facultyError || !facultyData) {
        console.error('Faculty record not found:', facultyError);
        toast({
          title: 'Error',
          description: 'Faculty record not found',
          variant: 'destructive',
        });
        return;
      }

      // Get only assigned students by joining with assignments
      const { data: assignedStudentsData, error: assignedError } =
        await supabase
          .from('student_mentor_assignments')
          .select(
            `
          student_id,
          profiles!inner(
            id,
            full_name,
            email,
            student_id,
            department
          )
        `
          )
          .eq('mentor_id', facultyData.id)
          .order('profiles(full_name)');

      if (assignedError) {
        console.error('Error fetching assigned students:', assignedError);
        toast({
          title: 'Error',
          description: 'Failed to fetch assigned students',
          variant: 'destructive',
        });
        return;
      }

      // Extract student data from the joined result
      const students = (assignedStudentsData || []).map(assignment => ({
        ...assignment.profiles,
        assigned_faculty_id: facultyData.id,
      }));

      setAssignedStudents(students);
    } catch (err) {
      console.error('Error fetching assigned students:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch assigned students',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle assign/unassign student
  const handleStudentAction = async (
    studentId: string,
    action: 'assign' | 'unassign'
  ) => {
    if (!profile) return;

    try {
      // Get faculty record
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (facultyError || !facultyData) {
        toast({
          title: 'Error',
          description: 'Faculty record not found',
          variant: 'destructive',
        });
        return;
      }

      if (action === 'assign') {
        // Assign student to faculty
        const { error } = await supabase
          .from('student_mentor_assignments')
          .insert({
            student_id: studentId,
            mentor_id: facultyData.id,
          });

        if (error) {
          if (error.code === '23505') {
            toast({
              title: 'Info',
              description: 'Student is already assigned to you',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: 'Success',
            description: 'Student assigned successfully',
          });
        }
      } else {
        // Unassign student from faculty
        const { error } = await supabase
          .from('student_mentor_assignments')
          .delete()
          .eq('student_id', studentId)
          .eq('mentor_id', facultyData.id);

        if (error) {
          throw error;
        } else {
          toast({
            title: 'Success',
            description: 'Student unassigned successfully',
          });
        }
      }

      // Refresh assigned students to update the list
      await fetchAssignedStudents();
    } catch (err: any) {
      console.error(`Error ${action}ing student:`, err);
      toast({
        title: 'Error',
        description: err.message || `Failed to ${action} student`,
        variant: 'destructive',
      });
    }
  };

  // Filter assigned students based on search and filters
  const filteredStudents = assignedStudents.filter(student => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.student_id &&
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      departmentFilter === 'all' || student.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(
    new Set(assignedStudents.map(s => s.department).filter(Boolean))
  );

  // Load assigned students on component mount
  useEffect(() => {
    fetchAssignedStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Student Management
          </CardTitle>
          <CardDescription>
            View and manage your assigned students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className='flex flex-wrap gap-4 mb-6'>
            <div className='flex-1 min-w-[200px]'>
              <Label htmlFor='search'>Search Students</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  id='search'
                  placeholder='Search by name, email, or student ID...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='min-w-[150px]'>
              <Label htmlFor='department'>Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All Departments' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Students Table */}
          <div className='border rounded-lg'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-8'>
                      Loading assigned students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-8'>
                      {assignedStudents.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                          <div className='mb-4'>
                            <Users className='h-12 w-12 mx-auto text-muted-foreground/50' />
                          </div>
                          <h3 className='text-lg font-semibold mb-2'>
                            No Assigned Students
                          </h3>
                          <p className='text-sm'>
                            You don't have any students assigned to you yet.
                            Contact your administrator to assign students to
                            your faculty account.
                          </p>
                        </div>
                      ) : (
                        'No students found matching your criteria'
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className='font-medium'>
                        {student.full_name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.student_id || 'N/A'}</TableCell>
                      <TableCell>{student.department || 'N/A'}</TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <IssueCredentialModal
                            studentId={student.id}
                            studentName={student.full_name}
                            onCredentialIssued={() => {
                              toast({
                                title: 'Success',
                                description: `Credential issued to ${student.full_name}`,
                              });
                            }}
                          >
                            <Button variant='outline' size='sm'>
                              <Award className='h-4 w-4 mr-1' />
                              Issue Credential
                            </Button>
                          </IssueCredentialModal>

                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleStudentAction(student.id, 'unassign')
                            }
                            disabled={loadingStudents}
                          >
                            <UserMinus className='h-4 w-4 mr-1' />
                            Unassign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className='mt-4 flex justify-between text-sm text-gray-600'>
            <span>
              Showing {filteredStudents.length} of {assignedStudents.length}{' '}
              assigned students
            </span>
            <span>All students shown are assigned to you</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
