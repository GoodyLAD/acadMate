import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database } from 'lucide-react';

const CourseDebug: React.FC = () => {
  const { profile } = useProfile();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();

  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [allFaculty, setAllFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    try {
      setLoading(true);

      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(
          `
          *,
          profiles!courses_faculty_id_fkey(
            full_name,
            email
          )
        `
        )
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else {
        setAllCourses(coursesData || []);
      }

      // Fetch all faculty
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .order('created_at', { ascending: false });

      if (facultyError) {
        console.error('Error fetching faculty:', facultyError);
      } else {
        setAllFaculty(facultyData || []);
      }
    } catch (err) {
      console.error('Error fetching debug data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Course Assignment Debug
          </CardTitle>
          <CardDescription>
            Debug information for course assignment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <Button onClick={fetchDebugData} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh Data
              </Button>
            </div>

            {/* Current User Info */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-semibold mb-2'>Current User</h3>
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Role:</strong> {profile?.role}
              </p>
              <p>
                <strong>ID:</strong> {profile?.id}
              </p>
            </div>

            {/* Faculty Records */}
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h3 className='font-semibold mb-2'>
                Faculty Records ({allFaculty.length})
              </h3>
              {allFaculty.length === 0 ? (
                <p className='text-gray-600'>No faculty records found</p>
              ) : (
                <div className='space-y-2'>
                  {allFaculty.map(faculty => (
                    <div
                      key={faculty.id}
                      className='bg-white p-3 rounded border'
                    >
                      <p>
                        <strong>ID:</strong> {faculty.id}
                      </p>
                      <p>
                        <strong>Name:</strong> {faculty.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {faculty.email}
                      </p>
                      <p>
                        <strong>Department:</strong> {faculty.department}
                      </p>
                      <p>
                        <strong>Is Verified:</strong>{' '}
                        {faculty.is_verified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Courses */}
            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='font-semibold mb-2'>
                All Courses ({allCourses.length})
              </h3>
              {allCourses.length === 0 ? (
                <p className='text-gray-600'>No courses found</p>
              ) : (
                <div className='space-y-2'>
                  {allCourses.map(course => (
                    <div
                      key={course.id}
                      className='bg-white p-3 rounded border'
                    >
                      <p>
                        <strong>ID:</strong> {course.id}
                      </p>
                      <p>
                        <strong>Name:</strong> {course.name}
                      </p>
                      <p>
                        <strong>Code:</strong> {course.course_code}
                      </p>
                      <p>
                        <strong>Faculty ID:</strong> {course.faculty_id}
                      </p>
                      <p>
                        <strong>Faculty Name:</strong>{' '}
                        {course.profiles?.full_name || 'Unknown'}
                      </p>
                      <p>
                        <strong>Faculty Email:</strong>{' '}
                        {course.profiles?.email || 'Unknown'}
                      </p>
                      <p>
                        <strong>Description:</strong>{' '}
                        {course.description || 'None'}
                      </p>
                      <p>
                        <strong>External Link:</strong>{' '}
                        {course.external_link || 'None'}
                      </p>
                      <p>
                        <strong>Assigned Students:</strong>{' '}
                        {course.assigned_student_ids?.length || 0}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {new Date(course.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDebug;
