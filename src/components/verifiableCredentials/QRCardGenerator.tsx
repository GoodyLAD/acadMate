import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Share2,
  Copy,
  CheckCircle,
  Shield,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCardGeneratorProps {
  credential: {
    vcId: string;
    credentialJson: any;
    shortToken: string;
    qrUrl: string;
    credentialUrl: string;
  };
  onDownload?: () => void;
  onShare?: () => void;
}

export const QRCardGenerator: React.FC<QRCardGeneratorProps> = ({
  credential,
  onDownload,
  onShare,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR code when component mounts
  React.useEffect(() => {
    generateQRCode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credential.qrUrl]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(credential.qrUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCredential = async () => {
    try {
      const blob = new Blob(
        [JSON.stringify(credential.credentialJson, null, 2)],
        {
          type: 'application/json',
        }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credential-${credential.vcId.split(':').pop()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onDownload?.();
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(credential.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Success',
        description: 'Verification link copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verifiable Credential',
          text: `Check out my verified activity: ${credential.credentialJson.credentialSubject.title}`,
          url: credential.qrUrl,
        });
        onShare?.();
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      {/* QR Card */}
      <Card className='mb-6 shadow-lg'>
        <CardHeader className='text-center pb-4'>
          <div className='flex items-center justify-center mb-4'>
            <div className='bg-green-100 p-3 rounded-full'>
              <Shield className='h-8 w-8 text-green-600' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            Verified Activity Credential
          </CardTitle>
          <p className='text-gray-600'>
            Issued by {credential.credentialJson.issuer.name}
          </p>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* QR Code */}
          <div className='flex justify-center'>
            <div className='bg-white p-4 rounded-lg border-2 border-gray-200'>
              {isGenerating ? (
                <div className='w-64 h-64 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                </div>
              ) : (
                <img
                  src={qrCodeDataUrl}
                  alt='QR Code for verification'
                  className='w-64 h-64'
                />
              )}
            </div>
          </div>

          {/* Credential Details */}
          <div className='space-y-4'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {credential.credentialJson.credentialSubject.title}
              </h3>
              <p className='text-gray-600'>
                {credential.credentialJson.credentialSubject.activityType}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-600'>
                  {formatDate(credential.credentialJson.credentialSubject.date)}
                </span>
              </div>

              <div className='flex items-center space-x-2'>
                <Clock className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-600'>
                  {credential.credentialJson.credentialSubject.hours} hours
                </span>
              </div>

              {credential.credentialJson.credentialSubject.location && (
                <div className='flex items-center space-x-2'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    {credential.credentialJson.credentialSubject.location}
                  </span>
                </div>
              )}

              <div className='flex items-center space-x-2'>
                <Badge variant='secondary'>
                  {credential.credentialJson.credentialSubject.role}
                </Badge>
              </div>
            </div>

            <div className='text-center'>
              <p className='text-sm text-gray-500'>
                Organized by{' '}
                {credential.credentialJson.credentialSubject.organizer}
              </p>
            </div>
          </div>

          {/* Verification Info */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-center space-x-2 mb-2'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium text-gray-900'>
                Verifiable by Smart Student Hub
              </span>
            </div>
            <p className='text-xs text-gray-500 text-center'>
              Issued on {formatDate(credential.credentialJson.issuanceDate)} at{' '}
              {formatTime(credential.credentialJson.issuanceDate)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={handleDownloadCredential}
              className='flex-1'
              variant='outline'
            >
              <Download className='h-4 w-4 mr-2' />
              Download Credential
            </Button>

            <Button
              onClick={handleCopyLink}
              className='flex-1'
              variant='outline'
            >
              {copied ? (
                <CheckCircle className='h-4 w-4 mr-2' />
              ) : (
                <Copy className='h-4 w-4 mr-2' />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>

            <Button onClick={handleShare} className='flex-1'>
              <Share2 className='h-4 w-4 mr-2' />
              Share
            </Button>
          </div>

          {/* Verification URL */}
          <div className='text-center'>
            <p className='text-xs text-gray-500'>
              Verification URL: {credential.qrUrl}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className='pt-6'>
          <h4 className='font-semibold text-gray-900 mb-3'>How to Verify</h4>
          <div className='space-y-2 text-sm text-gray-600'>
            <p>1. Scan the QR code with any QR code reader</p>
            <p>2. Or visit the verification URL directly</p>
            <p>
              3. The system will verify the digital signature and show
              credential details
            </p>
            <p>4. Evidence files can be downloaded if available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
