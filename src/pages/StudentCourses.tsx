import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, ExternalLink, Calendar, Clock, Award } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  course_code: string;
  description?: string;
  external_link?: string;
  thumbnail_url?: string;
  credit_hours?: number;
  deadline?: string;
  tags?: string[];
  faculty_name?: string;
  created_at: string;
}

const StudentCourses: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses assigned to this student - simple approach
  const fetchAssignedCourses = async () => {
    if (!profile || profile.role !== 'student') {
      return;
    }

    try {
      setLoading(true);
      // Just fetch all courses - simple
      const { data: allCoursesData, error: allCoursesError } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (allCoursesError) {
        console.error('Error fetching courses:', allCoursesError);
        toast({
          title: 'Error',
          description: 'Failed to fetch courses: ' + allCoursesError.message,
          variant: 'destructive',
        });
        return;
      }
      // Filter courses where this student is assigned
      const assignedCourses = (allCoursesData || []).filter(course => {
        return (
          course.assigned_student_ids &&
          Array.isArray(course.assigned_student_ids) &&
          course.assigned_student_ids.some(id => {
            // Convert both to strings for comparison
            const studentIdStr = profile.id.toString();
            const assignedIdStr = id.toString();
            const matches = assignedIdStr === studentIdStr;
            return matches;
          })
        );
      });
      setCourses(assignedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load courses when profile is available
  useEffect(() => {
    if (profile) {
      fetchAssignedCourses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                My Courses
              </h1>
              <p className='text-gray-600'>
                Courses assigned to you by your faculty mentors
              </p>
            </div>
            <button
              onClick={fetchAssignedCourses}
              disabled={loading}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <p className='mt-2 text-gray-600'>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <div className='mb-4'>
                <BookOpen className='h-16 w-16 mx-auto text-gray-400' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No Courses Assigned
              </h3>
              <p className='text-gray-600'>
                You don't have any courses assigned yet. Contact your faculty
                mentor to get course assignments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map(course => (
              <Card
                key={course.id}
                className='hover:shadow-lg transition-all duration-300 group'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg group-hover:text-primary transition-colors'>
                        {course.name}
                      </CardTitle>
                      <CardDescription className='text-sm'>
                        {course.course_code} • {course.faculty_name}
                      </CardDescription>
                    </div>
                    {course.external_link && (
                      <a
                        href={course.external_link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary hover:text-primary/80 transition-colors'
                        title='Open course link'
                      >
                        <ExternalLink className='h-5 w-5' />
                      </a>
                    )}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Course Image */}
                  <div className='aspect-video bg-gray-100 rounded-lg overflow-hidden'>
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <BookOpen className='h-12 w-12 text-gray-400' />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {course.description && (
                    <p className='text-sm text-gray-600 line-clamp-3'>
                      {course.description}
                    </p>
                  )}

                  {/* Course Details */}
                  <div className='space-y-2'>
                    {course.credit_hours && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Award className='h-4 w-4' />
                        <span>{course.credit_hours} credit hours</span>
                      </div>
                    )}

                    {course.deadline && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Calendar className='h-4 w-4' />
                        <span>Deadline: {formatDate(course.deadline)}</span>
                      </div>
                    )}

                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>Assigned: {formatDate(course.created_at)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {course.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-xs'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {course.external_link && (
                    <a
                      href={course.external_link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
                    >
                      <ExternalLink className='h-4 w-4' />
                      Open Course
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {courses.length > 0 && (
          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Showing {courses.length} assigned course
              {courses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
