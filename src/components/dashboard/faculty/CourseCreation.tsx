import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, BookOpen } from 'lucide-react';

interface CourseFormData {
  name: string;
  course_code: string;
  description: string;
  external_link: string;
  credit_hours: number;
  tags: string;
}

const CourseCreation: React.FC<{ onCourseCreated: () => void }> = ({
  onCourseCreated,
}) => {
  const { profile } = useProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    course_code: '',
    description: '',
    external_link: '',
    credit_hours: 3,
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.role !== 'faculty') return;

    try {
      setLoading(true);
      // Get faculty record to get faculty table ID
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (facultyError || !facultyData) {
        console.error('Faculty record not found:', facultyError);
        toast({
          title: 'Error',
          description:
            'Faculty record not found. Please contact administrator.',
          variant: 'destructive',
        });
        return;
      }

      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      // Create course
      const { error } = await supabase.from('courses').insert({
        name: formData.name,
        course_code: formData.course_code,
        description: formData.description,
        external_link: formData.external_link || null,
        credit_hours: formData.credit_hours,
        tags: tagsArray,
        faculty_id: facultyData.id,
        assigned_student_ids: [],
      });

      if (error) {
        console.error('Error creating course:', error);
        throw error;
      }
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });

      // Reset form
      setFormData({
        name: '',
        course_code: '',
        description: '',
        external_link: '',
        credit_hours: 3,
        tags: '',
      });
      setShowForm(false);

      // Notify parent component
      onCourseCreated();
    } catch (err: any) {
      console.error('Error creating course:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <BookOpen className='h-12 w-12 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No Courses Found
            </h3>
            <p className='text-gray-600 mb-4'>
              Create your first course to start assigning it to students.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create Course
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Plus className='h-5 w-5' />
          Create New Course
        </CardTitle>
        <CardDescription>
          Add a new course that you can assign to students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Course Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Introduction to Computer Science'
                required
              />
            </div>
            <div>
              <Label htmlFor='course_code'>Course Code *</Label>
              <Input
                id='course_code'
                value={formData.course_code}
                onChange={e =>
                  setFormData({ ...formData, course_code: e.target.value })
                }
                placeholder='e.g., CS101'
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Brief description of the course...'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='external_link'>External Link</Label>
              <Input
                id='external_link'
                type='url'
                value={formData.external_link}
                onChange={e =>
                  setFormData({ ...formData, external_link: e.target.value })
                }
                placeholder='https://example.com/course'
              />
            </div>
            <div>
              <Label htmlFor='credit_hours'>Credit Hours</Label>
              <Input
                id='credit_hours'
                type='number'
                min='1'
                max='6'
                value={formData.credit_hours}
                onChange={e =>
                  setFormData({
                    ...formData,
                    credit_hours: parseInt(e.target.value) || 3,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor='tags'>Tags (comma-separated)</Label>
            <Input
              id='tags'
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder='e.g., Programming, Beginner, Mandatory'
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <Button type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseCreation;
