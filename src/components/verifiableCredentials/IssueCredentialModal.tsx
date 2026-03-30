import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Upload, X, User, FileText, CheckCircle } from 'lucide-react';
import { verifiableCredentialService } from '../../services/verifiableCredentialService';
import { toast } from '@/hooks/use-toast';

interface IssueCredentialModalProps {
  studentId: string;
  studentName: string;
  activityId?: string;
  onCredentialIssued?: (credential: any) => void;
  children: React.ReactNode;
}

interface EvidenceFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
}

export const IssueCredentialModal: React.FC<IssueCredentialModalProps> = ({
  studentId,
  studentName,
  activityId,
  onCredentialIssued,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    activityType: '',
    organizer: '',
    role: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    hours: 1,
    department: '',
    description: '',
  });

  const activityTypes = [
    'Conference',
    'Workshop',
    'Seminar',
    'Training',
    'Competition',
    'Project',
    'Research',
    'Internship',
    'Volunteer Work',
    'Other',
  ];

  const roles = [
    'Participant',
    'Presenter',
    'Speaker',
    'Organizer',
    'Volunteer',
    'Mentor',
    'Judge',
    'Team Lead',
    'Researcher',
    'Other',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const evidenceFile: EvidenceFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
      };
      setEvidenceFiles(prev => [...prev, evidenceFile]);
    });
  };

  const removeEvidenceFile = (id: string) => {
    setEvidenceFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const required = [
      'title',
      'activityType',
      'organizer',
      'role',
      'date',
      'hours',
      'department',
    ];
    const missing = required.filter(
      field => !formData[field as keyof typeof formData]
    );

    if (missing.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please fill in: ${missing.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }

    if (formData.hours < 1) {
      toast({
        title: 'Validation Error',
        description: 'Hours must be at least 1',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleIssueCredential = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const result = await verifiableCredentialService.issueCredential({
        activityId: activityId || '',
        studentId,
        evidenceIds: evidenceFiles.map(f => f.id),
        issuedByUserId: '', // This would come from auth context
        activityData: {
          title: formData.title,
          type: formData.activityType,
          organizer: formData.organizer,
          role: formData.role,
          date: formData.date,
          location: formData.location || undefined,
          hours: formData.hours,
          department: formData.department,
        },
      });

      toast({
        title: 'Success',
        description: 'Credential issued successfully',
      });

      onCredentialIssued?.(result);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error issuing credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to issue credential',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      activityType: '',
      organizer: '',
      role: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      hours: 1,
      department: '',
      description: '',
    });
    setEvidenceFiles([]);
    setStep(1);
  };

  const nextStep = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Shield className='h-6 w-6 text-blue-600' />
            <span>Issue Verifiable Credential</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <User className='h-5 w-5 mr-2' />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <Badge variant='secondary'>{studentName}</Badge>
                <span className='text-sm text-gray-600'>ID: {studentId}</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <div className='flex items-center space-x-4'>
            <div
              className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span className='text-sm font-medium'>Activity Details</span>
            </div>
            <div className='flex-1 h-px bg-gray-200'></div>
            <div
              className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span className='text-sm font-medium'>Evidence & Review</span>
            </div>
          </div>

          {/* Step 1: Activity Details */}
          {step === 1 && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='title'>Activity Title *</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    placeholder='e.g., International Conference on AI'
                  />
                </div>

                <div>
                  <Label htmlFor='activityType'>Activity Type *</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={value =>
                      handleInputChange('activityType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select activity type' />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='organizer'>Organizer *</Label>
                  <Input
                    id='organizer'
                    value={formData.organizer}
                    onChange={e =>
                      handleInputChange('organizer', e.target.value)
                    }
                    placeholder='e.g., IEEE Computer Society'
                  />
                </div>

                <div>
                  <Label htmlFor='role'>Student Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={value => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='date'>Date *</Label>
                  <Input
                    id='date'
                    type='date'
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor='hours'>Duration (hours) *</Label>
                  <Input
                    id='hours'
                    type='number'
                    min='1'
                    value={formData.hours}
                    onChange={e =>
                      handleInputChange('hours', parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='location'>Location</Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    placeholder='e.g., Mumbai, India'
                  />
                </div>

                <div>
                  <Label htmlFor='department'>Department *</Label>
                  <Input
                    id='department'
                    value={formData.department}
                    onChange={e =>
                      handleInputChange('department', e.target.value)
                    }
                    placeholder='e.g., Computer Science'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Additional details about the activity...'
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Evidence & Review */}
          {step === 2 && (
            <div className='space-y-6'>
              {/* Evidence Files */}
              <div>
                <Label>Evidence Files</Label>
                <div className='mt-2'>
                  <input
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                    className='hidden'
                    id='evidence-upload'
                    accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                  />
                  <label
                    htmlFor='evidence-upload'
                    className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400'
                  >
                    <div className='text-center'>
                      <Upload className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                      <p className='text-sm text-gray-600'>
                        Click to upload evidence files
                      </p>
                      <p className='text-xs text-gray-500'>
                        PDF, JPG, PNG, DOC supported
                      </p>
                    </div>
                  </label>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className='mt-4 space-y-2'>
                    {evidenceFiles.map(file => (
                      <div
                        key={file.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <FileText className='h-5 w-5 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {file.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => removeEvidenceFile(file.id)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Credential Preview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Title</p>
                      <p className='text-gray-900'>{formData.title}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Type</p>
                      <p className='text-gray-900'>{formData.activityType}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Organizer
                      </p>
                      <p className='text-gray-900'>{formData.organizer}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Role</p>
                      <p className='text-gray-900'>{formData.role}</p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Date</p>
                      <p className='text-gray-900'>
                        {new Date(formData.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Duration
                      </p>
                      <p className='text-gray-900'>{formData.hours} hours</p>
                    </div>
                    {formData.location && (
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-700'>
                          Location
                        </p>
                        <p className='text-gray-900'>{formData.location}</p>
                      </div>
                    )}
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Department
                      </p>
                      <p className='text-gray-900'>{formData.department}</p>
                    </div>
                  </div>

                  {evidenceFiles.length > 0 && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Evidence Files
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {evidenceFiles.map(file => (
                          <Badge key={file.id} variant='secondary'>
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  This credential will be digitally signed and can be verified
                  by anyone with the QR code or verification link.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-between pt-4 border-t'>
            <div>
              {step > 1 && (
                <Button variant='outline' onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>

            <div className='flex space-x-2'>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>

              {step === 1 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button onClick={handleIssueCredential} disabled={loading}>
                  {loading ? 'Issuing...' : 'Issue Credential'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
