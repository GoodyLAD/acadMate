import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Faculty = Tables<'faculty'>;
type FacultyInsert = TablesInsert<'faculty'>;

interface FacultyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Faculty | null;
  onSave: () => void;
}

const FacultyForm: React.FC<FacultyFormProps> = ({
  open,
  onOpenChange,
  faculty,
  onSave,
}) => {
  const [formData, setFormData] = useState<FacultyInsert>({
    name: '',
    email: '',
    department: '',
    designation: '',
    faculty_code: '',
    phone: '',
    specialization: '',
    is_verified: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Business Administration',
    'Economics',
    'Psychology',
    'English',
    'History',
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Visiting Professor',
    'Adjunct Professor',
  ];

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation,
        is_verified: faculty.is_verified,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        designation: '',
        is_verified: false,
      });
    }
  }, [faculty, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (faculty) {
        // Update existing faculty
        const { error } = await supabase
          .from('faculty')
          .update(formData)
          .eq('id', faculty.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Faculty member updated successfully',
        });
      } else {
        // Create new faculty
        const { error } = await supabase.from('faculty').insert([formData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Faculty member added successfully',
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving faculty:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save faculty member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof FacultyInsert,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {faculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder='Enter full name'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder='Enter email address'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='department'>Department</Label>
            <Select
              value={formData.department}
              onValueChange={value => handleChange('department', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select department' />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='designation'>Designation</Label>
            <Select
              value={formData.designation}
              onValueChange={value => handleChange('designation', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select designation' />
              </SelectTrigger>
              <SelectContent>
                {designations.map(designation => (
                  <SelectItem key={designation} value={designation}>
                    {designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='faculty_code'>Faculty Code</Label>
            <Input
              id='faculty_code'
              value={formData.faculty_code}
              onChange={e => handleChange('faculty_code', e.target.value)}
              placeholder='e.g., CS001, IT002'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder='Enter phone number'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='specialization'>Specialization</Label>
            <Textarea
              id='specialization'
              value={formData.specialization}
              onChange={e => handleChange('specialization', e.target.value)}
              placeholder='Enter areas of specialization'
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {faculty ? 'Updating...' : 'Adding...'}
                </>
              ) : faculty ? (
                'Update Faculty'
              ) : (
                'Add Faculty'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyForm;
