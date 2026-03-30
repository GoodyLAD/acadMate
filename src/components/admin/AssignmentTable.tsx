import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  UserX,
  Mail,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Faculty = Tables<'faculty'>;
type StudentMentorAssignment = Tables<'student_mentor_assignments'>;

interface AssignmentWithDetails extends StudentMentorAssignment {
  student?: Profile;
  mentor?: Faculty;
}

interface AssignmentTableProps {
  assignments: AssignmentWithDetails[];
  onUnassign: (assignmentId: string) => void;
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  onUnassign,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead className='w-[50px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='text-center py-8 text-gray-500'>
                No mentor assignments found
              </TableCell>
            </TableRow>
          ) : (
            assignments.map(assignment => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                      <GraduationCap className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <div className='font-medium'>
                        {assignment.student?.full_name}
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-500'>
                        <Mail className='h-3 w-3' />
                        <span>{assignment.student?.email}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {assignment.student?.student_id || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>
                    {assignment.student?.faculty_id || 'Computer Science'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className='text-sm text-gray-600'>
                    {assignment.student?.faculty_level || '3rd Year'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-blue-600'>
                        {assignment.mentor?.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <div className='font-medium'>
                        {assignment.mentor?.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {assignment.mentor?.department} •{' '}
                        {assignment.mentor?.designation}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      {formatDate(assignment.created_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => onUnassign(assignment.id)}
                        className='text-red-600'
                      >
                        <UserX className='h-4 w-4 mr-2' />
                        Unassign Mentor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignmentTable;
