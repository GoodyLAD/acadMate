-- Fix student dashboard issues
-- This addresses the 404 and 400 errors

-- 1. Create missing student_progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for student_progress
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for student_progress
CREATE POLICY "Students can view their own progress" ON public.student_progress
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress" ON public.student_progress
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON public.student_progress
    FOR UPDATE USING (auth.uid() = student_id);

-- 2. Fix student_connections table structure
-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS public.student_connections CASCADE;

-- Recreate with correct structure
CREATE TABLE public.student_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, connection_id)
);

-- Enable RLS for student_connections
ALTER TABLE public.student_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_connections
CREATE POLICY "Students can view their own connections" ON public.student_connections
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = connection_id);

CREATE POLICY "Students can insert their own connections" ON public.student_connections
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 3. Re-enable notification triggers
-- First, recreate the notification functions
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate notification triggers
CREATE OR REPLACE FUNCTION public.notify_post_created()
RETURNS TRIGGER AS $$
DECLARE
    group_members UUID[];
    member_id UUID;
BEGIN
    -- Notify all group members if post is in a group
    IF NEW.group_id IS NOT NULL THEN
        SELECT ARRAY_AGG(user_id) INTO group_members
        FROM public.group_memberships
        WHERE group_id = NEW.group_id;
        
        FOREACH member_id IN ARRAY group_members
        LOOP
            IF member_id != NEW.author_id THEN
                PERFORM public.create_notification(
                    member_id,
                    'post_created',
                    'New Post in Group',
                    NEW.author_name || ' created a new post',
                    jsonb_build_object('post_id', NEW.id, 'group_id', NEW.group_id)
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.notify_post_interaction()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_author_name TEXT;
BEGIN
    -- Get post author info
    SELECT author_id, author_name INTO post_author_id, post_author_name
    FROM public.community_posts
    WHERE id = NEW.post_id;
    
    -- Don't notify the user who made the interaction
    IF post_author_id != NEW.user_id THEN
        PERFORM public.create_notification(
            post_author_id,
            CASE 
                WHEN NEW.interaction_type = 'upvote' THEN 'post_liked'
                WHEN NEW.interaction_type = 'downvote' THEN 'post_disliked'
                ELSE 'post_interaction'
            END,
            'Post ' || NEW.interaction_type || 'd',
            'Your post was ' || NEW.interaction_type || 'd',
            jsonb_build_object('post_id', NEW.post_id, 'interaction_type', NEW.interaction_type)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_author_name TEXT;
BEGIN
    -- Get post author info
    SELECT author_id, author_name INTO post_author_id, post_author_name
    FROM public.community_posts
    WHERE id = NEW.post_id;
    
    -- Don't notify the comment author
    IF post_author_id != NEW.author_id THEN
        PERFORM public.create_notification(
            post_author_id,
            'post_commented',
            'New Comment',
            NEW.author_name || ' commented on your post',
            jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
DROP TRIGGER IF EXISTS notify_new_post ON public.community_posts;
CREATE TRIGGER notify_new_post AFTER INSERT ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.notify_post_created();

DROP TRIGGER IF EXISTS notify_post_interaction ON public.post_interactions;
CREATE TRIGGER notify_post_interaction AFTER INSERT ON public.post_interactions
    FOR EACH ROW EXECUTE FUNCTION public.notify_post_interaction();

DROP TRIGGER IF EXISTS notify_new_comment ON public.post_comments;
CREATE TRIGGER notify_new_comment AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

-- 4. Add update trigger for student_progress
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON public.student_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
