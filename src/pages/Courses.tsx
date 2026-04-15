import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, ExternalLink, Calendar, Clock, Award } from 'lucide-react';

const TAG_OPTIONS = [
  'Mandatory',
  'Optional',
  'Skill-based',
  'Elective',
] as const;

import { useProfile } from '@/hooks/useProfile';

const CoursesPage: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useProfile();

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creditHours, setCreditHours] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [externalLink, setExternalLink] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [faculties, setFaculties] = useState<
    Array<{ id: string; full_name: string }>
  >([]);
  const [currentFacultyId, setCurrentFacultyId] = useState<string | null>(null);

  useEffect(() => {
    // fetch faculties list
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'faculty');
        if (error) {
          console.error('Error loading faculties', error);
        } else if (data) {
          setFaculties(data as any);
        }
      } catch (err) {
        console.error('Error loading faculties', err);
      }
    })();

    // Get current faculty ID if user is faculty
    (async () => {
      if (profile?.role === 'faculty') {
        try {
          const { data: facultyRecord } = await supabase
            .from('faculty')
            .select('id, name, email, user_id')
            .or(`user_id.eq.${profile.id},email.eq.${profile.email}`)
            .single();
          if (facultyRecord) {
            setCurrentFacultyId(facultyRecord.id);
          } else {
            /* no-op */
          }
        } catch (err) {
          console.error('Error getting faculty ID:', err);
        }
      }
    })();

    // fetch courses
    (async () => {
      setLoadingCourses(true);
      try {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) {
          const msg = (error as any)?.message ?? JSON.stringify(error);
          console.error('Error loading courses', msg);
          const missingTable =
            /Could not find the table|does not exist|relation ".*courses.*" does not exist/i.test(
              msg
            );
          if (missingTable) {
            setDbMissing(true);
            toast({
              title: 'Missing courses table',
              description:
                'Using sample data. Open console for SQL to create the table in Supabase.',
              variant: 'destructive',
            });
            const sample = [
              {
                id: 'c1',
                name: 'Intro to Algorithms',
                course_code: 'CS101',
                faculty_id: null,
                tags: ['Mandatory'],
                description: 'Basics of algorithms',
                deadline: null,
                credit_hours: 3,
                thumbnail_url: null,
                external_link: null,
              },
              {
                id: 'c2',
                name: 'Data Structures',
                course_code: 'CS102',
                faculty_id: null,
                tags: ['Mandatory'],
                description: 'Core data structures',
                deadline: null,
                credit_hours: 4,
                thumbnail_url: null,
                external_link: null,
              },
            ];
            setCourses(sample);
          } else {
            toast({
              title: 'Error loading courses',
              description: msg,
              variant: 'destructive',
            });
          }
        } else if (data) {
          setCourses(data as any[]);
        }
      } catch (err) {
        const msg = (err as any)?.message ?? JSON.stringify(err);
        console.error('Error loading courses', msg);
        const missingTable =
          /Could not find the table|does not exist|relation ".*courses.*" does not exist/i.test(
            msg
          );
        if (missingTable) {
          setDbMissing(true);
          toast({
            title: 'Missing courses table',
            description:
              'Using sample data. Open console for SQL to create the table in Supabase.',
            variant: 'destructive',
          });
          const sample = [
            {
              id: 'c1',
              name: 'Intro to Algorithms',
              course_code: 'CS101',
              faculty_id: null,
              tags: ['Mandatory'],
              description: 'Basics of algorithms',
              deadline: null,
              credit_hours: 3,
              thumbnail_url: null,
              external_link: null,
            },
            {
              id: 'c2',
              name: 'Data Structures',
              course_code: 'CS102',
              faculty_id: null,
              tags: ['Mandatory'],
              description: 'Core data structures',
              deadline: null,
              credit_hours: 4,
              thumbnail_url: null,
              external_link: null,
            },
          ];
          setCourses(sample);
        } else {
          toast({
            title: 'Error loading courses',
            description: msg,
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingCourses(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const validate = async (effectiveFacultyId?: string | null) => {
    const e: Record<string, string> = {};
    if (!courseName.trim()) e.courseName = 'Course name is required.';
    if (!courseCode.trim()) e.courseCode = 'Course code is required.';
    const fid = effectiveFacultyId ?? facultyId;
    if (!fid) e.faculty = 'Faculty is required.';
    if (!tags.length) e.tags = 'At least one tag is required.';
    if (!deadline) e.deadline = 'Deadline is required.';
    else if (deadline < todayISO)
      e.deadline = 'Deadline cannot be in the past.';

    // uniqueness check for course code
    if (courseCode.trim()) {
      try {
        const { data: existing, error } = await supabase
          .from('courses')
          .select('id')
          .eq('course_code', courseCode.trim())
          .limit(1)
          .maybeSingle();
        if (error) {
          const msg = (error as any)?.message ?? JSON.stringify(error);
          const missingTable =
            /Could not find the table|does not exist|relation ".*courses.*" does not exist/i.test(
              msg
            );
          if (missingTable) {
            setDbMissing(true);
            e.courseCode =
              'Database not initialized. Create the courses table (see console for SQL).';
          } else {
            console.error('Error checking course code uniqueness', msg);
          }
        } else if (existing) {
          e.courseCode =
            'Course code must be unique. A course with this code already exists.';
        }
      } catch (err) {
        const msg = (err as any)?.message ?? JSON.stringify(err);
        const missingTable =
          /Could not find the table|does not exist|relation ".*courses.*" does not exist/i.test(
            msg
          );
        if (missingTable) {
          setDbMissing(true);
          e.courseCode =
            'Database not initialized. Create the courses table (see console for SQL).';
        } else {
          console.error('Error checking course code uniqueness', msg);
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleThumbnailChange = (file?: File) => {
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        thumbnail: 'Only image files are allowed.',
      }));
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }
    setErrors(prev => {
      const c = { ...prev };
      delete c.thumbnail;
      return c;
    });
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      // Courses.faculty_id references profiles.id.
      // Use the faculty ID from the dropdown or default to the current profile's ID if user is faculty
      let effectiveFacultyId = facultyId;

      if (profile?.role === 'faculty' && !facultyId) {
        effectiveFacultyId = profile.id;
      }

      const ok = await validate(effectiveFacultyId);
      if (!ok) {
        setSubmitting(false);
        return;
      }

      // upload thumbnail if provided
      let thumbnail_url: string | null = null;
      if (thumbnailFile) {
        try {
          const filePath = `thumbnails/${courseCode.trim()}_${Date.now()}`;
          const { error: upErr } = await supabase.storage
            .from('course_thumbnails')
            .upload(filePath, thumbnailFile, { upsert: false });
          if (upErr) {
            console.error('Error uploading thumbnail', upErr);
            toast({
              title: 'Thumbnail upload failed',
              description: (upErr as any)?.message ?? 'Could not upload file',
            });
          } else {
            const { data } = supabase.storage
              .from('course_thumbnails')
              .getPublicUrl(filePath);
            thumbnail_url = data?.publicUrl ?? null;
          }
        } catch (err) {
          console.error('Thumbnail upload error', err);
          toast({
            title: 'Thumbnail upload failed',
            description: 'Network error while uploading thumbnail.',
          });
        }
      }

      // insert course
      const payload = {
        name: courseName.trim(),
        course_code: courseCode.trim(),
        faculty_id: effectiveFacultyId,
        tags,
        description: description || null,
        deadline: deadline,
        credit_hours: creditHours ? Number(creditHours) : null,
        thumbnail_url,
        external_link: externalLink || null,
      } as any;
      // Database enforces foreign key constraints against profiles.id

      const { error } = await supabase
        .from('courses')
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) {
        const msg = (error as any)?.message ?? JSON.stringify(error);
        console.error('Error creating course:', msg, error);
        const missingTable =
          /Could not find the table|does not exist|relation ".*courses.*" does not exist/i.test(
            msg
          );
        if (missingTable) {
          setDbMissing(true);
          toast({
            title: 'Missing courses table',
            description:
              'Create the table in Supabase, then retry. See console for SQL.',
            variant: 'destructive',
          });
          return;
        }
        if (msg.includes('duplicate key') || msg.includes('already exists')) {
          setErrors({
            courseCode:
              'Course code must be unique. A course with this code already exists.',
          });
          toast({
            title: 'Validation error',
            description: 'Course code already exists.',
          });
        } else {
          toast({
            title: 'Error creating course',
            description: msg,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Course created',
          description: 'Course was created successfully.',
        });
        // reset form
        setCourseName('');
        setCourseCode('');
        setFacultyId(null);
        setTags([]);
        setDescription('');
        setDeadline('');
        setCreditHours('');
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setExternalLink('');
        setErrors({});
        // refresh courses
        try {
          const { data: refreshed } = await supabase
            .from('courses')
            .select('*');
          if (refreshed) setCourses(refreshed as any[]);
        } catch (err) {
          console.error('Error refreshing courses after create', err);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Courses</h1>
              <p className='text-gray-600'>
                {profile?.role === 'student'
                  ? 'Courses assigned to you by your faculty mentors'
                  : profile?.role === 'faculty'
                    ? 'Manage and view your courses'
                    : 'All courses in the system'}
              </p>
            </div>
            {profile?.role === 'student' && (
              <button
                onClick={() => window.location.reload()}
                disabled={loadingCourses}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
              >
                {loadingCourses ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>

        {dbMissing && (
          <div className='mb-6'>
            <p className='text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded p-2'>
              Database not initialized for courses. Using sample data. Create
              the table in Supabase to enable full functionality.
            </p>
          </div>
        )}

        {profile?.role === 'faculty' && (
          <form
            onSubmit={onSubmit}
            className='space-y-6 bg-white p-6 rounded-md shadow-sm'
          >
            <div>
              <Label>Course Name *</Label>
              <Input
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder='Introduction to Algorithms'
              />
              {errors.courseName && (
                <p className='text-sm text-red-600 mt-1'>{errors.courseName}</p>
              )}
            </div>

            <div>
              <Label>Course Code *</Label>
              <Input
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder='CS101'
              />
              {errors.courseCode && (
                <p className='text-sm text-red-600 mt-1'>{errors.courseCode}</p>
              )}
            </div>

            <div>
              <Label>Faculty *</Label>
              <Select onValueChange={v => setFacultyId(v)}>
                <SelectTrigger>
                  <SelectValue>
                    {faculties.find(f => f.id === facultyId)?.full_name ??
                      'Select faculty'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(f => (
                    <SelectItem value={f.id} key={f.id}>
                      {f.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculty && (
                <p className='text-sm text-red-600 mt-1'>{errors.faculty}</p>
              )}
            </div>

            <div>
              <Label>Tags * (choose one or more)</Label>
              <div className='flex gap-4 flex-wrap mt-2'>
                {TAG_OPTIONS.map(t => (
                  <label key={t} className='inline-flex items-center space-x-2'>
                    <Checkbox
                      checked={tags.includes(t)}
                      onCheckedChange={() => toggleTag(t)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              {errors.tags && (
                <p className='text-sm text-red-600 mt-1'>{errors.tags}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={e =>
                  setDescription((e.target as HTMLTextAreaElement).value)
                }
                placeholder='Optional course description...'
              />
            </div>

            <div>
              <Label>Deadline *</Label>
              <Input
                type='date'
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={todayISO}
              />
              {errors.deadline && (
                <p className='text-sm text-red-600 mt-1'>{errors.deadline}</p>
              )}
            </div>

            <div>
              <Label>Credit Hours</Label>
              <Input
                type='number'
                min={0}
                value={creditHours}
                onChange={e => setCreditHours(e.target.value)}
                placeholder='e.g. 3'
              />
            </div>

            <div>
              <Label>Thumbnail (optional)</Label>
              <input
                accept='image/*'
                type='file'
                onChange={e => handleThumbnailChange(e.target.files?.[0])}
              />
              {errors.thumbnail && (
                <p className='text-sm text-red-600 mt-1'>{errors.thumbnail}</p>
              )}
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt='thumbnail preview'
                  className='mt-2 h-16 w-24 object-cover rounded'
                />
              )}
            </div>

            <div>
              <Label>External Link (optional)</Label>
              <Input
                type='url'
                value={externalLink}
                onChange={e => setExternalLink(e.target.value)}
                placeholder='https://example.com/course'
              />
            </div>

            <div className='flex items-center justify-end space-x-3'>
              <Button
                variant='ghost'
                onClick={() => {
                  setCourseName('');
                  setCourseCode('');
                  setFacultyId(null);
                  setTags([]);
                  setDescription('');
                  setDeadline('');
                  setCreditHours('');
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  setExternalLink('');
                  setErrors({});
                }}
              >
                Reset
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? 'Saving...' : 'Create Course'}
              </Button>
            </div>
          </form>
        )}

        {/* Courses Grid */}
        {loadingCourses ? (
          <div className='text-center py-12'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <p className='mt-2 text-gray-600'>Loading courses...</p>
          </div>
        ) : (
          (() => {
            const visibleCourses = courses.filter(c => {
              if (!profile) return false;
              if (profile.role === 'faculty') {
                // For faculty, show courses where faculty_id matches their profile.id
                return c.faculty_id === profile.id;
              }
              if (profile.role === 'student') {
                // For students, check if they are assigned to this course using profile.id
                const isAssigned =
                  c.assigned_student_ids &&
                  Array.isArray(c.assigned_student_ids) &&
                  c.assigned_student_ids.includes(profile.id);
                return isAssigned;
              }
              return false;
            });
            if (!visibleCourses.length) {
              return (
                <Card>
                  <CardContent className='text-center py-12'>
                    <div className='mb-4'>
                      <BookOpen className='h-16 w-16 mx-auto text-gray-400' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {profile?.role === 'student'
                        ? 'No Courses Assigned'
                        : 'No Courses Found'}
                    </h3>
                    <p className='text-gray-600'>
                      {profile?.role === 'student'
                        ? "You don't have any courses assigned yet. Contact your faculty mentor to get course assignments."
                        : 'No courses available at the moment.'}
                    </p>
                  </CardContent>
                </Card>
              );
            }

            const formatDate = (dateString: string) => {
              return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
            };

            return (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {visibleCourses.map(course => (
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
                            {course.course_code} •{' '}
                            {course.faculty_name || 'Faculty'}
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
                          <span>Created: {formatDate(course.created_at)}</span>
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
            );
          })()
        )}

        {/* Summary */}
        {(() => {
          const visibleCourses = courses.filter(c => {
            if (!profile) return false;
            if (profile.role === 'faculty') {
              return c.faculty_id === currentFacultyId;
            }
            if (profile.role === 'student') {
              const isAssigned =
                c.assigned_student_ids &&
                Array.isArray(c.assigned_student_ids) &&
                c.assigned_student_ids.includes(profile.id);
              return isAssigned;
            }
            return false;
          });

          return (
            visibleCourses.length > 0 && (
              <div className='mt-8 text-center'>
                <p className='text-gray-600'>
                  Showing {visibleCourses.length} course
                  {visibleCourses.length !== 1 ? 's' : ''}
                </p>
              </div>
            )
          );
        })()}
      </div>
    </div>
  );
};

export default CoursesPage;
