import { supabase } from '@/integrations/supabase/client';

// Types
export interface DashboardStats {
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  rank: number;
  badges: Badge[];
  recentAchievements: Achievement[];
  categoryStats: CategoryStat[];
}

export interface Achievement {
  id: string;
  title: string;
  type:
    | 'certificate'
    | 'course'
    | 'event'
    | 'competition'
    | 'leadership'
    | 'volunteer'
    | 'research';
  category: string;
  points: number;
  earnedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CategoryStat {
  category: string;
  count: number;
  points: number;
  color: string;
}

export interface ActivityData {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  type:
    | 'achievement'
    | 'certificate'
    | 'course'
    | 'streak'
    | 'milestone'
    | 'goal';
  title: string;
  description: string;
  points: number;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  category: string;
}

class DashboardService {
  private static instance: DashboardService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  // Get cached data or fetch fresh
  private async getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get comprehensive dashboard stats
  async getDashboardStats(studentId: string): Promise<DashboardStats> {
    return this.getCachedData(`dashboard_stats_${studentId}`, async () => {
      try {
        // Fetch all data in parallel
        const [
          progressData,
          achievementsData,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          activitiesData,
          certificatesData,
        ] = await Promise.all([
          this.getStudentProgress(studentId),
          this.getStudentAchievements(studentId),
          this.getStudentActivities(studentId, 10),
          this.getStudentCertificates(studentId),
        ]);

        // Calculate stats
        const totalAchievements = achievementsData.length;
        const currentStreak = progressData?.current_streak_days || 0;
        const longestStreak = progressData?.longest_streak_days || 0;
        const totalPoints = achievementsData.reduce(
          (sum, a) => sum + (a.points || 0),
          0
        );
        const level = Math.max(1, Math.floor(totalPoints / 100) + 1);

        // Calculate rank (simplified - in real app, this would be more complex)
        const rank = 1; // TODO: Implement actual ranking system

        // Generate badges based on achievements
        const badges = this.generateBadges(achievementsData, progressData);

        // Map achievements to our format
        const recentAchievements = achievementsData.slice(0, 5).map(a => ({
          id: a.id,
          title: a.title,
          type: this.mapAchievementType(a.achievement_type),
          category: this.getAchievementCategory(a.achievement_type),
          points: a.points || 0,
          earnedAt: a.earned_at,
          status: 'approved' as const,
          description: a.description || '',
        }));

        // Calculate category stats
        const categoryStats = this.calculateCategoryStats(
          achievementsData,
          certificatesData
        );

        return {
          totalAchievements,
          currentStreak,
          longestStreak,
          totalPoints,
          level,
          rank,
          badges,
          recentAchievements,
          categoryStats,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    });
  }

  // Get student progress
  async getStudentProgress(studentId: string) {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get student achievements
  async getStudentAchievements(studentId: string) {
    const { data, error } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get student activities
  async getStudentActivities(studentId: string, limit = 20) {
    const { data, error } = await supabase
      .from('student_activities')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get student certificates
  async getStudentCertificates(studentId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get social activities (for activity feed)
  async getSocialActivities(
    studentId: string,
    limit = 20
  ): Promise<ActivityData[]> {
    return this.getCachedData(`social_activities_${studentId}`, async () => {
      try {
        // Get user's connections
        const { data: connections } = await supabase
          .from('student_connections')
          .select('requester_id, receiver_id')
          .or(`requester_id.eq.${studentId},receiver_id.eq.${studentId}`)
          .eq('status', 'accepted');

        const connectionIds =
          connections?.map(c =>
            c.requester_id === studentId ? c.receiver_id : c.requester_id
          ) || [];

        // Get activities from connections and self
        const { data: activities, error } = await supabase
          .from('student_activities')
          .select(
            `
            *,
            student:profiles!student_activities_student_id_fkey(full_name, avatar_url)
          `
          )
          .in('student_id', [studentId, ...connectionIds])
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // Transform to our format
        return (activities || []).map(activity => ({
          id: activity.id,
          user: {
            id: activity.student_id,
            name: activity.student?.full_name || 'Unknown',
            avatar: activity.student?.avatar_url || '',
            level: Math.floor(Math.random() * 20) + 1, // TODO: Calculate actual level
          },
          type: this.mapActivityType(activity.activity_type),
          title: activity.title,
          description: activity.description || '',
          points: this.getActivityPoints(activity.activity_type),
          timestamp: activity.created_at,
          likes: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 5),
          isLiked: false,
          category: 'general',
        }));
      } catch (error) {
        console.error('Error fetching social activities:', error);
        return [];
      }
    });
  }

  // Award achievement
  async awardAchievement(
    studentId: string,
    type: string,
    title: string,
    description: string,
    points: number,
    metadata?: any
  ) {
    try {
      const { data, error } = await supabase
        .from('student_achievements')
        .insert({
          student_id: studentId,
          achievement_type: type as any,
          title,
          description,
          points,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Add activity
      await this.addActivity(
        studentId,
        'achievement_earned',
        title,
        description
      );

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  // Add activity
  async addActivity(
    studentId: string,
    type: string,
    title: string,
    description: string,
    metadata?: any
  ) {
    try {
      const { error } = await supabase.from('student_activities').insert({
        student_id: studentId,
        activity_type: type as any,
        title,
        description,
        metadata: metadata || {},
      });

      if (error) throw error;

      // Update progress
      await this.updateProgress(studentId);

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }

  // Update student progress
  async updateProgress(studentId: string) {
    try {
      // Get current counts
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [certificates, achievements, activities] = await Promise.all([
        this.getStudentCertificates(studentId),
        this.getStudentAchievements(studentId),
        this.getStudentActivities(studentId, 1000),
      ]);

      const totalCertificates = certificates.length;
      const approvedCertificates = certificates.filter(
        c => c.status === 'approved'
      ).length;
      const pendingCertificates = certificates.filter(
        c => c.status === 'pending'
      ).length;
      const rejectedCertificates =
        totalCertificates - approvedCertificates - pendingCertificates;

      // Calculate streak (simplified)
      const currentStreak = this.calculateStreak(activities);
      const longestStreak = await this.getLongestStreak(studentId);

      // Update or insert progress
      const { error } = await supabase.from('student_progress').upsert({
        student_id: studentId,
        total_certificates: totalCertificates,
        approved_certificates: approvedCertificates,
        pending_certificates: pendingCertificates,
        rejected_certificates: rejectedCertificates,
        current_streak_days: currentStreak,
        longest_streak_days: longestStreak,
        total_activities: activities.length,
        last_activity_date: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  // Helper methods
  private mapAchievementType(type: string): Achievement['type'] {
    switch (type) {
      case 'course_completion':
        return 'course';
      case 'participation':
        return 'event';
      case 'excellence':
        return 'competition';
      case 'milestone':
        return 'leadership';
      case 'streak':
        return 'volunteer';
      default:
        return 'certificate';
    }
  }

  private mapActivityType(type: string): ActivityData['type'] {
    switch (type) {
      case 'certificate_upload':
        return 'certificate';
      case 'course_complete':
        return 'course';
      case 'achievement_earned':
        return 'achievement';
      case 'goal_achieved':
        return 'goal';
      default:
        return 'achievement';
    }
  }

  private getAchievementCategory(type: string): string {
    switch (type) {
      case 'certificate':
        return 'Certificates';
      case 'course_completion':
        return 'Courses';
      case 'participation':
        return 'Events';
      case 'excellence':
        return 'Competitions';
      case 'milestone':
        return 'Leadership';
      case 'streak':
        return 'Volunteer';
      default:
        return 'General';
    }
  }

  private getActivityPoints(type: string): number {
    switch (type) {
      case 'certificate_upload':
        return 50;
      case 'course_complete':
        return 100;
      case 'achievement_earned':
        return 25;
      case 'goal_achieved':
        return 75;
      default:
        return 10;
    }
  }

  private generateBadges(achievements: any[], progress: any): Badge[] {
    const badges: Badge[] = [];

    // Certificate badges
    const certCount = achievements.filter(
      a => a.achievement_type === 'certificate'
    ).length;
    if (certCount >= 1)
      badges.push({
        id: 'first_cert',
        name: 'First Certificate',
        description: 'Earned your first certificate',
        icon: '🏆',
        earnedAt: new Date().toISOString(),
        rarity: 'common',
      });
    if (certCount >= 5)
      badges.push({
        id: 'cert_collector',
        name: 'Certificate Collector',
        description: 'Earned 5 certificates',
        icon: '🎖️',
        earnedAt: new Date().toISOString(),
        rarity: 'rare',
      });

    // Streak badges
    const streak = progress?.current_streak_days || 0;
    if (streak >= 7)
      badges.push({
        id: 'week_warrior',
        name: 'Week Warrior',
        description: '7 day activity streak',
        icon: '🔥',
        earnedAt: new Date().toISOString(),
        rarity: 'epic',
      });

    return badges;
  }

  private calculateCategoryStats(
    achievements: any[],
    certificates: any[]
  ): CategoryStat[] {
    const stats: { [key: string]: { count: number; points: number } } = {};

    // Process achievements
    achievements.forEach(a => {
      const category = this.getAchievementCategory(a.achievement_type);
      if (!stats[category]) {
        stats[category] = { count: 0, points: 0 };
      }
      stats[category].count++;
      stats[category].points += a.points || 0;
    });

    // Process certificates
    certificates.forEach(c => {
      const category =
        c.category === 'academic'
          ? 'Academic Certificates'
          : 'Co-curricular Certificates';
      if (!stats[category]) {
        stats[category] = { count: 0, points: 0 };
      }
      stats[category].count++;
      stats[category].points += 50; // Base points for certificates
    });

    return Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      points: data.points,
      color: this.getCategoryColor(category),
    }));
  }

  private getCategoryColor(category: string): string {
    const colors = {
      Certificates: '#10B981',
      Courses: '#3B82F6',
      Events: '#8B5CF6',
      Competitions: '#F59E0B',
      Leadership: '#EC4899',
      Volunteer: '#F97316',
      'Academic Certificates': '#10B981',
      'Co-curricular Certificates': '#8B5CF6',
      General: '#6B7280',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  }

  private calculateStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    const currentDate = new Date(today);

    // Sort activities by date
    const sortedActivities = activities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.created_at);
      const daysDiff = Math.floor(
        (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private async getLongestStreak(studentId: string): Promise<number> {
    const { data } = await supabase
      .from('student_progress')
      .select('longest_streak_days')
      .eq('student_id', studentId)
      .single();

    return data?.longest_streak_days || 0;
  }
}

export default DashboardService;
