import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

// Types
export interface StudentProgress {
  id: string;
  student_id: string;
  total_certificates: number;
  approved_certificates: number;
  pending_certificates: number;
  rejected_certificates: number;
  courses_enrolled: number;
  courses_completed: number;
  current_streak_days: number;
  longest_streak_days: number;
  total_activities: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_type:
    | 'certificate'
    | 'course_completion'
    | 'streak'
    | 'milestone'
    | 'participation'
    | 'excellence';
  title: string;
  description: string | null;
  icon_url: string | null;
  points: number;
  earned_at: string;
  metadata: any;
}

export interface StudentActivity {
  id: string;
  student_id: string;
  activity_type:
    | 'certificate_upload'
    | 'course_enroll'
    | 'course_complete'
    | 'profile_update'
    | 'achievement_earned'
    | 'goal_set'
    | 'goal_achieved'
    | 'social_connection'
    | 'portfolio_update';
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
}

export interface StudentGoal {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number | null;
  current_value: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface StudentConnection {
  id: string;
  student_id: string;
  connection_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface StudentPortfolio {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  external_url: string | null;
  visibility: 'public' | 'private' | 'connections_only';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningRecommendation {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  estimated_duration: number | null;
  external_url: string | null;
  priority: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface StudentMilestone {
  id: string;
  student_id: string;
  milestone_type: string;
  target_value: number;
  current_value: number;
  title: string;
  description: string | null;
  reward_points: number;
  achieved_at: string | null;
  created_at: string;
}

export const useStudent = () => {
  const { profile } = useProfile();
  const { toast } = useToast();

  // State
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [connections, setConnections] = useState<StudentConnection[]>([]);
  const [portfolio, setPortfolio] = useState<StudentPortfolio[]>([]);
  const [recommendations, setRecommendations] = useState<
    LearningRecommendation[]
  >([]);
  const [milestones, setMilestones] = useState<StudentMilestone[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch student progress
  const fetchProgress = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', profile.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch activities
  const fetchActivities = async (limit = 20) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_activities')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Fetch goals
  const fetchGoals = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_goals')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  // Fetch connections
  const fetchConnections = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_connections')
        .select(
          `
          *,
          requester:profiles!student_connections_requester_id_fkey(full_name, avatar_url),
          receiver:profiles!student_connections_receiver_id_fkey(full_name, avatar_url)
        `
        )
        .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // Fetch portfolio
  const fetchPortfolio = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_portfolio')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('learning_recommendations')
        .select('*')
        .eq('student_id', profile.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Fetch milestones
  const fetchMilestones = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_milestones')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  // Create a goal
  const createGoal = async (
    goalData: Omit<
      StudentGoal,
      'id' | 'student_id' | 'created_at' | 'updated_at' | 'completed_at'
    >
  ) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_goals')
        .insert({
          ...goalData,
          student_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add activity
      await addActivity(
        'goal_set',
        'Goal Set',
        `Set new goal: ${goalData.title}`
      );

      toast({
        title: 'Success',
        description: 'Goal created successfully!',
      });

      fetchGoals();
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    }
  };

  // Update goal
  const updateGoal = async (goalId: string, updates: Partial<StudentGoal>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('student_id', profile.id)
        .select()
        .single();

      if (error) throw error;

      // Add activity if completed
      if (updates.status === 'completed') {
        await addActivity(
          'goal_achieved',
          'Goal Achieved',
          `Completed goal: ${data.title}`
        );
      }

      toast({
        title: 'Success',
        description: 'Goal updated successfully!',
      });

      fetchGoals();
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      });
    }
  };

  // Add portfolio item
  const addPortfolioItem = async (
    itemData: Omit<
      StudentPortfolio,
      'id' | 'student_id' | 'created_at' | 'updated_at'
    >
  ) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_portfolio')
        .insert({
          student_id: profile.id,
          title: itemData.title,
          description: itemData.description,
          category: itemData.category,
          image_url: itemData.image_url,
          external_url: itemData.external_url,
          visibility: itemData.visibility,
          featured: itemData.featured ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      await addActivity(
        'portfolio_update',
        'Portfolio Updated',
        `Added ${itemData.category}: ${itemData.title}`
      );

      toast({
        title: 'Success',
        description: 'Portfolio item added successfully!',
      });

      fetchPortfolio();
      return data;
    } catch (error: any) {
      console.error('Error adding portfolio item:', error);
      toast({
        title: 'Error',
        description: `Failed to add portfolio item: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update portfolio item
  const updatePortfolioItem = async (
    itemId: string,
    updates: Partial<StudentPortfolio>
  ) => {
    if (!profile) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.image_url !== undefined)
        dbUpdates.image_url = updates.image_url;
      if (updates.external_url !== undefined)
        dbUpdates.external_url = updates.external_url;
      if (updates.visibility !== undefined)
        dbUpdates.visibility = updates.visibility;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

      const { data, error } = await supabase
        .from('student_portfolio')
        .update(dbUpdates)
        .eq('id', itemId)
        .eq('student_id', profile.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio item updated successfully!',
      });

      fetchPortfolio();
      return data;
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update portfolio item',
        variant: 'destructive',
      });
    }
  };

  // Delete portfolio item
  const deletePortfolioItem = async (itemId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('student_portfolio')
        .delete()
        .eq('id', itemId)
        .eq('student_id', profile.id);

      if (error) throw error;

      // Add activity
      await addActivity(
        'portfolio_update',
        'Portfolio Updated',
        'Removed portfolio item'
      );

      toast({
        title: 'Success',
        description: 'Portfolio item deleted successfully!',
      });

      fetchPortfolio();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio item',
        variant: 'destructive',
      });
    }
  };

  // Send connection request
  const sendConnectionRequest = async (receiverId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_connections')
        .insert({
          requester_id: profile.id,
          receiver_id: receiverId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await addActivity(
        'social_connection',
        'Connection Request',
        'Sent connection request'
      );

      toast({
        title: 'Success',
        description: 'Connection request sent!',
      });

      fetchConnections();
      return data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  };

  // Accept connection request
  const acceptConnection = async (connectionId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('receiver_id', profile.id)
        .select()
        .single();

      if (error) throw error;

      await addActivity(
        'social_connection',
        'Connection Accepted',
        'Accepted connection request'
      );

      toast({
        title: 'Success',
        description: 'Connection accepted!',
      });

      fetchConnections();
      return data;
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept connection',
        variant: 'destructive',
      });
    }
  };

  // Update recommendation status
  const updateRecommendationStatus = async (
    recommendationId: string,
    status: LearningRecommendation['status']
  ) => {
    if (!profile) return;

    try {
      const updates: any = { status };
      if (
        status === 'in_progress' &&
        !recommendations.find(r => r.id === recommendationId)?.started_at
      ) {
        updates.started_at = new Date().toISOString();
      }
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('learning_recommendations')
        .update(updates)
        .eq('id', recommendationId)
        .eq('student_id', profile.id)
        .select()
        .single();

      if (error) throw error;

      // Add activity
      await addActivity(
        'course_enroll',
        'Learning Path Updated',
        `Updated recommendation: ${data.title}`
      );

      toast({
        title: 'Success',
        description: 'Recommendation status updated!',
      });

      fetchRecommendations();
      return data;
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recommendation',
        variant: 'destructive',
      });
    }
  };

  // Add activity (internal function)
  const addActivity = async (
    type: StudentActivity['activity_type'],
    title: string,
    description: string,
    metadata?: any
  ) => {
    if (!profile) return;

    try {
      await supabase.from('student_activities').insert({
        student_id: profile.id,
        activity_type: type,
        title,
        description,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Initialize data
  const initializeStudentData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchProgress(),
        fetchAchievements(),
        fetchActivities(),
        fetchGoals(),
        fetchConnections(),
        fetchPortfolio(),
        fetchRecommendations(),
        fetchMilestones(),
      ]);
    } catch (error) {
      console.error('Error initializing student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when profile changes
  useEffect(() => {
    if (profile) {
      initializeStudentData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return {
    // Data
    progress,
    achievements,
    activities,
    goals,
    connections,
    portfolio,
    recommendations,
    milestones,
    loading,

    // Actions
    fetchProgress,
    fetchAchievements,
    fetchActivities,
    fetchGoals,
    fetchConnections,
    fetchPortfolio,
    fetchRecommendations,
    fetchMilestones,
    createGoal,
    updateGoal,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    sendConnectionRequest,
    acceptConnection,
    updateRecommendationStatus,
    addActivity,
    initializeStudentData,
  };
};
