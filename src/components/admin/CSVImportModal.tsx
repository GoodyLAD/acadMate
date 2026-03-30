import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Upload,
  Download,
  FileText,
  Settings,
  Users,
  GraduationCap,
  Link,
} from 'lucide-react';

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: () => void;
}

type TemplateType =
  | 'student_assignments'
  | 'faculty_bulk'
  | 'students_bulk'
  | 'custom';

interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  headers: string[];
  sampleData: string[][];
  requiredFields: string[];
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    'student_assignments'
  );
  const [customHeaders, setCustomHeaders] = useState<string>('');
  const { toast } = useToast();

  const templates: TemplateConfig[] = [
    {
      id: 'student_assignments',
      name: 'Student Assignments',
      description: 'Assign students to faculty mentors',
      icon: <Link className='h-4 w-4' />,
      headers: [
        'student_roll_number',
        'student_name',
        'student_email',
        'faculty_code',
      ],
      sampleData: [
        ['2024001', 'John Doe', 'john.doe@university.edu', 'CS001'],
        ['2024002', 'Jane Smith', 'jane.smith@university.edu', 'IT001'],
        ['2024003', 'Bob Johnson', 'bob.johnson@university.edu', 'CS002'],
      ],
      requiredFields: [
        'student_roll_number',
        'student_name',
        'student_email',
        'faculty_code',
      ],
    },
    {
      id: 'faculty_bulk',
      name: 'Bulk Faculty Import',
      description: 'Import multiple faculty members',
      icon: <Users className='h-4 w-4' />,
      headers: [
        'name',
        'email',
        'department',
        'designation',
        'faculty_code',
        'phone',
        'specialization',
      ],
      sampleData: [
        [
          'Dr. Sarah Johnson',
          'sarah.johnson@university.edu',
          'Computer Science',
          'Professor',
          'CS001',
          '+1234567890',
          'Machine Learning, AI',
        ],
        [
          'Dr. Michael Chen',
          'michael.chen@university.edu',
          'Information Technology',
          'Associate Professor',
          'IT001',
          '+1234567891',
          'Web Development, Database Systems',
        ],
      ],
      requiredFields: [
        'name',
        'email',
        'department',
        'designation',
        'faculty_code',
      ],
    },
    {
      id: 'students_bulk',
      name: 'Bulk Student Import',
      description: 'Import multiple students',
      icon: <GraduationCap className='h-4 w-4' />,
      headers: [
        'full_name',
        'email',
        'student_roll_number',
        'department',
        'phone',
        'graduation_year',
      ],
      sampleData: [
        [
          'Alice Brown',
          'alice.brown@university.edu',
          '2024001',
          'Computer Science',
          '+1234567892',
          '2024',
        ],
        [
          'Charlie Wilson',
          'charlie.wilson@university.edu',
          '2024002',
          'Information Technology',
          '+1234567893',
          '2024',
        ],
      ],
      requiredFields: ['full_name', 'email', 'student_roll_number'],
    },
    {
      id: 'custom',
      name: 'Custom Template',
      description: 'Define your own CSV format',
      icon: <Settings className='h-4 w-4' />,
      headers: [],
      sampleData: [],
      requiredFields: [],
    },
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!file || !currentTemplate) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      // Validate headers based on template
      const expectedHeaders =
        selectedTemplate === 'custom'
          ? customHeaders.split(',').map(h => h.trim())
          : currentTemplate.requiredFields;

      const hasValidHeaders = expectedHeaders.every(header =>
        headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (!hasValidHeaders) {
        throw new Error(
          `CSV must contain columns: ${expectedHeaders.join(', ')}`
        );
      }

      const successCount = 0;
      const errorCount = 0;

      // Process based on template type
      switch (selectedTemplate) {
        case 'student_assignments':
          await processStudentAssignments(
            lines,
            headers,
            successCount,
            errorCount
          );
          break;
        case 'faculty_bulk':
          await processFacultyBulk(lines, headers, successCount, errorCount);
          break;
        case 'students_bulk':
          await processStudentsBulk(lines, headers, successCount, errorCount);
          break;
        case 'custom':
          await processCustomTemplate(lines, headers, successCount, errorCount);
          break;
      }

      toast({
        title: 'Import Complete',
        description: `Successfully processed ${successCount} records. ${errorCount} errors.`,
      });

      onImport();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import CSV file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processStudentAssignments = async (
    lines: string[],
    headers: string[],
    successCount: number,
    errorCount: number
  ) => {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 4) {
        try {
          const assignment = {
            student_roll_number: values[0],
            student_name: values[1],
            student_email: values[2],
            faculty_code: values[3],
          };

          // Find student by email or create if not exists
          const studentRes = await supabase
            .from('profiles')
            .select('id')
            .eq('email', assignment.student_email)
            .eq('role', 'student')
            .single();

          let student = studentRes.data;
          const studentError = studentRes.error;

          if (studentError && studentError.code === 'PGRST116') {
            // Student doesn't exist, create them
            const { data: newStudent, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  full_name: assignment.student_name,
                  email: assignment.student_email,
                  role: 'student',
                  student_roll_number: assignment.student_roll_number,
                  assigned_faculty_code: assignment.faculty_code,
                },
              ])
              .select('id')
              .single();

            if (createError) throw createError;
            student = newStudent;
          } else if (studentError) {
            throw studentError;
          } else {
            // Update existing student
            await supabase
              .from('profiles')
              .update({
                assigned_faculty_code: assignment.faculty_code,
                student_roll_number: assignment.student_roll_number,
              })
              .eq('id', student.id);
          }

          successCount++;
        } catch (error) {
          console.error('Error processing assignment:', error);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          errorCount++;
        }
      }
    }
  };

  const processFacultyBulk = async (
    lines: string[],
    headers: string[],
    successCount: number,
    errorCount: number
  ) => {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 5) {
        try {
          const faculty = {
            name: values[0],
            email: values[1],
            department: values[2],
            designation: values[3],
            faculty_code: values[4],
            phone: values[5] || '',
            specialization: values[6] || '',
            is_verified: false,
          };

          await supabase.from('faculty').insert([faculty]);

          successCount++;
        } catch (error) {
          console.error('Error processing faculty:', error);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          errorCount++;
        }
      }
    }
  };

  const processStudentsBulk = async (
    lines: string[],
    headers: string[],
    successCount: number,
    errorCount: number
  ) => {
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3) {
        try {
          const student = {
            full_name: values[0],
            email: values[1],
            student_roll_number: values[2],
            role: 'student',
            department: values[3] || '',
            phone: values[4] || '',
            graduation_year: values[5] ? parseInt(values[5]) : null,
          };

          await supabase.from('profiles').insert([student]);

          successCount++;
        } catch (error) {
          console.error('Error processing student:', error);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          errorCount++;
        }
      }
    }
  };

  const processCustomTemplate = async () => {
    // Custom template processing - basic implementation
    toast({
      title: 'Custom Template',
      description:
        'Custom template processing not implemented yet. Please use predefined templates.',
      variant: 'destructive',
    });
  };

  const downloadTemplate = () => {
    if (!currentTemplate) return;

    let csvContent = '';
    let filename = '';

    if (selectedTemplate === 'custom') {
      csvContent = customHeaders;
      filename = 'custom_template.csv';
    } else {
      // Create CSV content based on template
      csvContent = currentTemplate.headers.join(',') + '\n';
      currentTemplate.sampleData.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      filename = `${currentTemplate.id}_template.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            CSV Import
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Template Selection */}
          <div className='space-y-2'>
            <Label>Select Template Type</Label>
            <Select
              value={selectedTemplate}
              onValueChange={value =>
                setSelectedTemplate(value as TemplateType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Choose a template' />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className='flex items-center gap-2'>
                      {template.icon}
                      <div>
                        <p className='font-medium'>{template.name}</p>
                        <p className='text-xs text-gray-500'>
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Headers Input */}
          {selectedTemplate === 'custom' && (
            <div className='space-y-2'>
              <Label>Custom Headers (comma-separated)</Label>
              <Input
                value={customHeaders}
                onChange={e => setCustomHeaders(e.target.value)}
                placeholder='e.g., name, email, department, code'
              />
            </div>
          )}

          {/* Template Info */}
          {currentTemplate && selectedTemplate !== 'custom' && (
            <div className='p-4 bg-blue-50 rounded-lg'>
              <div className='flex items-start gap-2'>
                <FileText className='h-4 w-4 text-blue-600 mt-0.5' />
                <div className='text-sm text-blue-800'>
                  <p className='font-medium mb-1'>Required Columns:</p>
                  <p className='text-xs'>
                    {currentTemplate.headers.join(', ')}
                  </p>
                  <p className='text-xs mt-1 text-blue-600'>
                    Required: {currentTemplate.requiredFields.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className='space-y-2'>
            <Label>CSV File</Label>
            <Input
              type='file'
              accept='.csv'
              onChange={handleFileChange}
              className='file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
          </div>

          {/* Template Download */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={downloadTemplate}
              className='flex-1'
            >
              <Download className='h-4 w-4 mr-2' />
              Download Template
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Importing...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportModal;
