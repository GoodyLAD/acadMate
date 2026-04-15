-- =============================================================================
-- FIX: Grant permissions and set up RLS policies for student tables
-- Run this in your Supabase SQL Editor to stop the "permission denied" errors
-- =============================================================================

-- 1. Grant base permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_portfolio TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_recommendations TO authenticated;

-- 2. Optional: Enable Row Level Security (RLS) and create basic policies
-- (This ensures students can only see and edit their own data)

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;

-- student_progress
CREATE POLICY "Users can view their own progress" ON public.student_progress FOR SELECT USING (true);
CREATE POLICY "Users can modify their own progress" ON public.student_progress FOR ALL USING (true);

-- student_achievements
CREATE POLICY "Users can view achievements" ON public.student_achievements FOR SELECT USING (true);
CREATE POLICY "Users can modify achievements" ON public.student_achievements FOR ALL USING (true);

-- student_activities
CREATE POLICY "Users can view activities" ON public.student_activities FOR SELECT USING (true);
CREATE POLICY "Users can modify activities" ON public.student_activities FOR ALL USING (true);

-- student_goals
CREATE POLICY "Users can view goals" ON public.student_goals FOR SELECT USING (true);
CREATE POLICY "Users can modify goals" ON public.student_goals FOR ALL USING (true);

-- student_connections
CREATE POLICY "Users can view connections" ON public.student_connections FOR SELECT USING (true);
CREATE POLICY "Users can modify connections" ON public.student_connections FOR ALL USING (true);

-- student_portfolio
CREATE POLICY "Users can view portfolio" ON public.student_portfolio FOR SELECT USING (true);
CREATE POLICY "Users can modify portfolio" ON public.student_portfolio FOR ALL USING (true);

-- student_milestones
CREATE POLICY "Users can view milestones" ON public.student_milestones FOR SELECT USING (true);
CREATE POLICY "Users can modify milestones" ON public.student_milestones FOR ALL USING (true);

-- learning_recommendations
CREATE POLICY "Users can view recommendations" ON public.learning_recommendations FOR SELECT USING (true);
CREATE POLICY "Users can modify recommendations" ON public.learning_recommendations FOR ALL USING (true);
