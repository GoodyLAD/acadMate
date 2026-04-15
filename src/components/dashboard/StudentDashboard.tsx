import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useStudentSafe as useStudent } from '@/hooks/useStudentSafe';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ProfileSection from './student/ProfileSection';
import CertificatesSection from './student/CertificatesSection';
import CourseRecommendations from '../recommendations/CourseRecommendations';
import ExternalCourseRecommendations from '../recommendations/ExternalCourseRecommendations';
import ProfileSetup from '../recommendations/ProfileSetup';
import { StudentCredentials } from '../verifiableCredentials/StudentCredentials';
import UploadCertificateSection from './student/UploadCertificateSection';
import NotificationsDropdown from './student/NotificationsDropdown';
import StudentProgressCard from './student/StudentProgressCard';
import StudentGoalsCard from './student/StudentGoalsCard';
import AcademicAchievementDashboard from './student/AcademicAchievementDashboard';
import QuickUpload from './student/QuickUpload';
import SocialActivityFeed from './student/SocialActivityFeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Certificate {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  rejection_reason?: string;
  remark?: string;
}

const StudentDashboard = () => {
  const { profile } = useProfile();
  const { progress, goals, loading: studentLoading } = useStudent();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [certsOpen, setCertsOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', profile.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setCertificates((data as any) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    await fetchCertificates();
    setShowUploadPanel(false);
  };

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Derived stats for visuals
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const total = certificates.length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const approved = certificates.filter(c => c.status === 'approved').length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pending = certificates.filter(c => c.status === 'pending').length;

  const last7: { day: string; count: number }[] = (() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      map.set(key, 0);
    }
    for (const c of certificates) {
      const d = new Date(c.uploaded_at);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([day, count]) => ({ day, count }));
  })();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const weekTotal = last7.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Student Dashboard
          </h1>
          <div className='inline-flex items-center gap-3 bg-white rounded-full px-3 py-1 shadow-sm'>
            <span className='text-gray-600 text-sm'>
              Welcome back, {profile?.full_name}!
            </span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setProfileOpen(true)}
          >
            Profile
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCertsOpen(true)}
          >
            My Certificates
          </Button>
          <Button
            size='sm'
            onClick={() => setShowUploadPanel(v => !v)}
            className='bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-200'
          >
            <Upload className='h-4 w-4 mr-2' />
            {showUploadPanel ? 'Close Upload' : 'Upload Certificate'}
          </Button>
          <NotificationsDropdown />
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-7'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='progress'>Progress</TabsTrigger>
          <TabsTrigger value='goals'>Goals</TabsTrigger>
          <TabsTrigger value='achievements'>Achievements</TabsTrigger>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
          <TabsTrigger value='recommendations'>Recommendations</TabsTrigger>
          <TabsTrigger value='credentials'>Credentials</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Academic Achievement Dashboard */}
          <AcademicAchievementDashboard loading={studentLoading} />

          {/* Quick Upload Section */}
          <QuickUpload
            onUploadStart={() => undefined}
            onUploadComplete={handleUploadComplete}
          />

          {/* Progress and Goals */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <StudentProgressCard progress={progress} loading={studentLoading} />
            <StudentGoalsCard goals={goals} loading={studentLoading} />
          </div>

          {/* Social Activity Feed */}
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value='progress' className='space-y-6'>
          <StudentProgressCard progress={progress} loading={studentLoading} />
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value='goals' className='space-y-6'>
          <StudentGoalsCard goals={goals} loading={studentLoading} />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value='achievements' className='space-y-6'>
          <AcademicAchievementDashboard loading={studentLoading} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value='activity' className='space-y-6'>
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value='recommendations' className='space-y-6'>
          <div className='space-y-6'>
            {/* Internal Course Recommendations */}
            <CourseRecommendations />

            {/* External Course Recommendations */}
            <ExternalCourseRecommendations />

            {/* Profile Setup */}
            <ProfileSetup />
          </div>
        </TabsContent>

        {/* Verifiable Credentials Tab */}
        <TabsContent value='credentials' className='space-y-6'>
          {profile && <StudentCredentials studentId={profile.id} />}
        </TabsContent>
      </Tabs>

      {/* Upload Panel */}
      {showUploadPanel && (
        <div className='mt-6'>
          <UploadCertificateSection onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Popups */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <ProfileSection certificates={certificates} />
        </DialogContent>
      </Dialog>

      <Dialog open={certsOpen} onOpenChange={setCertsOpen}>
        <DialogContent className='sm:max-w-3xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>My Certificates</DialogTitle>
          </DialogHeader>
          <CertificatesSection 
            certificates={certificates} 
            onUploadClick={() => {
              setCertsOpen(false);
              setShowUploadPanel(true);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
