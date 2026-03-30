import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Github } from 'lucide-react';
import GitHubService from '@/services/githubService';
import { useToast } from '@/hooks/use-toast';

const GithubCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from GitHub');
          return;
        }

        // Exchange code for access token
        await GitHubService.getInstance().exchangeCodeForToken(code);

        setStatus('success');
        setMessage(
          'Successfully connected to GitHub! Redirecting to projects...'
        );

        // Show success toast
        toast({
          title: 'GitHub Connected',
          description:
            'You can now import your GitHub repositories as projects!',
        });

        // Redirect to projects page after a short delay
        setTimeout(() => {
          navigate('/my-projects');
        }, 2000);
      } catch (error: any) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to connect to GitHub');

        toast({
          title: 'Connection Failed',
          description: error.message || 'Failed to connect to GitHub',
          variant: 'destructive',
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  const handleRetry = () => {
    navigate('/my-projects');
  };

  const handleConnectAgain = () => {
    const githubService = GitHubService.getInstance();
    window.location.href = githubService.getAuthUrl();
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='p-8 text-center'>
          <div className='mb-6'>
            {status === 'loading' && (
              <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
              </div>
            )}
            {status === 'success' && (
              <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>
            )}
            {status === 'error' && (
              <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <XCircle className='w-8 h-8 text-red-600' />
              </div>
            )}
          </div>

          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {status === 'loading' && 'Connecting to GitHub...'}
              {status === 'success' && 'GitHub Connected!'}
              {status === 'error' && 'Connection Failed'}
            </h1>
            <p className='text-gray-600'>{message}</p>
          </div>

          {status === 'loading' && (
            <div className='space-y-2'>
              <p className='text-sm text-gray-500'>
                Please wait while we set up your GitHub connection...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-center space-x-2 text-green-600'>
                <Github className='w-5 h-5' />
                <span className='text-sm font-medium'>
                  GitHub Integration Active
                </span>
              </div>
              <p className='text-sm text-gray-500'>
                You'll be redirected to your projects page shortly.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-center space-x-2 text-red-600'>
                <XCircle className='w-5 h-5' />
                <span className='text-sm font-medium'>Connection Failed</span>
              </div>
              <div className='space-y-2'>
                <Button
                  onClick={handleRetry}
                  variant='outline'
                  className='w-full'
                >
                  Go to Projects
                </Button>
                <Button onClick={handleConnectAgain} className='w-full'>
                  <Github className='w-4 h-4 mr-2' />
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GithubCallback;
