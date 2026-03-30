import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Award,
  Users,
  Trophy,
  BookOpen,
  Camera,
  FileText,
  Video,
  Image,
  Plus,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickUploadProps {
  onUploadStart?: (type: string) => void;
  onUploadComplete?: () => void;
}

const QuickUpload: React.FC<QuickUploadProps> = ({
  onUploadStart,
  onUploadComplete,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadCategories = [
    {
      id: 'certificate',
      label: 'Certificate',
      icon: Award,
      color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      description: 'Academic certificates, course completions',
      points: '+50 points',
    },
    {
      id: 'event',
      label: 'Event',
      icon: Users,
      color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      description: 'Workshops, seminars, conferences',
      points: '+30 points',
    },
    {
      id: 'competition',
      label: 'Competition',
      icon: Trophy,
      color:
        'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      description: 'Contests, hackathons, competitions',
      points: '+75 points',
    },
    {
      id: 'course',
      label: 'Course',
      icon: BookOpen,
      color:
        'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      description: 'Online courses, MOOCs, tutorials',
      points: '+40 points',
    },
    {
      id: 'project',
      label: 'Project',
      icon: Camera,
      color: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
      description: 'Personal projects, portfolios',
      points: '+60 points',
    },
    {
      id: 'other',
      label: 'Other',
      icon: Plus,
      color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
      description: 'Other achievements',
      points: '+25 points',
    },
  ];

  const fileTypes = [
    { type: 'image', label: 'Image', icon: Image, extensions: 'JPG, PNG, GIF' },
    { type: 'pdf', label: 'PDF', icon: FileText, extensions: 'PDF' },
    { type: 'video', label: 'Video', icon: Video, extensions: 'MP4, MOV' },
    {
      type: 'document',
      label: 'Document',
      icon: FileText,
      extensions: 'DOC, DOCX',
    },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedType(categoryId);
    onUploadStart?.(categoryId);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // TODO: Replace with actual backend upload
      // For now, simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, you would:
      // 1. Upload files to Supabase Storage
      // 2. Create certificate/achievement record in database
      // 3. Trigger faculty notification
      // 4. Update student progress/points

      toast({
        title: 'Upload Successful!',
        description: `Your ${selectedType} has been uploaded and is pending approval.`,
      });

      onUploadComplete?.();
      setSelectedType(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description:
          'There was an error uploading your file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleUpload(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (selectedType) {
    const category = uploadCategories.find(c => c.id === selectedType);
    const IconComponent = category?.icon || Plus;

    return (
      <Card className='border-2 border-dashed border-primary/50'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <IconComponent className='h-5 w-5' />
              Upload {category?.label}
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSelectedType(null)}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='text-center'>
            <p className='text-sm text-muted-foreground mb-4'>
              {category?.description}
            </p>
            <Badge variant='outline' className='mb-4'>
              {category?.points}
            </Badge>
          </div>

          {/* File Upload Area */}
          <div
            className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className='h-12 w-12 mx-auto mb-4 text-gray-400' />
            <p className='text-lg font-medium mb-2'>
              Drop files here or click to upload
            </p>
            <p className='text-sm text-muted-foreground mb-4'>
              Supported formats: JPG, PNG, PDF, MP4, DOC, DOCX
            </p>
            <input
              id='file-upload'
              type='file'
              multiple
              accept='.jpg,.jpeg,.png,.gif,.pdf,.mp4,.mov,.doc,.docx'
              onChange={handleFileSelect}
              className='hidden'
            />
            <Button variant='outline' disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>

          {/* File Type Icons */}
          <div className='flex justify-center gap-4'>
            {fileTypes.map(fileType => {
              const IconComponent = fileType.icon;
              return (
                <div key={fileType.type} className='text-center'>
                  <div className='p-2 rounded-lg bg-gray-100 mb-2'>
                    <IconComponent className='h-6 w-6 text-gray-600' />
                  </div>
                  <p className='text-xs text-gray-600'>{fileType.extensions}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Quick Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {uploadCategories.map(category => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant='outline'
                className={`h-24 flex-col gap-2 ${category.color} hover:scale-105 transition-transform`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <IconComponent className='h-6 w-6' />
                <div className='text-center'>
                  <div className='font-medium'>{category.label}</div>
                  <div className='text-xs opacity-75'>{category.points}</div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
          <div className='flex items-center gap-2 mb-2'>
            <Trophy className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-800'>Pro Tip</span>
          </div>
          <p className='text-sm text-blue-700'>
            Upload high-quality images and documents for faster approval.
            Include clear descriptions to help faculty verify your achievements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickUpload;
