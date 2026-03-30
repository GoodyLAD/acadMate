-- Create missing student dashboard tables (Clean Version)
-- This fixes the 404 errors in the student dashboard

-- Create student_activities table
CREATE TABLE IF NOT EXISTS public.student_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    badge_url TEXT,
    points INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_goals table
CREATE TABLE IF NOT EXISTS public.student_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_milestones table
CREATE TABLE IF NOT EXISTS public.student_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    milestone_type TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_connections table
CREATE TABLE IF NOT EXISTS public.student_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, connection_id)
);

-- Create student_portfolio table
CREATE TABLE IF NOT EXISTS public.student_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    portfolio_type TEXT NOT NULL,
    file_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student tables
CREATE POLICY "Students can view their own activities" ON public.student_activities
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own activities" ON public.student_activities
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own activities" ON public.student_activities
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can view their own achievements" ON public.student_achievements
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own achievements" ON public.student_achievements
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own goals" ON public.student_goals
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own goals" ON public.student_goals
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own goals" ON public.student_goals
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can view their own milestones" ON public.student_milestones
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own milestones" ON public.student_milestones
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own connections" ON public.student_connections
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = connection_id);

CREATE POLICY "Students can insert their own connections" ON public.student_connections
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own portfolio" ON public.student_portfolio
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own portfolio" ON public.student_portfolio
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own portfolio" ON public.student_portfolio
    FOR UPDATE USING (auth.uid() = student_id);

-- Add update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_activities_updated_at BEFORE UPDATE ON public.student_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_goals_updated_at BEFORE UPDATE ON public.student_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_portfolio_updated_at BEFORE UPDATE ON public.student_portfolio
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
