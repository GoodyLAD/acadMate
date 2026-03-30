import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  authType: 'oauth' | 'api_key' | 'profile_url';
  isConnected: boolean;
  handle?: string;
  lastSync?: string;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
}

interface PlatformCardProps {
  platform: Platform;
  onConnect: (platformId: string, credentials: any) => Promise<void>;
  onDisconnect: (platformId: string) => void;
  onSync: (platformId: string) => Promise<void>;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [credentials, setCredentials] = useState({
    handle: '',
    apiKey: '',
    profileUrl: '',
  });
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect(platform.id, credentials);
      setShowConnectDialog(false);
      setCredentials({ handle: '', apiKey: '', profileUrl: '' });
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      await onSync(platform.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const getStatusIcon = () => {
    switch (platform.syncStatus) {
      case 'syncing':
        return <Loader2 className='h-4 w-4 animate-spin text-blue-600' />;
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className='group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        <CardHeader className='relative pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='text-2xl'>{platform.icon}</div>
              <div>
                <CardTitle className='text-lg font-semibold'>
                  {platform.name}
                </CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {platform.description}
                </p>
              </div>
            </div>
            {platform.isConnected && (
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800'
              >
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className='relative space-y-4'>
          {platform.isConnected ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Handle:</span>
                <span className='font-medium'>{platform.handle}</span>
              </div>

              {platform.lastSync && (
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Last sync:</span>
                  <div className='flex items-center gap-2'>
                    {getStatusIcon()}
                    <span className='font-medium'>
                      {new Date(platform.lastSync).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={handleSync}
                  disabled={platform.syncStatus === 'syncing'}
                  className='flex-1'
                >
                  {platform.syncStatus === 'syncing' ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Syncing...
                    </>
                  ) : (
                    'Sync Now'
                  )}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onDisconnect(platform.id)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Connect your {platform.name} account to track your progress
                automatically.
              </p>
              <Button
                onClick={() => setShowConnectDialog(true)}
                className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              >
                Connect {platform.name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span className='text-xl'>{platform.icon}</span>
              Connect {platform.name}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {platform.authType === 'profile_url' && (
              <div className='space-y-2'>
                <Label htmlFor='profileUrl'>Profile URL or Username</Label>
                <Input
                  id='profileUrl'
                  placeholder={`e.g., https://${platform.name.toLowerCase()}.com/username or username`}
                  value={credentials.profileUrl}
                  onChange={e =>
                    setCredentials(prev => ({
                      ...prev,
                      profileUrl: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {platform.authType === 'api_key' && (
              <div className='space-y-2'>
                <Label htmlFor='apiKey'>API Key</Label>
                <Input
                  id='apiKey'
                  type='password'
                  placeholder='Enter your API key'
                  value={credentials.apiKey}
                  onChange={e =>
                    setCredentials(prev => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Find your API key in your {platform.name} account settings
                </p>
              </div>
            )}

            {platform.authType === 'oauth' && (
              <div className='text-center py-4'>
                <p className='text-sm text-muted-foreground mb-4'>
                  You'll be redirected to {platform.name} to authorize access
                </p>
              </div>
            )}

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowConnectDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlatformCard;
