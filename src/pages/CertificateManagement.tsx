import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AnalyticsCards from '@/components/certificates/AnalyticsCards';
import ActionBar from '@/components/certificates/ActionBar';
import CertificateCard, { Certificate } from '@/components/certificates/CertificateCard';
import UploadCertificateForm from '@/components/certificates/UploadCertificateForm';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CertificateManagement: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      setCertificates((data as Certificate[]) || []);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      toast({
        title: 'Error',
        description: 'Failed to load certificates: ' + err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Analytics
  const totalCertificates = certificates.length;
  const approvedCertificates = certificates.filter(c => c.status === 'approved').length;
  const pendingCertificates = certificates.filter(c => c.status === 'pending').length;
  const verifiedCertificates = certificates.filter(c => c.status === 'approved').length;

  const handleViewCertificate = (certificate: Certificate) => {
    window.open(certificate.file_url, '_blank');
  };

  const handleExportClick = () => {
    toast({
      title: 'Export Certificates',
      description: 'Preparing certificate export...',
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 transition-colors duration-300'>
      <div className='w-full mx-auto space-y-4 px-2 sm:px-3 md:px-8 py-4'>
        {/* Page Header */}
        <div className='flex items-center gap-4 mb-2 py-5'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/')}
            className='text-gray-600 hover:bg-gray-100'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Award className='w-6 h-6 text-blue-500' />
            Certificate Management
          </h1>
        </div>

        {/* Analytics Section */}
        <AnalyticsCards
          totalCertificates={totalCertificates}
          verifiedCertificates={verifiedCertificates}
          pendingCertificates={pendingCertificates}
          approvedCertificates={approvedCertificates}
        />

        {/* Action Bar */}
        <ActionBar
          onUploadClick={() => setIsUploadModalOpen(true)}
          onFindReviewersClick={() =>
            toast({ title: 'Find Reviewers', description: 'Redirecting to reviewer directory...' })
          }
          onExportClick={handleExportClick}
        />

        {/* Certificates Grid */}
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>My Certificates</h2>
              <p className='text-sm text-gray-600 mt-1'>
                Your uploaded certificates and their review status
              </p>
            </div>
            <div className='text-sm text-gray-500'>
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
              <p className='mt-2 text-gray-600'>Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className='text-center py-10'>
              <div className='text-5xl mb-3'>📄</div>
              <h3 className='text-base font-medium text-gray-900 mb-2'>No certificates yet</h3>
              <p className='text-gray-600 mb-3'>
                Upload your first certificate to get started with tracking your achievements.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors duration-200'
              >
                Upload Certificate
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {certificates.map(certificate => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  onViewClick={handleViewCertificate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <UploadCertificateForm
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={fetchCertificates}
        />
      </div>
    </div>
  );
};

export default CertificateManagement;
