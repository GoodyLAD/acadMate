import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface UploadCertificateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

const UploadCertificateForm: React.FC<UploadCertificateFormProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const { toast } = useToast();
  const { profile } = useProfile();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'academic' | 'co_curricular'>('academic');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(f.type)) {
      setErrors(prev => ({ ...prev, file: 'Please upload a PDF or image file (JPEG, PNG)' }));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 5MB' }));
      return;
    }
    setFile(f);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Certificate title is required';
    if (!file) e.file = 'Please upload a certificate file';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !profile || !file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const path = `${profile.user_id || profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('certificates')
        .getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      const { error: insertError } = await supabase.from('certificates').insert({
        student_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_url: publicUrl,
        file_name: file.name,
        status: 'pending',
      });
      if (insertError) throw insertError;

      toast({ title: 'Success', description: 'Certificate uploaded successfully!' });

      // Reset
      setTitle('');
      setDescription('');
      setCategory('academic');
      setFile(null);
      setErrors({});

      onUploadComplete();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload certificate',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-blue-900'>
            Upload New Certificate
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to upload your certificate for review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='cert-title' className='text-sm font-medium text-gray-700'>
              Certificate Title *
            </Label>
            <Input
              id='cert-title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Enter certificate title'
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className='text-sm text-red-600'>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='cert-description' className='text-sm font-medium text-gray-700'>
              Description (Optional)
            </Label>
            <Textarea
              id='cert-description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Brief description of the certificate'
              rows={3}
            />
          </div>

          {/* Category */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>Category *</Label>
            <Select
              value={category}
              onValueChange={(v: 'academic' | 'co_curricular') => setCategory(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='academic'>Academic</SelectItem>
                <SelectItem value='co_curricular'>Co-Curricular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>
              Upload Certificate *
            </Label>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors'>
              <input
                type='file'
                accept='.pdf,.jpg,.jpeg,.png'
                onChange={handleFileChange}
                className='hidden'
                id='certificate-file'
              />
              <label htmlFor='certificate-file' className='cursor-pointer'>
                <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                <p className='text-sm text-gray-600'>Click to upload or drag and drop</p>
                <p className='text-xs text-gray-500 mt-1'>PDF or image files (max 5MB)</p>
              </label>
              {file && (
                <div className='mt-4 flex items-center justify-center gap-2'>
                  <span className='text-sm text-green-600'>{file.name}</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setFile(null)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
            {errors.file && <p className='text-sm text-red-600'>{errors.file}</p>}
          </div>

          {/* Submit Buttons */}
          <div className='flex gap-3 pt-4'>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={uploading}
              className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
            >
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadCertificateForm;
