import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError(null);

        // Start scanning loop
        scanLoop();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simple QR code detection (this is a basic implementation)
      // In a real app, you'd use a library like jsQR or @zxing/library

      // For demo purposes, we'll simulate QR detection
      // In reality, you'd use a proper QR code library here
      setTimeout(() => {
        if (isScanning) {
          scanLoop();
        }
      }, 100);
    } else {
      setTimeout(() => {
        if (isScanning) {
          scanLoop();
        }
      }, 100);
    }
  };

  const handleManualInput = () => {
    const input = prompt('Enter verification token or URL:');
    if (input && input.trim()) {
      onScan(input.trim());
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <Card className='w-full max-w-md mx-4'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <QrCode className='h-5 w-5' />
            Scan QR Code
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error ? (
            <div className='text-center py-8'>
              <Camera className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-red-600 mb-4'>{error}</p>
              <Button onClick={handleManualInput} variant='outline'>
                Enter Token Manually
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='relative bg-black rounded-lg overflow-hidden'>
                <video
                  ref={videoRef}
                  className='w-full h-64 object-cover'
                  playsInline
                  muted
                />
                <div className='absolute inset-0 border-2 border-white border-dashed rounded-lg m-4 pointer-events-none'>
                  <div className='absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg'></div>
                  <div className='absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg'></div>
                  <div className='absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg'></div>
                  <div className='absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg'></div>
                </div>
              </div>

              <canvas ref={canvasRef} className='hidden' />

              <div className='text-center'>
                <p className='text-sm text-muted-foreground mb-4'>
                  Position the QR code within the frame
                </p>
                <Button
                  onClick={handleManualInput}
                  variant='outline'
                  className='w-full'
                >
                  Enter Token Manually
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
