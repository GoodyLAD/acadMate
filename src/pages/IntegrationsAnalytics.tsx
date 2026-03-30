import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PlatformCard from '@/components/integrations/PlatformCard';
import ActivitySummaryCards from '@/components/integrations/ActivitySummaryCards';
import ActivityChartsPanel from '@/components/integrations/ActivityChartsPanel';
import GoalLinkedCharts from '@/components/integrations/GoalLinkedCharts';
import { usePlatformIntegration } from '@/hooks/usePlatformIntegration';
import {
  RefreshCw,
  Settings,
  TrendingUp,
  Link as LinkIcon,
} from 'lucide-react';
import type { Goal } from '@/components/goals/types';

// Mock goals for demonstration
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Solve 50 LeetCode Problems',
    platform: 'leetcode',
    account: 'myusername',
    target: 50,
    unit: 'problems',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    autoSync: true,
    privacy: 'private',
    progress: 32,
    lastSyncAt: Date.now() - 3600000,
    syncStatus: 'success',
    activity: [],
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 3600000,
    completed: false,
    paused: false,
  },
  {
    id: '2',
    title: 'Complete 10 Codeforces Contests',
    platform: 'codeforces',
    account: 'myhandle',
    target: 10,
    unit: 'contests',
    startDate: '2025-01-01',
    endDate: '2025-03-01',
    autoSync: true,
    privacy: 'public',
    progress: 6,
    lastSyncAt: Date.now() - 7200000,
    syncStatus: 'success',
    activity: [],
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 7200000,
    completed: false,
    paused: false,
  },
];

const IntegrationsAnalyticsPage: React.FC = () => {
  const {
    platforms,
    activityStats,
    activityData,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    syncAllPlatforms,
  } = usePlatformIntegration();

  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await syncAllPlatforms();
    } finally {
      setSyncing(false);
    }
  };

  const connectedCount = platforms.filter(p => p.isConnected).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50'>
      <div className='max-w-7xl mx-auto p-6 space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              Platform Integration & Analytics
            </h1>
            <p className='text-muted-foreground mt-1'>
              Connect your coding platforms and track your progress with
              beautiful analytics
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Badge
              variant='secondary'
              className='bg-indigo-100 text-indigo-800'
            >
              {connectedCount} Connected
            </Badge>
            <Button
              onClick={handleSyncAll}
              disabled={syncing || connectedCount === 0}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            >
              {syncing ? (
                <>
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Sync All
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue='integrations' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 rounded-xl bg-gray-100'>
            <TabsTrigger value='integrations' className='rounded-lg'>
              <LinkIcon className='h-4 w-4 mr-2' />
              Integrations
            </TabsTrigger>
            <TabsTrigger value='analytics' className='rounded-lg'>
              <TrendingUp className='h-4 w-4 mr-2' />
              Analytics
            </TabsTrigger>
            <TabsTrigger value='goals' className='rounded-lg'>
              <Settings className='h-4 w-4 mr-2' />
              Goal Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value='integrations' className='space-y-6 mt-8'>
            <Card className='rounded-2xl shadow-lg border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white'>
              <CardHeader>
                <CardTitle className='text-xl'>Platform Connections</CardTitle>
                <p className='text-indigo-100'>
                  Connect your coding practice platforms to automatically track
                  your progress
                </p>
              </CardHeader>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {platforms.map(platform => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  onConnect={connectPlatform}
                  onDisconnect={disconnectPlatform}
                  onSync={syncPlatform}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6 mt-8'>
            {connectedCount === 0 ? (
              <Card className='rounded-2xl shadow-md'>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='text-6xl mb-4'>📊</div>
                  <h3 className='text-xl font-semibold mb-2'>
                    No Platforms Connected
                  </h3>
                  <p className='text-muted-foreground text-center mb-6'>
                    Connect at least one platform to see your activity analytics
                    and progress charts.
                  </p>
                  <Button
                    onClick={() =>
                      document.querySelector('[value="integrations"]')?.click()
                    }
                  >
                    Connect Platforms
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <ActivitySummaryCards stats={activityStats} />
                <ActivityChartsPanel data={activityData} />
              </>
            )}
          </TabsContent>

          <TabsContent value='goals' className='space-y-6 mt-8'>
            <GoalLinkedCharts
              goals={mockGoals}
              activityData={activityData.dailyProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntegrationsAnalyticsPage;
