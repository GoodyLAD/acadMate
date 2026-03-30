import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Download,
  Share2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import {
  verifiableCredentialService,
  VerifiableCredential,
} from '../../services/verifiableCredentialService';
import { QRCardGenerator } from './QRCardGenerator';
import { toast } from '@/hooks/use-toast';

interface StudentCredentialsProps {
  studentId: string;
}

type SortField = 'issuedAt' | 'title' | 'issuer';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'valid' | 'revoked' | 'expired';

export const StudentCredentials: React.FC<StudentCredentialsProps> = ({
  studentId,
}) => {
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<
    VerifiableCredential[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('issuedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCredential, setSelectedCredential] =
    useState<VerifiableCredential | null>(null);
  const [showQRCard, setShowQRCard] = useState(false);

  useEffect(() => {
    loadCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    filterAndSortCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials, searchQuery, sortField, sortOrder, filterStatus]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const creds =
        await verifiableCredentialService.getStudentCredentials(studentId);
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCredentials = () => {
    let filtered = [...credentials];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        cred =>
          cred.credentialSubject.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cred.credentialSubject.activityType
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cred.credentialSubject.organizer
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cred.issuer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cred => {
        const isExpired =
          cred.expirationDate && new Date(cred.expirationDate) < new Date();
        switch (filterStatus) {
          case 'valid':
            return !isExpired;
          case 'expired':
            return isExpired;
          case 'revoked':
            // This would need to be checked against the database
            return false;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'issuedAt':
          aValue = new Date(a.issuanceDate);
          bValue = new Date(b.issuanceDate);
          break;
        case 'title':
          aValue = a.credentialSubject.title;
          bValue = b.credentialSubject.title;
          break;
        case 'issuer':
          aValue = a.issuer.name;
          bValue = b.issuer.name;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCredentials(filtered);
  };

  const getCredentialStatus = (credential: VerifiableCredential) => {
    const isExpired =
      credential.expirationDate &&
      new Date(credential.expirationDate) < new Date();
    if (isExpired)
      return { status: 'expired', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'valid', color: 'bg-green-100 text-green-800' };
  };

  const getStatusIcon = (credential: VerifiableCredential) => {
    const { status } = getCredentialStatus(credential);
    switch (status) {
      case 'valid':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'expired':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      case 'revoked':
        return <XCircle className='h-4 w-4 text-red-600' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-600' />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewCredential = (credential: VerifiableCredential) => {
    setSelectedCredential(credential);
    setShowQRCard(true);
  };

  const handleDownloadCredential = async (credential: VerifiableCredential) => {
    try {
      const blob = new Blob([JSON.stringify(credential, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credential-${credential.id.split(':').pop()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Credential downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to download credential',
        variant: 'destructive',
      });
    }
  };

  const handleShareCredential = async (credential: VerifiableCredential) => {
    const verificationUrl = credential.credentialSubject.verificationUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verifiable Credential',
          text: `Check out my verified activity: ${credential.credentialSubject.title}`,
          url: verificationUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy
        navigator.clipboard.writeText(verificationUrl);
        toast({
          title: 'Success',
          description: 'Verification link copied to clipboard',
        });
      }
    } else {
      // Fallback to copy
      navigator.clipboard.writeText(verificationUrl);
      toast({
        title: 'Success',
        description: 'Verification link copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading credentials...</p>
        </div>
      </div>
    );
  }

  if (showQRCard && selectedCredential) {
    return (
      <QRCardGenerator
        credential={{
          vcId: selectedCredential.id,
          credentialJson: selectedCredential,
          shortToken: '', // This would need to be stored in the credential
          qrUrl: selectedCredential.credentialSubject.verificationUrl,
          credentialUrl: `/api/v1/credentials/${selectedCredential.id}`,
        }}
        onDownload={() => setShowQRCard(false)}
        onShare={() => setShowQRCard(false)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          My Credentials
        </h2>
        <p className='text-gray-600'>
          View and manage your verifiable credentials
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search credentials...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className='flex gap-2'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='all'>All Status</option>
                <option value='valid'>Valid</option>
                <option value='expired'>Expired</option>
                <option value='revoked'>Revoked</option>
              </select>

              {/* Sort Field */}
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm'
              >
                <option value='issuedAt'>Sort by Date</option>
                <option value='title'>Sort by Title</option>
                <option value='issuer'>Sort by Issuer</option>
              </select>

              {/* Sort Order */}
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className='h-4 w-4' />
                ) : (
                  <SortDesc className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials List */}
      {filteredCredentials.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-8'>
              <Shield className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {credentials.length === 0
                  ? 'No Credentials Yet'
                  : 'No Matching Credentials'}
              </h3>
              <p className='text-gray-600'>
                {credentials.length === 0
                  ? "You haven't received any verifiable credentials yet."
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCredentials.map(credential => {
            const { status, color } = getCredentialStatus(credential);

            return (
              <Card
                key={credential.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg line-clamp-2'>
                        {credential.credentialSubject.title}
                      </CardTitle>
                      <p className='text-sm text-gray-600 mt-1'>
                        {credential.credentialSubject.activityType}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(credential)}
                      <Badge className={color}>{status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2 text-sm text-gray-600'>
                    <Building className='h-4 w-4' />
                    <span>{credential.issuer.name}</span>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Details */}
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <Calendar className='h-4 w-4' />
                      <span>
                        {formatDate(credential.credentialSubject.date)}
                      </span>
                    </div>

                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>{credential.credentialSubject.hours} hours</span>
                    </div>

                    {credential.credentialSubject.location && (
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <MapPin className='h-4 w-4' />
                        <span className='truncate'>
                          {credential.credentialSubject.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence Files */}
                  {credential.credentialSubject.evidence &&
                    credential.credentialSubject.evidence.length > 0 && (
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>
                          {credential.credentialSubject.evidence.length}
                        </span>{' '}
                        evidence file(s)
                      </div>
                    )}

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleViewCredential(credential)}
                      className='flex-1'
                    >
                      <Eye className='h-4 w-4 mr-1' />
                      View
                    </Button>

                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDownloadCredential(credential)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>

                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleShareCredential(credential)}
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {credentials.length > 0 && (
        <Card>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {credentials.length}
                </p>
                <p className='text-sm text-gray-600'>Total Credentials</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  {
                    credentials.filter(c => {
                      const isExpired =
                        c.expirationDate &&
                        new Date(c.expirationDate) < new Date();
                      return !isExpired;
                    }).length
                  }
                </p>
                <p className='text-sm text-gray-600'>Valid</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-yellow-600'>
                  {
                    credentials.filter(c => {
                      const isExpired =
                        c.expirationDate &&
                        new Date(c.expirationDate) < new Date();
                      return isExpired;
                    }).length
                  }
                </p>
                <p className='text-sm text-gray-600'>Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
