-- Fix the notification type error when updating certificates
-- The issue is that the trigger is passing string values instead of the notification_type enum

-- 1. First, let's check what notification_type enum values exist
SELECT 'Notification Type Enum Values' as info,
       unnest(enum_range(NULL::notification_type)) as enum_value;

-- 2. Drop the problematic trigger first
DROP TRIGGER IF EXISTS on_certificate_status_change ON public.certificates;
DROP TRIGGER IF EXISTS on_certificate_progress_update ON public.certificates;

-- 3. Drop the problematic functions
DROP FUNCTION IF EXISTS public.create_certificate_notification();
DROP FUNCTION IF EXISTS public.update_student_progress_on_certificate();
DROP FUNCTION IF EXISTS public.notify_certificate_verification();

-- 4. Create a fixed notification function that uses the correct enum values
CREATE OR REPLACE FUNCTION public.notify_certificate_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Certificate ' || NEW.status,
      'Your certificate "' || NEW.title || '" has been ' || NEW.status || 
      CASE WHEN NEW.status = 'rejected' AND NEW.rejection_reason IS NOT NULL 
           THEN '. Reason: ' || NEW.rejection_reason 
           ELSE '.' 
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'certificate_approved'::notification_type
        WHEN NEW.status = 'rejected' THEN 'certificate_rejected'::notification_type
        ELSE 'certificate_updated'::notification_type
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Recreate the trigger with the fixed function
CREATE TRIGGER on_certificate_status_change
  AFTER UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_certificate_verification();

-- 6. Test the trigger by updating a certificate
-- First, let's see if there are any certificates to test with
SELECT 'Available Certificates for Testing' as info,
       c.id,
       c.title,
       c.status,
       p.full_name as student_name
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
WHERE c.status = 'pending'
LIMIT 5;

-- 7. If there are pending certificates, test updating one
-- This will test if the trigger works without errors
UPDATE public.certificates 
SET status = 'approved', 
    verified_at = now(),
    remark = 'Test approval to verify trigger works'
WHERE id IN (
    SELECT c.id 
    FROM public.certificates c 
    WHERE c.status = 'pending' 
    LIMIT 1
);

-- 8. Show the result
SELECT 'Test Update Result' as info,
       c.id,
       c.title,
       c.status,
       c.verified_at,
       c.remark,
       p.full_name as student_name
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
WHERE c.remark = 'Test approval to verify trigger works';

-- 9. Check if notifications were created
SELECT 'Notifications Created' as info,
       n.id,
       n.title,
       n.message,
       n.type,
       n.created_at,
       p.full_name as student_name
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
WHERE n.title LIKE 'Certificate%'
ORDER BY n.created_at DESC
LIMIT 5;
