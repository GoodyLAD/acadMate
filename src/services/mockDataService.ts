// Mock data service for immediate testing without database
export const mockDashboardStats = {
  totalAchievements: 4,
  currentStreak: 7,
  longestStreak: 15,
  totalPoints: 375,
  level: 4,
  rank: 1,
  badges: [
    {
      id: 'badge1',
      name: 'First Certificate',
      description: 'Earned your first certificate',
      icon: '🏆',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'common' as const,
    },
    {
      id: 'badge2',
      name: 'Certificate Collector',
      description: 'Earned 2 certificates',
      icon: '🎖️',
      earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'rare' as const,
    },
    {
      id: 'badge3',
      name: 'Week Warrior',
      description: '7 day activity streak',
      icon: '🔥',
      earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'epic' as const,
    },
    {
      id: 'badge4',
      name: 'Course Master',
      description: 'Completed 3 courses',
      icon: '📚',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'legendary' as const,
    },
  ],
  recentAchievements: [
    {
      id: 'ach1',
      title: 'First Certificate',
      type: 'certificate' as const,
      category: 'Certificates',
      points: 50,
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const,
      description: 'Earned your first certificate',
    },
    {
      id: 'ach2',
      title: 'Certificate Collector',
      type: 'certificate' as const,
      category: 'Certificates',
      points: 100,
      earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const,
      description: 'Earned 2 certificates',
    },
    {
      id: 'ach3',
      title: 'Week Warrior',
      type: 'volunteer' as const,
      category: 'Streaks',
      points: 75,
      earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const,
      description: '7 day activity streak',
    },
    {
      id: 'ach4',
      title: 'Course Master',
      type: 'course' as const,
      category: 'Courses',
      points: 150,
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved' as const,
      description: 'Completed 3 courses',
    },
  ],
  categoryStats: [
    {
      category: 'Certificates',
      count: 2,
      points: 150,
      color: '#10B981',
    },
    {
      category: 'Courses',
      count: 1,
      points: 150,
      color: '#3B82F6',
    },
    {
      category: 'Streaks',
      count: 1,
      points: 75,
      color: '#F97316',
    },
  ],
};

export const mockSocialActivities = [
  {
    id: 'act1',
    user: {
      id: 'user1',
      name: 'John Doe',
      avatar: '',
      level: 4,
    },
    type: 'certificate' as const,
    title: 'Uploaded AWS Certificate',
    description: 'Uploaded AWS Cloud Practitioner certificate for verification',
    points: 50,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    comments: 2,
    isLiked: false,
    category: 'general',
  },
  {
    id: 'act2',
    user: {
      id: 'user1',
      name: 'John Doe',
      avatar: '',
      level: 4,
    },
    type: 'achievement' as const,
    title: 'Earned First Certificate Achievement',
    description: 'Congratulations! You earned your first certificate',
    points: 25,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    comments: 3,
    isLiked: true,
    category: 'general',
  },
  {
    id: 'act3',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      avatar: '',
      level: 2,
    },
    type: 'course' as const,
    title: 'Completed Data Science Course',
    description: 'Successfully completed Data Science Specialization',
    points: 100,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    comments: 5,
    isLiked: false,
    category: 'general',
  },
  {
    id: 'act4',
    user: {
      id: 'user1',
      name: 'John Doe',
      avatar: '',
      level: 4,
    },
    type: 'goal' as const,
    title: 'Achieved Weekly Goal',
    description: 'Completed 5 certificates goal for this week',
    points: 75,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 6,
    comments: 1,
    isLiked: false,
    category: 'general',
  },
];

// Function to check if mock data is loaded
export const isMockDataLoaded = (): boolean => {
  return localStorage.getItem('mockDataLoaded') === 'true';
};

// Function to set mock data loaded flag
export const setMockDataLoaded = (loaded: boolean): void => {
  localStorage.setItem('mockDataLoaded', loaded.toString());
};

// Function to clear mock data flag
export const clearMockDataFlag = (): void => {
  localStorage.removeItem('mockDataLoaded');
};
