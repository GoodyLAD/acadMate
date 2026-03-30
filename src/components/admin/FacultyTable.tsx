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
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Calendar,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Faculty = Tables<'faculty'>;

interface FacultyTableProps {
  faculty: Faculty[];
  onEdit: (faculty: Faculty) => void;
  onDelete: (facultyId: string) => void;
  onVerify: (facultyId: string, isVerified: boolean) => void;
}

const FacultyTable: React.FC<FacultyTableProps> = ({
  faculty,
  onEdit,
  onDelete,
  onVerify,
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className='w-[50px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faculty.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='text-center py-8 text-gray-500'>
                No faculty members found
              </TableCell>
            </TableRow>
          ) : (
            faculty.map(member => (
              <TableRow key={member.id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-blue-600'>
                        {member.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </span>
                    </div>
                    <span>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Mail className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>{member.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{member.department}</Badge>
                </TableCell>
                <TableCell>{member.designation}</TableCell>
                <TableCell>
                  <Badge
                    variant={member.is_verified ? 'default' : 'secondary'}
                    className={
                      member.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {member.is_verified ? (
                      <>
                        <UserCheck className='h-3 w-3 mr-1' />
                        Verified
                      </>
                    ) : (
                      <>
                        <UserX className='h-3 w-3 mr-1' />
                        Unverified
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span className='text-sm'>
                      {formatDate(member.created_at)}
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
                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onVerify(member.id, !member.is_verified)}
                      >
                        {member.is_verified ? (
                          <>
                            <UserX className='h-4 w-4 mr-2' />
                            Unverify
                          </>
                        ) : (
                          <>
                            <UserCheck className='h-4 w-4 mr-2' />
                            Verify
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(member.id)}
                        className='text-red-600'
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
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

export default FacultyTable;
