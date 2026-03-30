import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import {
  recommendationEngine,
  StudentProfile,
} from '@/services/recommendationService';
import { User, Plus, X, Save, Target, Award, BookOpen } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newCareerGoal, setNewCareerGoal] = useState('');

  const [profileData, setProfileData] = useState<Partial<StudentProfile>>({
    interests: [],
    certifications: [],
    skills: [],
    career_goals: [],
    experience_level: 'beginner',
    preferred_learning_style: 'mixed',
  });

  const availableInterests = [
    'web_development',
    'data_science',
    'mobile_development',
    'cloud_computing',
    'cybersecurity',
    'blockchain',
    'game_development',
    'database',
    'algorithms',
    'ui_ux',
  ];

  const availableCertifications = [
    'aws_certified',
    'google_certified',
    'microsoft_certified',
    'cisco_certified',
    'comptia_certified',
    'pmp_certified',
    'salesforce_certified',
    'oracle_certified',
    'adobe_certified',
    'google_analytics',
  ];

  const availableSkills = [
    'javascript',
    'python',
    'react',
    'node.js',
    'html',
    'css',
    'sql',
    'mongodb',
    'aws',
    'docker',
    'kubernetes',
    'git',
    'linux',
    'data analysis',
    'machine learning',
    'ui/ux',
    'mobile development',
    'web development',
    'cybersecurity',
    'blockchain',
  ];

  const availableCareerGoals = [
    'software engineer',
    'data scientist',
    'web developer',
    'mobile developer',
    'devops engineer',
    'cybersecurity analyst',
    'ui/ux designer',
    'product manager',
    'cloud architect',
    'machine learning engineer',
    'blockchain developer',
  ];

  useEffect(() => {
    if (profile) {
      setProfileData({
        interests: profile.interests || [],
        certifications: profile.certifications || [],
        skills: profile.skills || [],
        career_goals: profile.career_goals || [],
        experience_level: profile.experience_level || 'beginner',
        preferred_learning_style: profile.preferred_learning_style || 'mixed',
      });
    }
  }, [profile]);

  const addItem = (type: keyof StudentProfile, value: string) => {
    if (!value.trim()) return;

    setProfileData(prev => ({
      ...prev,
      [type]: [...((prev[type] as string[]) || []), value.trim()],
    }));
  };

  const removeItem = (type: keyof StudentProfile, index: number) => {
    setProfileData(prev => ({
      ...prev,
      [type]: ((prev[type] as string[]) || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const success = await recommendationEngine.updateStudentProfile(
        profile.id,
        profileData
      );

      if (success) {
        toast({
          title: 'Profile Updated',
          description:
            'Your profile has been updated successfully. Recommendations will be refreshed.',
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!profile || profile.role !== 'student') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          Profile Setup for Better Recommendations
        </CardTitle>
        <CardDescription>
          Help us understand your interests, skills, and goals to provide
          personalized course recommendations
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Experience Level */}
        <div className='space-y-2'>
          <Label htmlFor='experience'>Experience Level</Label>
          <Select
            value={profileData.experience_level}
            onValueChange={value =>
              setProfileData(prev => ({
                ...prev,
                experience_level: value as any,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select your experience level' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='beginner'>Beginner</SelectItem>
              <SelectItem value='intermediate'>Intermediate</SelectItem>
              <SelectItem value='advanced'>Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Learning Style */}
        <div className='space-y-2'>
          <Label htmlFor='learning-style'>Preferred Learning Style</Label>
          <Select
            value={profileData.preferred_learning_style}
            onValueChange={value =>
              setProfileData(prev => ({
                ...prev,
                preferred_learning_style: value as any,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select your learning style' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='visual'>Visual</SelectItem>
              <SelectItem value='hands-on'>Hands-on</SelectItem>
              <SelectItem value='theoretical'>Theoretical</SelectItem>
              <SelectItem value='mixed'>Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interests */}
        <div className='space-y-3'>
          <Label>Interests</Label>
          <div className='flex gap-2'>
            <Select
              value={newInterest || 'select'}
              onValueChange={value =>
                setNewInterest(value === 'select' ? '' : value)
              }
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Select an interest' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='select'>Select an interest</SelectItem>
                {availableInterests.map(interest => (
                  <SelectItem key={interest} value={interest}>
                    {interest
                      .replace('_', ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              onClick={() => {
                addItem('interests', newInterest);
                setNewInterest('');
              }}
              disabled={!newInterest}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {profileData.interests?.map((interest, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='flex items-center gap-1'
              >
                {interest
                  .replace('_', ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 hover:bg-transparent'
                  onClick={() => removeItem('interests', index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className='space-y-3'>
          <Label>Certifications</Label>
          <div className='flex gap-2'>
            <Select
              value={newCertification || 'select'}
              onValueChange={value =>
                setNewCertification(value === 'select' ? '' : value)
              }
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Select a certification' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='select'>Select a certification</SelectItem>
                {availableCertifications.map(cert => (
                  <SelectItem key={cert} value={cert}>
                    {cert
                      .replace('_', ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              onClick={() => {
                addItem('certifications', newCertification);
                setNewCertification('');
              }}
              disabled={!newCertification}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {profileData.certifications?.map((cert, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='flex items-center gap-1'
              >
                <Award className='h-3 w-3' />
                {cert.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 hover:bg-transparent'
                  onClick={() => removeItem('certifications', index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className='space-y-3'>
          <Label>Skills</Label>
          <div className='flex gap-2'>
            <Select
              value={newSkill || 'select'}
              onValueChange={value =>
                setNewSkill(value === 'select' ? '' : value)
              }
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Select a skill' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='select'>Select a skill</SelectItem>
                {availableSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              onClick={() => {
                addItem('skills', newSkill);
                setNewSkill('');
              }}
              disabled={!newSkill}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {profileData.skills?.map((skill, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='flex items-center gap-1'
              >
                <BookOpen className='h-3 w-3' />
                {skill}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 hover:bg-transparent'
                  onClick={() => removeItem('skills', index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Career Goals */}
        <div className='space-y-3'>
          <Label>Career Goals</Label>
          <div className='flex gap-2'>
            <Select
              value={newCareerGoal || 'select'}
              onValueChange={value =>
                setNewCareerGoal(value === 'select' ? '' : value)
              }
            >
              <SelectTrigger className='flex-1'>
                <SelectValue placeholder='Select a career goal' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='select'>Select a career goal</SelectItem>
                {availableCareerGoals.map(goal => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type='button'
              onClick={() => {
                addItem('career_goals', newCareerGoal);
                setNewCareerGoal('');
              }}
              disabled={!newCareerGoal}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {profileData.career_goals?.map((goal, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='flex items-center gap-1'
              >
                <Target className='h-3 w-3' />
                {goal}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0 hover:bg-transparent'
                  onClick={() => removeItem('career_goals', index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className='flex justify-end pt-4'>
          <Button
            onClick={handleSave}
            disabled={saving}
            className='min-w-[120px]'
          >
            {saving ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSetup;
