-- Create Missing Tables Migration
-- This creates the missing tables that are causing 404 errors

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  points INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  points INTEGER NOT NULL DEFAULT 0,
  target_date TIMESTAMP WITH TIME ZONE,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_recommendations table
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recommendation_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  points INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own activities" ON public.activities FOR INSERT WITH CHECK (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for milestones
CREATE POLICY "Users can view their own milestones" ON public.milestones FOR SELECT USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own milestones" ON public.milestones FOR INSERT WITH CHECK (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own milestones" ON public.milestones FOR UPDATE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own milestones" ON public.milestones FOR DELETE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for learning_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.learning_recommendations FOR SELECT USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own recommendations" ON public.learning_recommendations FOR INSERT WITH CHECK (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own recommendations" ON public.learning_recommendations FOR UPDATE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own recommendations" ON public.learning_recommendations FOR DELETE USING (
  student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_student_id ON public.activities(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_milestones_student_id ON public.milestones(student_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_student_id ON public.learning_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_priority ON public.learning_recommendations(priority);

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_recommendations;
