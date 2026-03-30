import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';
import { supabase } from '@/integrations/supabase/client';

export const useStudentSafe = () => {
  const { profile } = useProfile();
  const [progress, setProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Safe fetch function that handles missing tables
  const safeFetch = async (tableName: string, query: any) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(query.select || '*')
        .modify(query.modify || (q => q));

      if (error) {
        // If table doesn't exist, return empty data instead of throwing
        if (error.code === 'PGRST200' || error.code === '42P01') {
          console.warn(
            `Table ${tableName} does not exist, returning empty data`
          );
          return { data: [], error: null };
        }
        throw error;
      }
      return { data: data || [], error: null };
    } catch (error) {
      console.warn(`Error fetching from ${tableName}:`, error);
      return { data: [], error };
    }
  };

  // Fetch progress
  const fetchProgress = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_progress', {
      select: '*',
      modify: (q: any) => q.eq('student_id', profile.id).single(),
    });

    setProgress(data);
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_achievements', {
      select: '*',
      modify: (q: any) =>
        q.eq('student_id', profile.id).order('earned_at', { ascending: false }),
    });

    setAchievements(data);
  };

  // Fetch activities
  const fetchActivities = async (limit = 20) => {
    if (!profile) return;

    const { data } = await safeFetch('student_activities', {
      select: '*',
      modify: (q: any) =>
        q
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(limit),
    });

    setActivities(data);
  };

  // Fetch goals
  const fetchGoals = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_goals', {
      select: '*',
      modify: (q: any) =>
        q
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false }),
    });

    setGoals(data);
  };

  // Fetch connections
  const fetchConnections = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_connections', {
      select: `
        *,
        student:profiles!student_connections_student_id_fkey(full_name, avatar_url),
        connection:profiles!student_connections_connection_id_fkey(full_name, avatar_url)
      `,
      modify: (q: any) =>
        q
          .or(`student_id.eq.${profile.id},connection_id.eq.${profile.id}`)
          .order('created_at', { ascending: false }),
    });

    setConnections(data);
  };

  // Fetch portfolio
  const fetchPortfolio = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_portfolio', {
      select: '*',
      modify: (q: any) =>
        q
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false }),
    });

    setPortfolio(data);
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_recommendations', {
      select: '*',
      modify: (q: any) =>
        q
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false }),
    });

    setRecommendations(data);
  };

  // Fetch milestones
  const fetchMilestones = async () => {
    if (!profile) return;

    const { data } = await safeFetch('student_milestones', {
      select: '*',
      modify: (q: any) =>
        q
          .eq('student_id', profile.id)
          .order('achieved_at', { ascending: false }),
    });

    setMilestones(data);
  };

  // Load all data
  const loadData = async () => {
    if (!profile || profile.role !== 'student') return;

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
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return {
    progress,
    achievements,
    activities,
    goals,
    connections,
    portfolio,
    recommendations,
    milestones,
    loading,
    refresh: loadData,
  };
};
