import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, Mail, GraduationCap } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Faculty = Tables<'faculty'>;

interface AssignMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Profile[];
  faculty: Faculty[];
  onAssign: (studentId: string, mentorId: string) => void;
}

const AssignMentorModal: React.FC<AssignMentorModalProps> = ({
  open,
  onOpenChange,
  students,
  faculty,
  onAssign,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedMentor) {
      toast({
        title: 'Error',
        description: 'Please select both a student and a mentor',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedStudent, selectedMentor);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudent('');
    setSelectedMentor('');
    onOpenChange(false);
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const selectedMentorData = faculty.find(f => f.id === selectedMentor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Mentor to Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='student'>Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder='Choose a student' />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className='flex items-center space-x-2'>
                      <GraduationCap className='h-4 w-4 text-green-600' />
                      <span>{student.full_name}</span>
                      <Badge variant='outline' className='text-xs'>
                        {student.student_id || 'N/A'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStudentData && (
              <div className='mt-2 p-3 bg-gray-50 rounded-md'>
                <div className='flex items-center space-x-2 text-sm'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <span>{selectedStudentData.email}</span>
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  Department:{' '}
                  {selectedStudentData.faculty_id || 'Computer Science'}
                </div>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='mentor'>Select Mentor</Label>
            <Select value={selectedMentor} onValueChange={setSelectedMentor}>
              <SelectTrigger>
                <SelectValue placeholder='Choose a verified faculty member' />
              </SelectTrigger>
              <SelectContent>
                {faculty.map(mentor => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    <div className='flex items-center space-x-2'>
                      <UserCheck className='h-4 w-4 text-blue-600' />
                      <span>{mentor.name}</span>
                      <Badge variant='secondary' className='text-xs'>
                        {mentor.department}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMentorData && (
              <div className='mt-2 p-3 bg-blue-50 rounded-md'>
                <div className='flex items-center space-x-2 text-sm'>
                  <span className='font-medium'>
                    {selectedMentorData.designation}
                  </span>
                </div>
                <div className='text-xs text-gray-600 mt-1'>
                  Department: {selectedMentorData.department}
                </div>
                <div className='text-xs text-green-600 mt-1'>
                  ✓ Verified Faculty
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading || !selectedStudent || !selectedMentor}
            >
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Assigning...
                </>
              ) : (
                'Assign Mentor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignMentorModal;
