import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Building2,
  ExternalLink,
  QrCode,
} from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  verified_at: string;
  verified_by: string;
  faculty_name: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  graduation_year: number;
  avatar_url?: string;
  bio: string;
  location: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  total_certificates: number;
  approved_certificates: number;
  pending_certificates: number;
  achievements: number;
  last_activity: string;
  certificates: Certificate[];
}

const RecruiterStudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudentProfile(id);
    }
  }, [id]);

  const fetchStudentProfile = async (studentId: string) => {
    try {
      setLoading(true);
      // Mock data for demo - in real app, this would fetch from API
      const mockStudent: StudentProfile = {
        id: studentId,
        full_name: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        student_id: '2024-CSE-001',
        department: 'Computer Science Engineering',
        graduation_year: 2024,
        bio: 'Passionate computer science student with expertise in full-stack development, machine learning, and cloud computing. Actively involved in coding competitions and open-source projects.',
        location: 'Mumbai, India',
        phone: '+91 98765 43210',
        linkedin_url: 'https://linkedin.com/in/alice-johnson',
        github_url: 'https://github.com/alice-johnson',
        total_certificates: 8,
        approved_certificates: 6,
        pending_certificates: 2,
        achievements: 12,
        last_activity: '2024-01-15',
        certificates: [
          {
            id: '1',
            title: 'AWS Cloud Practitioner',
            description:
              'Certified in Amazon Web Services cloud computing fundamentals',
            category: 'academic',
            status: 'approved',
            file_url: '/certificates/aws-cert.pdf',
            verified_at: '2024-01-10',
            verified_by: 'prof-001',
            faculty_name: 'Dr. Sarah Wilson',
          },
          {
            id: '2',
            title: 'React Development Bootcamp',
            description:
              'Complete React.js development course with hands-on projects',
            category: 'co_curricular',
            status: 'approved',
            file_url: '/certificates/react-cert.pdf',
            verified_at: '2024-01-08',
            verified_by: 'prof-002',
            faculty_name: 'Prof. Michael Chen',
          },
          {
            id: '3',
            title: 'Data Science Specialization',
            description:
              'Advanced data science and machine learning certification',
            category: 'academic',
            status: 'approved',
            file_url: '/certificates/datascience-cert.pdf',
            verified_at: '2024-01-05',
            verified_by: 'prof-001',
            faculty_name: 'Dr. Sarah Wilson',
          },
          {
            id: '4',
            title: 'Hackathon Winner - TechFest 2024',
            description: 'First place in national level hackathon competition',
            category: 'co_curricular',
            status: 'approved',
            file_url: '/certificates/hackathon-cert.pdf',
            verified_at: '2024-01-12',
            verified_by: 'prof-003',
            faculty_name: 'Dr. Rajesh Kumar',
          },
          {
            id: '5',
            title: 'Python Programming Mastery',
            description:
              'Advanced Python programming and algorithms certification',
            category: 'academic',
            status: 'pending',
            file_url: '/certificates/python-cert.pdf',
            verified_at: '',
            verified_by: '',
            faculty_name: '',
          },
          {
            id: '6',
            title: 'Leadership Workshop',
            description: 'Student leadership and team management workshop',
            category: 'co_curricular',
            status: 'pending',
            file_url: '/certificates/leadership-cert.pdf',
            verified_at: '',
            verified_by: '',
            faculty_name: '',
          },
        ],
      };
      setStudent(mockStudent);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'rejected':
        return <XCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            Student not found
          </h2>
          <p className='text-gray-600 mb-4'>
            The requested student profile could not be found.
          </p>
          <Button onClick={() => navigate('/recruiter/dashboard')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center h-16'>
            <Button
              variant='ghost'
              onClick={() => navigate('/recruiter/dashboard')}
              className='mr-4'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Button>
            <div className='flex items-center gap-3'>
              <Building2 className='h-6 w-6 text-blue-600' />
              <h1 className='text-xl font-semibold text-gray-900'>
                Student Profile
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Profile Info */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Basic Info */}
            <Card>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <Avatar className='h-24 w-24 mx-auto mb-4'>
                    <AvatarImage src={student.avatar_url} />
                    <AvatarFallback className='text-2xl'>
                      {student.full_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    {student.full_name}
                  </h2>
                  <p className='text-gray-600 mb-4'>{student.student_id}</p>
                  <Badge variant='secondary' className='mb-4'>
                    {student.department}
                  </Badge>
                  <p className='text-sm text-gray-600 mb-6'>{student.bio}</p>

                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span>{student.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-gray-400' />
                      <span>{student.phone}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <span>{student.location}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span>Graduation: {student.graduation_year}</span>
                    </div>
                  </div>

                  <div className='flex gap-2 mt-6'>
                    <Button className='flex-1'>
                      <Download className='h-4 w-4 mr-2' />
                      Download CV
                    </Button>
                    <Button variant='outline'>
                      <QrCode className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Profile Verified</span>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm text-green-600'>Verified</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Certificates</span>
                  <span className='text-sm text-gray-600'>
                    {student.approved_certificates}/{student.total_certificates}{' '}
                    verified
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Achievements</span>
                  <span className='text-sm text-gray-600'>
                    {student.achievements} earned
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Last Activity</span>
                  <span className='text-sm text-gray-600'>
                    {new Date(student.last_activity).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Social Links</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  asChild
                >
                  <a
                    href={student.linkedin_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    LinkedIn Profile
                  </a>
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  asChild
                >
                  <a
                    href={student.github_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    GitHub Profile
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Certificates and Achievements */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Certificates & Achievements
                </CardTitle>
                <p className='text-sm text-gray-600'>
                  All certificates are verified by college faculty members
                </p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {student.certificates.map(cert => (
                    <div
                      key={cert.id}
                      className='border rounded-lg p-4 hover:bg-gray-50'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h4 className='font-semibold text-gray-900'>
                              {cert.title}
                            </h4>
                            <Badge className={getStatusColor(cert.status)}>
                              {cert.status}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-3'>
                            {cert.description}
                          </p>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <span className='capitalize'>
                              {cert.category.replace('_', ' ')}
                            </span>
                            {cert.status === 'approved' && (
                              <>
                                <span>•</span>
                                <span>Verified by {cert.faculty_name}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    cert.verified_at
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center gap-2 ml-4'>
                          {getStatusIcon(cert.status)}
                          <Button variant='ghost' size='sm'>
                            <ExternalLink className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills & Technologies */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Skills & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {[
                    'JavaScript',
                    'React',
                    'Node.js',
                    'Python',
                    'AWS',
                    'MongoDB',
                    'SQL',
                    'Git',
                    'Docker',
                    'Machine Learning',
                    'Data Science',
                    'Problem Solving',
                    'Team Leadership',
                    'Project Management',
                  ].map(skill => (
                    <Badge key={skill} variant='secondary'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Contact Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex gap-3'>
                  <Button className='flex-1'>
                    <Mail className='h-4 w-4 mr-2' />
                    Send Message
                  </Button>
                  <Button variant='outline' className='flex-1'>
                    <Phone className='h-4 w-4 mr-2' />
                    Schedule Call
                  </Button>
                  <Button variant='outline'>
                    <Star className='h-4 w-4 mr-2' />
                    Add to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterStudentProfile;
