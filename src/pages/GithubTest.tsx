import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import GitHubService from '@/services/githubService';
import { useToast } from '@/hooks/use-toast';

const GithubTest: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleConnect = () => {
    const githubService = GitHubService.getInstance();
    window.location.href = githubService.getAuthUrl();
  };

  const handleTestToken = async () => {
    const githubService = GitHubService.getInstance();

    if (!githubService.isAuthenticated()) {
      setStatus('error');
      setMessage('No access token found. Please connect to GitHub first.');
      return;
    }

    setStatus('loading');
    setMessage('Testing GitHub API access...');

    try {
      const user = await githubService.getCurrentUser();
      setUserInfo(user);
      setStatus('success');
      setMessage(`Successfully connected as ${user.login}`);

      toast({
        title: 'GitHub Connected!',
        description: `Welcome ${user.name || user.login}!`,
      });
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);

      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    const githubService = GitHubService.getInstance();
    githubService.logout();
    setStatus('idle');
    setMessage('');
    setUserInfo(null);

    toast({
      title: 'Disconnected',
      description: 'GitHub connection removed',
    });
  };

  const githubService = GitHubService.getInstance();
  const isConnected = githubService.isAuthenticated();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Github className='h-6 w-6' />
              GitHub OAuth Test
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
              {isConnected && (
                <Button variant='outline' size='sm' onClick={handleDisconnect}>
                  Disconnect
                </Button>
              )}
            </div>

            {!isConnected ? (
              <Button onClick={handleConnect} className='w-full'>
                <Github className='h-4 w-4 mr-2' />
                Connect to GitHub
              </Button>
            ) : (
              <Button
                onClick={handleTestToken}
                disabled={status === 'loading'}
                className='w-full'
              >
                {status === 'loading' ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Github className='h-4 w-4 mr-2' />
                )}
                Test GitHub API Access
              </Button>
            )}

            {status !== 'idle' && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  status === 'success'
                    ? 'bg-green-50 text-green-700'
                    : status === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                }`}
              >
                {status === 'loading' && (
                  <Loader2 className='h-5 w-5 animate-spin' />
                )}
                {status === 'success' && <CheckCircle className='h-5 w-5' />}
                {status === 'error' && <XCircle className='h-5 w-5' />}
                <span className='font-medium'>{message}</span>
              </div>
            )}

            {userInfo && (
              <Card className='bg-gray-50'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={userInfo.avatar_url}
                      alt={userInfo.name || userInfo.login}
                      className='w-12 h-12 rounded-full'
                    />
                    <div>
                      <h3 className='font-semibold'>
                        {userInfo.name || userInfo.login}
                      </h3>
                      <p className='text-sm text-gray-600'>@{userInfo.login}</p>
                      <p className='text-xs text-gray-500'>
                        {userInfo.public_repos} public repos •{' '}
                        {userInfo.followers} followers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p>
              <strong>Current Origin:</strong> {window.location.origin}
            </p>
            <p>
              <strong>Redirect URI:</strong> {window.location.origin}
              /github-callback
            </p>
            <p>
              <strong>Client ID:</strong> Ov23liRiNJwonTZ5h3T6
            </p>
            <p>
              <strong>Access Token:</strong>{' '}
              {isConnected ? 'Present' : 'Not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GithubTest;
