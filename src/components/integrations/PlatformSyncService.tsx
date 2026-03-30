import {
  fetchLeetCodeData,
  fetchCodeforcesData,
  fetchCodewarsData,
  fetchGFGData,
  fetchHackerRankData,
  fetchHackerEarthData,
  fetchCodeChefData,
} from '@/services/platforms';

export interface SyncResult {
  success: boolean;
  data?: {
    solved: number;
    contests?: number;
    rating?: number;
    hours?: number;
  };
  error?: string;
}

export class PlatformSyncService {
  private static instance: PlatformSyncService;

  static getInstance(): PlatformSyncService {
    if (!PlatformSyncService.instance) {
      PlatformSyncService.instance = new PlatformSyncService();
    }
    return PlatformSyncService.instance;
  }

  async syncPlatform(platformId: string, handle: string): Promise<SyncResult> {
    try {
      // Extract username from handle (could be URL or username)
      const username = this.extractUsername(handle);

      let data;
      switch (platformId) {
        case 'leetcode':
          data = await fetchLeetCodeData(username);
          break;
        case 'codeforces':
          data = await fetchCodeforcesData(username);
          break;
        case 'codewars':
          data = await fetchCodewarsData(username);
          break;
        case 'gfg':
          data = await fetchGFGData(username);
          break;
        case 'hackerrank':
          data = await fetchHackerRankData(username);
          break;
        case 'hackerearth':
          data = await fetchHackerEarthData(username);
          break;
        case 'codechef':
          data = await fetchCodeChefData(username);
          break;
        default:
          throw new Error(`Unsupported platform: ${platformId}`);
      }

      return {
        success: true,
        data: {
          solved: data.solved || 0,
          contests: data.contests || 0,
          rating: data.rating || 0,
          hours: data.hours || 0,
        },
      };
    } catch (error) {
      console.error(`Sync failed for ${platformId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private extractUsername(handle: string): string {
    try {
      const url = new URL(handle);
      // Extract username from various URL patterns
      const pathParts = url.pathname.split('/').filter(Boolean);

      // Common patterns: /user/username, /profile/username, /username
      if (pathParts.length >= 2) {
        return pathParts[pathParts.length - 1];
      } else if (pathParts.length === 1) {
        return pathParts[0];
      }

      return handle;
    } catch {
      // Not a URL, assume it's already a username
      return handle;
    }
  }

  generateMockActivityData() {
    const today = new Date();
    const dailyProgress = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        solved: Math.floor(Math.random() * 8) + 1,
        goal: i > 20 ? 5 : undefined,
      };
    });

    const topicDistribution = [
      { topic: 'Arrays', solved: 45, target: 50 },
      { topic: 'Strings', solved: 32, target: 40 },
      { topic: 'Trees', solved: 28, target: 35 },
      { topic: 'Graphs', solved: 15, target: 25 },
      { topic: 'Dynamic Programming', solved: 12, target: 30 },
      { topic: 'Math', solved: 20, target: 25 },
      { topic: 'Greedy', solved: 18, target: 20 },
      { topic: 'Binary Search', solved: 25, target: 30 },
    ];

    const difficultyDistribution = [
      { difficulty: 'Easy', count: 85, color: '#22c55e' },
      { difficulty: 'Medium', count: 45, color: '#f59e0b' },
      { difficulty: 'Hard', count: 12, color: '#ef4444' },
    ];

    const skillRadar = [
      { skill: 'Arrays', current: 85, target: 90 },
      { skill: 'Strings', current: 75, target: 85 },
      { skill: 'Trees', current: 65, target: 80 },
      { skill: 'Graphs', current: 45, target: 70 },
      { skill: 'DP', current: 35, target: 75 },
      { skill: 'Math', current: 70, target: 80 },
    ];

    const ratingHistory = Array.from({ length: 10 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (9 - i) * 7);
      return {
        date: date.toISOString().split('T')[0],
        rating: 1200 + Math.floor(Math.random() * 300) + i * 10,
        contest: `Contest ${i + 1}`,
      };
    });

    return {
      dailyProgress,
      topicDistribution,
      difficultyDistribution,
      skillRadar,
      ratingHistory,
    };
  }
}

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
      <div className='max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500'>
        {/* Header */}
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl'>
          <div className='absolute inset-0 bg-black/10' />
          <div className='relative'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold tracking-tight mb-2'>
                  Platform Integration & Analytics
                </h1>
                <p className='text-indigo-100 text-lg'>
                  Connect your coding platforms and visualize your progress with
                  beautiful charts
                </p>
              </div>
              <div className='hidden md:flex items-center gap-4'>
                <div className='text-center'>
                  <div className='text-3xl font-bold'>{connectedCount}</div>
                  <div className='text-sm text-indigo-200'>Connected</div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold'>
                    {activityStats.totalSolved}
                  </div>
                  <div className='text-sm text-indigo-200'>Problems Solved</div>
                </div>
              </div>
            </div>

            <div className='mt-6 flex items-center gap-3'>
              <Button
                onClick={handleSyncAll}
                disabled={syncing || connectedCount === 0}
                variant='secondary'
                className='bg-white/20 hover:bg-white/30 text-white border-white/30'
              >
                {syncing ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Syncing All Platforms...
                  </>
                ) : (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Sync All Platforms
                  </>
                )}
              </Button>
              <Badge
                variant='secondary'
                className='bg-white/20 text-white border-white/30'
              >
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue='integrations' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 rounded-xl bg-white shadow-sm border'>
            <TabsTrigger
              value='integrations'
              className='rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700'
            >
              <LinkIcon className='h-4 w-4 mr-2' />
              Platform Connections
            </TabsTrigger>
            <TabsTrigger
              value='analytics'
              className='rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700'
            >
              <TrendingUp className='h-4 w-4 mr-2' />
              Activity Analytics
            </TabsTrigger>
            <TabsTrigger
              value='goals'
              className='rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700'
            >
              <Settings className='h-4 w-4 mr-2' />
              Goal Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value='integrations' className='space-y-6 mt-8'>
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

          <TabsContent value='analytics' className='space-y-8 mt-8'>
            {connectedCount === 0 ? (
              <Card className='rounded-2xl shadow-md'>
                <CardContent className='flex flex-col items-center justify-center py-16'>
                  <div className='text-8xl mb-6'>📊</div>
                  <h3 className='text-2xl font-semibold mb-3'>
                    Connect Platforms for Analytics
                  </h3>
                  <p className='text-muted-foreground text-center mb-8 max-w-md'>
                    Connect at least one coding platform to unlock beautiful
                    analytics, progress tracking, and detailed insights into
                    your coding journey.
                  </p>
                  <Button
                    size='lg'
                    onClick={() => {
                      const integrationsTab = document.querySelector(
                        '[value="integrations"]'
                      ) as HTMLElement;
                      integrationsTab?.click();
                    }}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  >
                    <LinkIcon className='h-4 w-4 mr-2' />
                    Connect Your First Platform
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
