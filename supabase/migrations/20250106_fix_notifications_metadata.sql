-- Fix notifications table to include metadata column
-- This fixes the "column metadata does not exist" error

-- Add metadata column to notifications table if it doesn't exist
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update the create_notification function to handle metadata properly
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

-- Update notification triggers to use the correct function signature
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
