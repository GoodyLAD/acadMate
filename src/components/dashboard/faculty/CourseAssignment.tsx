import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { BookOpen, ExternalLink, Users, Plus, X } from 'lucide-react';
import CourseDebug from './CourseDebug';

interface Course {
  id: string;
  name: string;
  course_code: string;
  description?: string;
  external_link?: string;
  thumbnail_url?: string;
  assigned_student_ids: string[];
  faculty_id?: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id?: string;
}

const CourseAssignment: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  // Fetch courses - simple approach
  const fetchCourses = async () => {
    if (!profile) {
      return;
    }

    if (profile.role !== 'faculty') {
      return;
    }

    try {
      setLoading(true);

      // Fetch courses belonging to the current faculty
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('faculty_id', profile.id)
        .order('name');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return;
      }
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned students - simple approach
  const fetchAssignedStudents = async () => {
    if (!profile || profile.role !== 'faculty') {
      return;
    }

    try {
      // Just fetch all students for now - simple
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return;
      }
      setAssignedStudents(studentsData || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Assign student to course
  const assignStudentToCourse = async () => {
    if (!selectedCourse || !selectedStudent) {
      toast({
        title: 'Error',
        description: 'Please select both course and student',
        variant: 'destructive',
      });
      return;
    }

    try {
      const course = courses.find(c => c.id === selectedCourse);
      if (!course) return;

      let updatedStudentIds = [...(course.assigned_student_ids || [])];

      if (selectedStudent === 'all') {
        // Assign all assigned students to the course
        const allStudentIds = assignedStudents.map(s => s.id.toString());
        updatedStudentIds = [
          ...new Set([...updatedStudentIds, ...allStudentIds]),
        ];
      } else {
        // Assign single student
        const studentId = selectedStudent.toString();
        if (!updatedStudentIds.includes(studentId)) {
          updatedStudentIds.push(studentId);
        }
      }
      const { data, error } = await supabase
        .from('courses')
        .update({ assigned_student_ids: updatedStudentIds })
        .eq('id', selectedCourse)
        .select();

      if (error) {
        console.error('Error updating course:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('You do not have permission to modify this course. Make sure you are the one who created it.');
      }
      const message =
        selectedStudent === 'all'
          ? `All ${assignedStudents.length} students assigned to course successfully`
          : 'Student assigned to course successfully';

      toast({
        title: 'Success',
        description: message,
      });

      // Refresh courses
      await fetchCourses();
      setSelectedStudent('');
    } catch (err: any) {
      console.error('Error assigning student to course:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign student to course',
        variant: 'destructive',
      });
    }
  };

  // Remove student from course
  const removeStudentFromCourse = async (
    courseId: string,
    studentId: string
  ) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const updatedStudentIds = (course.assigned_student_ids || []).filter(
        id => id !== studentId
      );

      const { data, error } = await supabase
        .from('courses')
        .update({ assigned_student_ids: updatedStudentIds })
        .eq('id', courseId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('You do not have permission to modify this course. Make sure you are the one who created it.');
      }

      toast({
        title: 'Success',
        description: 'Student removed from course successfully',
      });

      // Refresh courses
      await fetchCourses();
    } catch (err: any) {
      console.error('Error removing student from course:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove student from course',
        variant: 'destructive',
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCourses();
    fetchAssignedStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Refresh courses when a new one is created

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Course Assignment
          </CardTitle>
          <CardDescription>Assign your courses to students</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Assignment Form */}
          <div className='flex flex-wrap gap-4 mb-6'>
            <div className='flex-1 min-w-[200px]'>
              <Label htmlFor='course'>Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder='Choose a course' />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <SelectItem value='no-courses' disabled>
                      No courses available
                    </SelectItem>
                  ) : (
                    courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.course_code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='flex-1 min-w-[200px]'>
              <Label htmlFor='student'>Select Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a student' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Assigned Students</SelectItem>
                  {assignedStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-end'>
              <Button
                onClick={assignStudentToCourse}
                disabled={!selectedCourse || !selectedStudent}
              >
                <Plus className='h-4 w-4 mr-1' />
                Assign
              </Button>
            </div>
          </div>

          {/* Courses List */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Available Courses</h3>
              <p className='text-sm text-gray-500'>
                Create courses in the Courses page
              </p>
            </div>
            {loading ? (
              <div className='text-center py-4'>Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>No courses available</p>
                <p className='text-sm text-gray-400'>
                  Go to the Courses page to create courses
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {courses.map(course => (
                  <Card
                    key={course.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-lg'>
                            {course.name}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {course.course_code}
                          </p>
                          {course.description && (
                            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                              {course.description}
                            </p>
                          )}
                        </div>
                        {course.external_link && (
                          <a
                            href={course.external_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:text-primary/80 transition-colors'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </a>
                        )}
                      </div>

                      {/* Assigned Students */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm font-medium'>
                            Assigned Students (
                            {course.assigned_student_ids?.length || 0})
                          </span>
                        </div>

                        {course.assigned_student_ids &&
                        course.assigned_student_ids.length > 0 ? (
                          <div className='space-y-1'>
                            {course.assigned_student_ids.map(studentId => {
                              const student = assignedStudents.find(
                                s => s.id.toString() === studentId.toString()
                              );
                              return student ? (
                                <div
                                  key={studentId}
                                  className='flex items-center justify-between bg-gray-50 rounded px-2 py-1'
                                >
                                  <span className='text-sm'>
                                    {student.full_name}
                                  </span>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      removeStudentFromCourse(
                                        course.id,
                                        studentId
                                      )
                                    }
                                    className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                                  >
                                    <X className='h-3 w-3' />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            No students assigned
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Section - Remove this after fixing */}
      <CourseDebug />
    </div>
  );
};

export default CourseAssignment;
