-- Enable real-time replication for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable real-time replication for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a function to handle real-time message updates
CREATE OR REPLACE FUNCTION public.handle_message_realtime()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- The real-time subscription will automatically pick up the changes
  -- This function can be used for additional processing if needed
  RETURN NEW;
END;
$$;

-- Create trigger for real-time message updates
CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_message_realtime();

-- Create trigger for real-time message updates
CREATE TRIGGER on_message_update
  AFTER UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_message_realtime();

-- Ensure the messages table has the proper structure for real-time
-- Add any missing columns that might be needed
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update updated_at on message updates
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON public.messages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions for real-time
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.notifications TO postgres, anon, authenticated, service_role;
