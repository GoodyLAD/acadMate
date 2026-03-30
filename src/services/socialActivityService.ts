import DashboardService, { ActivityData } from './dashboardService';

class SocialActivityService {
  private static instance: SocialActivityService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 2 * 60 * 1000; // 2 minutes

  static getInstance(): SocialActivityService {
    if (!SocialActivityService.instance) {
      SocialActivityService.instance = new SocialActivityService();
    }
    return SocialActivityService.instance;
  }

  // Get social activities
  async getSocialActivities(
    studentId: string,
    limit = 20
  ): Promise<ActivityData[]> {
    const cacheKey = `social_activities_${studentId}_${limit}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const dashboardService = DashboardService.getInstance();
      const data = await dashboardService.getSocialActivities(studentId, limit);

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching social activities:', error);
      return [];
    }
  }

  // Like an activity
  async likeActivity(): Promise<boolean> {
    try {
      // TODO: Implement actual like functionality in database
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Error liking activity:', error);
      return false;
    }
  }

  // Comment on an activity
  async commentOnActivity(): Promise<boolean> {
    try {
      // TODO: Implement actual comment functionality in database
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Error commenting on activity:', error);
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export default SocialActivityService;
