import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecruiter } from '@/hooks/useRecruiter';
import { useToast } from '@/hooks/use-toast';
import { Building2, Eye, EyeOff } from 'lucide-react';

const RecruiterLogin = () => {
  const [recruiterId, setRecruiterId] = useState('');
  const [showId, setShowId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useRecruiter();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Recruiter ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await login(recruiterId.trim());

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate('/recruiter/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid recruiter ID',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-2xl'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
            <Building2 className='h-8 w-8 text-blue-600' />
          </div>
          <div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Recruiter Portal
            </CardTitle>
            <p className='text-gray-600 mt-2'>
              Access verified student profiles and achievements
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='recruiterId' className='text-sm font-medium'>
                Recruiter ID
              </Label>
              <div className='relative'>
                <Input
                  id='recruiterId'
                  type={showId ? 'text' : 'password'}
                  value={recruiterId}
                  onChange={e => setRecruiterId(e.target.value)}
                  placeholder='Enter your recruiter ID'
                  className='pr-10'
                  disabled={isLoading}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowId(!showId)}
                  disabled={isLoading}
                >
                  {showId ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-gray-500'>
                Your recruiter ID was provided by the college administrator
              </p>
            </div>

            <Button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              disabled={isLoading || !recruiterId.trim()}
            >
              {isLoading ? 'Signing In...' : 'Access Portal'}
            </Button>
          </form>

          <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
            <h4 className='text-sm font-semibold text-blue-900 mb-2'>
              What you can do:
            </h4>
            <ul className='text-xs text-blue-800 space-y-1'>
              <li>• Search and view student profiles</li>
              <li>• Verify certificates and achievements</li>
              <li>• Access detailed CVs and portfolios</li>
              <li>• Contact verified students</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruiterLogin;
