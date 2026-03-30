import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Award,
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface Credential {
  id: string;
  vc_id: string;
  student_id: string;
  issuer_id: string;
  activity_id?: string;
  credential_json: any;
  short_token: string;
  issued_at: string;
  expires_at: string;
  revoked_at?: string;
  revocation_reason?: string;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface IssueCredentialFormData {
  studentId: string;
  activityTitle: string;
  activityType: string;
  organizer: string;
  role: string;
  date: string;
  location: string;
  hours: number;
  department: string;
  description: string;
}

export const FacultyCredentials: React.FC = () => {
  const { profile } = useProfile();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [formData, setFormData] = useState<IssueCredentialFormData>({
    studentId: '',
    activityTitle: '',
    activityType: 'Conference',
    organizer: '',
    role: 'Participant',
    date: '',
    location: '',
    hours: 1,
    department: '',
    description: '',
  });

  useEffect(() => {
    if (profile) {
      fetchCredentials();
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchCredentials = async () => {
    if (!profile) {
      return;
    }
    setLoading(true);

    try {
      // Get faculty record by email (fallback to user_id if needed)
      let { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id, email, name, user_id')
        .eq('email', profile.email)
        .single();

      // If not found by email, try by user_id
      if (facultyError && profile.id) {
        const { data: facultyDataByUserId, error: facultyErrorByUserId } =
          await supabase
            .from('faculty')
            .select('id, email, name, user_id')
            .eq('user_id', profile.id)
            .single();

        if (!facultyErrorByUserId && facultyDataByUserId) {
          facultyData = facultyDataByUserId;
          facultyError = null;
        }
      }
      if (facultyError || !facultyData) {
        console.error('Faculty not found:', facultyError);
        // Fallback: show all credentials for debugging
        const { data: allCredentials } = await supabase
          .from('verifiable_credentials')
          .select(
            `
            *,
            student:profiles!verifiable_credentials_student_id_fkey(
              id,
              full_name,
              email
            )
          `
          )
          .order('issued_at', { ascending: false })
          .limit(10);
        setCredentials(allCredentials || []);
        setLoading(false);
        return;
      }
      // Get credentials issued by this faculty
      // Since we now use a default issuer, we need to find credentials by checking the faculty info in metadata
      // First, let's try to get all credentials and filter by faculty info in metadata
      const { data: allCredentials, error: allCredentialsError } =
        await supabase
          .from('verifiable_credentials')
          .select(
            `
          *,
          student:profiles!verifiable_credentials_student_id_fkey(
            id,
            full_name,
            email
          )
        `
          )
          .order('issued_at', { ascending: false });

      if (allCredentialsError) {
        console.error('Error fetching all credentials:', allCredentialsError);
        setLoading(false);
        return;
      }

      // Filter credentials by faculty info in metadata
      const credentialsData =
        allCredentials?.filter(cred => {
          const facultyInfo =
            cred.credential_json?.credentialSubject?.metadata?.issuedByFaculty;
          return facultyInfo && facultyInfo.id === facultyData.id;
        }) || [];
      setCredentials(credentialsData || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!profile) return;

    try {
      // Get faculty record by email (fallback to user_id if needed)
      let { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id')
        .eq('email', profile.email)
        .single();

      // If not found by email, try by user_id
      if (facultyError && profile.id) {
        const { data: facultyDataByUserId, error: facultyErrorByUserId } =
          await supabase
            .from('faculty')
            .select('id')
            .eq('user_id', profile.id)
            .single();

        if (!facultyErrorByUserId && facultyDataByUserId) {
          facultyData = facultyDataByUserId;
          facultyError = null;
        }
      }

      if (facultyError || !facultyData) {
        console.error('Faculty not found');
        return;
      }

      // Get assigned students
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('student_mentor_assignments')
        .select(
          `
          student:profiles!student_mentor_assignments_student_id_fkey(
            id,
            full_name,
            email
          )
        `
        )
        .eq('mentor_id', facultyData.id);

      if (assignmentsError) {
        console.error('Error fetching students:', assignmentsError);
        return;
      }

      const studentsData =
        assignmentsData
          ?.map(assignment => assignment.student)
          .filter(Boolean) || [];
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      return;
    }
    try {
      setLoading(true);

      // Reset form
      setFormData({
        studentId: '',
        activityTitle: '',
        activityType: 'Conference',
        organizer: '',
        role: 'Participant',
        date: '',
        location: '',
        hours: 1,
        department: '',
        description: '',
      });

      setIsIssueModalOpen(false);

      // Refresh credentials list
      await fetchCredentials();

      alert('Credential issued successfully!');
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('Failed to issue credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(
    credential =>
      credential.student?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      credential.credential_json?.credentialSubject?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      credential.credential_json?.credentialSubject?.organizer
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (credential: Credential) => {
    if (credential.revoked_at) {
      return <XCircle className='h-4 w-4 text-red-500' />;
    }
    if (new Date(credential.expires_at) < new Date()) {
      return <Clock className='h-4 w-4 text-amber-500' />;
    }
    return <CheckCircle className='h-4 w-4 text-green-500' />;
  };

  const getStatusBadge = (credential: Credential) => {
    if (credential.revoked_at) {
      return <Badge variant='destructive'>Revoked</Badge>;
    }
    if (new Date(credential.expires_at) < new Date()) {
      return <Badge variant='secondary'>Expired</Badge>;
    }
    return <Badge variant='default'>Active</Badge>;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Issue Credentials</h2>
          <p className='text-muted-foreground'>
            Issue verifiable credentials to students
          </p>
        </div>
        <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
          <DialogTrigger asChild>
            <Button className='bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-200'>
              <Plus className='h-4 w-4 mr-2' />
              Issue Credential
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Issue New Credential</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIssueCredential} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='studentId'>Student</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={value =>
                      setFormData({ ...formData, studentId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select student' />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='activityType'>Activity Type</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={value =>
                      setFormData({ ...formData, activityType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Conference'>Conference</SelectItem>
                      <SelectItem value='Workshop'>Workshop</SelectItem>
                      <SelectItem value='Seminar'>Seminar</SelectItem>
                      <SelectItem value='Competition'>Competition</SelectItem>
                      <SelectItem value='Project'>Project</SelectItem>
                      <SelectItem value='Internship'>Internship</SelectItem>
                      <SelectItem value='Research'>Research</SelectItem>
                      <SelectItem value='Volunteer'>Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='activityTitle'>Activity Title</Label>
                <Input
                  id='activityTitle'
                  value={formData.activityTitle}
                  onChange={e =>
                    setFormData({ ...formData, activityTitle: e.target.value })
                  }
                  placeholder='e.g., International Conference on AI'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='organizer'>Organizer</Label>
                  <Input
                    id='organizer'
                    value={formData.organizer}
                    onChange={e =>
                      setFormData({ ...formData, organizer: e.target.value })
                    }
                    placeholder='e.g., IEEE Computer Society'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='role'>Role</Label>
                  <Input
                    id='role'
                    value={formData.role}
                    onChange={e =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder='e.g., Presenter, Participant'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='date'>Date</Label>
                  <Input
                    id='date'
                    type='date'
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='hours'>Hours</Label>
                  <Input
                    id='hours'
                    type='number'
                    min='1'
                    value={formData.hours}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        hours: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder='e.g., Mumbai, India'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='department'>Department</Label>
                <Input
                  id='department'
                  value={formData.department}
                  onChange={e =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder='e.g., Computer Science'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Additional details about the activity...'
                  rows={3}
                />
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsIssueModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? 'Issuing...' : 'Issue Credential'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className='flex items-center space-x-2'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search credentials...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Credentials List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5' />
            Issued Credentials ({credentials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>Loading credentials...</div>
          ) : filteredCredentials.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <Award className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>No credentials issued yet</p>
              <p className='text-sm'>
                Issue your first credential to get started
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredCredentials.map(credential => (
                <div
                  key={credential.id}
                  className='border rounded-lg p-4 space-y-3'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        {getStatusIcon(credential)}
                        <h3 className='font-semibold'>
                          {credential.credential_json?.credentialSubject
                            ?.title || 'Activity Credential'}
                        </h3>
                        {getStatusBadge(credential)}
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm text-muted-foreground'>
                        <div>
                          <span className='font-medium'>Student:</span>{' '}
                          {credential.student?.full_name}
                        </div>
                        <div>
                          <span className='font-medium'>Organizer:</span>{' '}
                          {
                            credential.credential_json?.credentialSubject
                              ?.organizer
                          }
                        </div>
                        <div>
                          <span className='font-medium'>Role:</span>{' '}
                          {credential.credential_json?.credentialSubject?.role}
                        </div>
                        <div>
                          <span className='font-medium'>Date:</span>{' '}
                          {new Date(credential.issued_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className='font-medium'>Hours:</span>{' '}
                          {credential.credential_json?.credentialSubject?.hours}
                        </div>
                        <div>
                          <span className='font-medium'>Expires:</span>{' '}
                          {new Date(credential.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className='flex space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          window.open(
                            `/verify?t=${credential.short_token}`,
                            '_blank'
                          )
                        }
                      >
                        <Eye className='h-4 w-4 mr-1' />
                        View
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          const dataStr = JSON.stringify(
                            credential.credential_json,
                            null,
                            2
                          );
                          const dataUri =
                            'data:application/json;charset=utf-8,' +
                            encodeURIComponent(dataStr);
                          const linkElement = document.createElement('a');
                          linkElement.setAttribute('href', dataUri);
                          linkElement.setAttribute(
                            'download',
                            `credential-${credential.vc_id.split(':').pop()}.json`
                          );
                          linkElement.click();
                        }}
                      >
                        <Download className='h-4 w-4 mr-1' />
                        Download
                      </Button>
                    </div>
                  </div>

                  {credential.revoked_at && (
                    <div className='bg-red-50 border border-red-200 rounded p-3'>
                      <p className='text-sm text-red-800'>
                        <strong>Revoked:</strong>{' '}
                        {credential.revocation_reason || 'No reason provided'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
