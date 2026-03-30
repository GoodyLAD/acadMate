import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import AnalyticsCards from '@/components/certificates/AnalyticsCards';
import ActionBar from '@/components/certificates/ActionBar';
import CertificateCard, {
  Certificate,
} from '@/components/certificates/CertificateCard';
import UploadCertificateForm from '@/components/certificates/UploadCertificateForm';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ArrowLeft, Award } from 'lucide-react'; // use Award or any other icon
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Mock data for certificates
const mockCertificates: Certificate[] = [
  {
    id: '1',
    title: 'Google Cloud Associate Certificate',
    category: 'Verified Professional Certificates',
    issuingCompany: 'Google',
    reviewer: 'Dr. Ramesh Sharma',
    status: 'Verified',
    uploadedAt: '2024-01-15T10:00:00Z',
    description:
      'Professional certification in Google Cloud Platform fundamentals and core infrastructure.',
  },
  {
    id: '2',
    title: 'National Hackathon Winner',
    category: 'Co-Curricular',
    subcategory: 'National',
    reviewer: 'Dr. A.K. Singh',
    status: 'Approved',
    uploadedAt: '2024-01-10T14:30:00Z',
    description:
      'First place winner in the National Level Coding Hackathon organized by IIT Delhi.',
  },
  {
    id: '3',
    title: 'Volunteer at NSS Camp',
    category: 'Co-Curricular',
    subcategory: 'Volunteer / Social Work',
    reviewer: 'Amit Tiwari',
    status: 'Pending',
    uploadedAt: '2024-01-20T09:15:00Z',
    description:
      'Active participation in National Service Scheme camp for community development.',
  },
  {
    id: '4',
    title: 'AWS Solutions Architect',
    category: 'Verified Professional Certificates',
    issuingCompany: 'AWS',
    reviewer: 'Prof. Anjali Mehta',
    status: 'Verified',
    uploadedAt: '2024-01-05T16:45:00Z',
    description:
      'Professional certification demonstrating expertise in AWS cloud architecture.',
  },
  {
    id: '5',
    title: 'State Level Science Exhibition',
    category: 'Co-Curricular',
    subcategory: 'State',
    reviewer: 'Dr. Vijay Deshmukh',
    status: 'Approved',
    uploadedAt: '2024-01-12T11:20:00Z',
    description:
      'Second prize winner in State Level Science and Technology Exhibition.',
  },
  {
    id: '6',
    title: 'Workshop on Machine Learning',
    category: 'Academic',
    subcategory: 'Workshops / Training',
    reviewer: 'Deepak Kumar',
    status: 'Pending',
    uploadedAt: '2024-01-18T13:00:00Z',
    description:
      'Completed intensive workshop on Machine Learning and AI fundamentals.',
  },
];

const CertificateManagement: React.FC = () => {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signOut } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { profile } = useProfile();

  const [certificates, setCertificates] =
    useState<Certificate[]>(mockCertificates);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDarkMode, setIsDarkMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);

  // Keep dark mode in sync with document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Calculate analytics data
  const totalCertificates = certificates.length;
  const verifiedCertificates = certificates.filter(
    cert => cert.status === 'Verified'
  ).length;
  const pendingCertificates = certificates.filter(
    cert => cert.status === 'Pending'
  ).length;
  const approvedCertificates = certificates.filter(
    cert => cert.status === 'Approved'
  ).length;

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleFindReviewersClick = () => {
    toast({
      title: 'Find Reviewers',
      description: 'Redirecting to reviewer directory...',
    });
    // TODO: Implement navigation to reviewer directory
  };

  const handleExportClick = () => {
    toast({
      title: 'Export Certificates',
      description: 'Preparing certificate export...',
    });
    // TODO: Implement export functionality
  };

  const handleCertificateSubmit = (certificateData: any) => {
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      title: certificateData.title,
      description: certificateData.description,
      category: certificateData.category,
      subcategory: certificateData.subcategory,
      issuingCompany: certificateData.issuingCompany,
      reviewer: certificateData.reviewer,
      status: certificateData.status,
      uploadedAt: certificateData.uploadedAt,
    };

    setCertificates(prev => [newCertificate, ...prev]);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    toast({
      title: 'View Certificate',
      description: `Opening ${certificate.title}...`,
    });
    // TODO: Implement view functionality
  };

  const handleEditCertificate = (certificate: Certificate) => {
    toast({
      title: 'Edit Certificate',
      description: `Editing ${certificate.title}...`,
    });
    // TODO: Implement edit functionality
  };

  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'
      }`}
    >
      {/* 🔹 Top Navigation Bar */}

      {/* 🔹 Main Container */}
      <div className='w-full mx-auto space-y-4 px-2 sm:px-3 md:px-8 py-4'>
        {/* 🔹 Page Header */}
        <div className='flex items-center gap-4 mb-2 py-5'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/')}
            className={`hover:bg-opacity-80 ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
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
          onUploadClick={handleUploadClick}
          onFindReviewersClick={handleFindReviewersClick}
          onExportClick={handleExportClick}
        />

        {/* Recent Certificates Section */}
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Recent Certificates
              </h2>
              <p className='text-sm text-gray-600 mt-1'>
                Your uploaded certificates and their review status
              </p>
            </div>
            <div className='text-sm text-gray-500'>
              {certificates.length} certificate
              {certificates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className='text-center py-10'>
              <div className='text-5xl mb-3'>📄</div>
              <h3 className='text-base font-medium text-gray-900 mb-2'>
                No certificates yet
              </h3>
              <p className='text-gray-600 mb-3'>
                Upload your first certificate to get started with tracking your
                achievements.
              </p>
              <button
                onClick={handleUploadClick}
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
                  onEditClick={handleEditCertificate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upload Certificate Modal */}
        <UploadCertificateForm
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleCertificateSubmit}
        />
      </div>
    </div>
  );
};

export default CertificateManagement;
