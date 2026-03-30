import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchLeetCodeData,
  fetchCodeforcesData,
  fetchCodewarsData,
  fetchGFGData,
  fetchHackerRankData,
  fetchHackerEarthData,
  fetchCodeChefData,
} from '@/services/platforms';

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

interface ActivityStats {
  totalSolved: number;
  weekSolved: number;
  currentStreak: number;
  contestRating: number;
}

interface ActivityData {
  dailyProgress: Array<{ date: string; solved: number; goal?: number }>;
  topicDistribution: Array<{ topic: string; solved: number; target: number }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    color: string;
  }>;
  skillRadar: Array<{ skill: string; current: number; target: number }>;
  ratingHistory: Array<{ date: string; rating: number; contest: string }>;
}

const STORAGE_KEY = 'platform_integrations_v1';
const ACTIVITY_KEY = 'platform_activity_v1';

const DEFAULT_PLATFORMS: Platform[] = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    icon: '🟧',
    description: 'Practice coding problems and contests',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    icon: '🟦',
    description: 'Competitive programming platform',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    icon: '🟩',
    description: 'Coding challenges and skill assessment',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'gfg',
    name: 'GeeksforGeeks',
    icon: '🟢',
    description: 'Programming tutorials and practice',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'codewars',
    name: 'Codewars',
    icon: '⚔️',
    description: 'Code kata and programming challenges',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'hackerearth',
    name: 'HackerEarth',
    icon: '🌍',
    description: 'Programming challenges and hackathons',
    authType: 'profile_url',
    isConnected: false,
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    icon: '👨‍🍳',
    description: 'Competitive programming and contests',
    authType: 'profile_url',
    isConnected: false,
  },
];

// Generate sample activity data
const generateSampleActivityData = (): ActivityData => {
  const today = new Date();
  const dailyProgress = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      solved: Math.floor(Math.random() * 8) + 1,
      goal: i > 20 ? 5 : undefined, // Show goal line for recent days
    };
  });

  const topicDistribution = [
    { topic: 'Arrays', solved: 45, target: 50 },
    { topic: 'Strings', solved: 32, target: 40 },
    { topic: 'Trees', solved: 28, target: 35 },
    { topic: 'Graphs', solved: 15, target: 25 },
    { topic: 'DP', solved: 12, target: 30 },
    { topic: 'Math', solved: 20, target: 25 },
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
};

export const usePlatformIntegration = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PLATFORMS;
    } catch {
      return DEFAULT_PLATFORMS;
    }
  });

  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalSolved: 142,
    weekSolved: 23,
    currentStreak: 7,
    contestRating: 1456,
  });

  const [activityData, setActivityData] = useState<ActivityData>(() => {
    try {
      const stored = localStorage.getItem(ACTIVITY_KEY);
      return stored ? JSON.parse(stored) : generateSampleActivityData();
    } catch {
      return generateSampleActivityData();
    }
  });

  // Save to localStorage whenever platforms change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityData));
  }, [activityData]);

  const connectPlatform = async (platformId: string, credentials: any) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId
          ? {
              ...p,
              isConnected: true,
              handle:
                credentials.profileUrl ||
                credentials.handle ||
                credentials.apiKey,
              syncStatus: 'idle',
              lastSync: new Date().toISOString(),
            }
          : p
      )
    );

    toast({
      title: 'Platform Connected',
      description: `Successfully connected to ${platforms.find(p => p.id === platformId)?.name}`,
    });

    // Trigger initial sync
    await syncPlatform(platformId);
  };

  const disconnectPlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId
          ? {
              ...p,
              isConnected: false,
              handle: undefined,
              lastSync: undefined,
              syncStatus: 'idle',
            }
          : p
      )
    );

    toast({
      title: 'Platform Disconnected',
      description: `Disconnected from ${platforms.find(p => p.id === platformId)?.name}`,
    });
  };

  const syncPlatform = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform?.isConnected || !platform.handle) return;

    setPlatforms(prev =>
      prev.map(p => (p.id === platformId ? { ...p, syncStatus: 'syncing' } : p))
    );

    try {
      let data;

      // Extract username from handle (could be URL or username)
      const extractUsername = (handle: string) => {
        try {
          const url = new URL(handle);
          return url.pathname.split('/').filter(Boolean).pop() || handle;
        } catch {
          return handle;
        }
      };

      const username = extractUsername(platform.handle);

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
          throw new Error('Unsupported platform');
      }

      // Update activity stats
      setActivityStats(prev => ({
        ...prev,
        totalSolved: prev.totalSolved + (data.solved || 0),
        weekSolved: prev.weekSolved + Math.floor((data.solved || 0) * 0.1),
      }));

      // Update activity data with new sync
      const today = new Date().toISOString().split('T')[0];
      setActivityData(prev => ({
        ...prev,
        dailyProgress: prev.dailyProgress.map(day =>
          day.date === today
            ? { ...day, solved: day.solved + (data.solved || 0) }
            : day
        ),
      }));

      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId
            ? {
                ...p,
                syncStatus: 'success',
                lastSync: new Date().toISOString(),
              }
            : p
        )
      );

      toast({
        title: 'Sync Successful',
        description: `Updated data from ${platform.name}. Found ${data.solved} problems solved.`,
      });
    } catch (error) {
      console.error('Sync failed:', error);

      setPlatforms(prev =>
        prev.map(p => (p.id === platformId ? { ...p, syncStatus: 'error' } : p))
      );

      toast({
        title: 'Sync Failed',
        description: `Failed to sync data from ${platform.name}. Please check your connection.`,
        variant: 'destructive',
      });
    }
  };

  const syncAllPlatforms = async () => {
    const connectedPlatforms = platforms.filter(p => p.isConnected);

    for (const platform of connectedPlatforms) {
      await syncPlatform(platform.id);
      // Add small delay between syncs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return {
    platforms,
    activityStats,
    activityData,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    syncAllPlatforms,
  };
};
