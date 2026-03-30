-- LMS/ERP Integration System
-- This migration creates tables and functions for external system integration

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_logs table for tracking webhook deliveries
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Create integration_configs table for storing LMS/ERP configurations
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('moodle', 'canvas', 'blackboard', 'generic', 'sis', 'erp')),
  base_url TEXT NOT NULL,
  api_key TEXT,
  client_id TEXT,
  client_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create api_keys table for API authentication
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create data_sync_logs table for tracking data synchronization
CREATE TABLE IF NOT EXISTS public.data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integration_configs(id),
  sync_type TEXT NOT NULL, -- 'students', 'courses', 'achievements', 'faculty'
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON public.webhooks USING GIN (events);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks (is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs (webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_triggered_at ON public.webhook_logs (triggered_at);
CREATE INDEX IF NOT EXISTS idx_integration_configs_type ON public.integration_configs (type);
CREATE INDEX IF NOT EXISTS idx_integration_configs_active ON public.integration_configs (is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys (is_active);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_integration_id ON public.data_sync_logs (integration_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_started_at ON public.data_sync_logs (started_at);

-- Create function to trigger webhooks
CREATE OR REPLACE FUNCTION public.trigger_webhook(
  p_event_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  webhook_record RECORD;
  payload JSONB;
  response_status INTEGER;
  response_body TEXT;
  error_message TEXT;
BEGIN
  -- Get all active webhooks that listen to this event type
  FOR webhook_record IN 
    SELECT * FROM public.webhooks 
    WHERE is_active = true 
    AND p_event_type = ANY(events)
  LOOP
    -- Prepare payload
    payload := jsonb_build_object(
      'event_type', p_event_type,
      'resource_type', p_resource_type,
      'resource_id', p_resource_id,
      'data', p_data,
      'timestamp', now(),
      'webhook_id', webhook_record.id
    );

    -- Log webhook trigger
    INSERT INTO public.webhook_logs (
      webhook_id,
      event_type,
      resource_type,
      resource_id,
      payload
    ) VALUES (
      webhook_record.id,
      p_event_type,
      p_resource_type,
      p_resource_id,
      payload
    );

    -- Update last triggered timestamp
    UPDATE public.webhooks 
    SET last_triggered = now(), updated_at = now()
    WHERE id = webhook_record.id;
  END LOOP;
END;
$$;

-- Create function to process webhook deliveries (to be called by external service)
CREATE OR REPLACE FUNCTION public.process_webhook_delivery(
  p_webhook_log_id UUID,
  p_response_status INTEGER,
  p_response_body TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.webhook_logs
  SET 
    response_status = p_response_status,
    response_body = p_response_body,
    error_message = p_error_message,
    processed_at = now()
  WHERE id = p_webhook_log_id;

  -- Update webhook retry count if failed
  IF p_response_status >= 400 THEN
    UPDATE public.webhooks
    SET retry_count = retry_count + 1, updated_at = now()
    WHERE id = (SELECT webhook_id FROM public.webhook_logs WHERE id = p_webhook_log_id);
  END IF;
END;
$$;

-- Create function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key(
  p_name TEXT,
  p_permissions TEXT[] DEFAULT '{}',
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  api_key TEXT;
  key_hash TEXT;
BEGIN
  -- Generate random API key
  api_key := encode(gen_random_bytes(32), 'hex');
  
  -- Hash the key for storage
  key_hash := encode(digest(api_key, 'sha256'), 'hex');
  
  -- Store the hashed key
  INSERT INTO public.api_keys (name, key_hash, permissions, expires_at, created_by)
  VALUES (p_name, key_hash, p_permissions, p_expires_at, p_created_by);
  
  -- Return the plain text key (only time it's visible)
  RETURN api_key;
END;
$$;

-- Create function to validate API key
CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  permissions TEXT[],
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  key_hash TEXT;
  key_record RECORD;
BEGIN
  -- Hash the provided key
  key_hash := encode(digest(p_api_key, 'sha256'), 'hex');
  
  -- Look up the key
  SELECT * INTO key_record
  FROM public.api_keys
  WHERE key_hash = key_hash
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  IF FOUND THEN
    -- Update last used timestamp
    UPDATE public.api_keys
    SET last_used_at = now()
    WHERE id = key_record.id;
    
    -- Return validation result
    is_valid := true;
    permissions := key_record.permissions;
    expires_at := key_record.expires_at;
    RETURN NEXT;
  ELSE
    -- Return invalid result
    is_valid := false;
    permissions := '{}';
    expires_at := NULL;
    RETURN NEXT;
  END IF;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Webhooks: Only admins can manage
CREATE POLICY webhooks_admin_only ON public.webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Webhook logs: Only admins can view
CREATE POLICY webhook_logs_admin_only ON public.webhook_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Integration configs: Only admins can manage
CREATE POLICY integration_configs_admin_only ON public.integration_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- API keys: Only admins can manage
CREATE POLICY api_keys_admin_only ON public.api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Data sync logs: Only admins can view
CREATE POLICY data_sync_logs_admin_only ON public.data_sync_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.webhooks TO authenticated;
GRANT ALL ON public.webhook_logs TO authenticated;
GRANT ALL ON public.integration_configs TO authenticated;
GRANT ALL ON public.api_keys TO authenticated;
GRANT ALL ON public.data_sync_logs TO authenticated;

-- Create sample API key for testing
INSERT INTO public.api_keys (name, key_hash, permissions, is_active, created_by)
VALUES (
  'Test API Key',
  encode(digest('test-api-key-12345', 'sha256'), 'hex'),
  ARRAY['students:read', 'courses:read', 'achievements:read'],
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- Create sample webhook for testing
INSERT INTO public.webhooks (url, events, is_active)
VALUES (
  'https://webhook.site/test-webhook',
  ARRAY['student.created', 'student.updated', 'achievement.earned'],
  true
);

-- Create sample integration config
INSERT INTO public.integration_configs (name, type, base_url, is_active, settings)
VALUES (
  'Test LMS Integration',
  'generic',
  'https://test-lms.example.com',
  true,
  '{"version": "1.0", "timeout": 30}'::jsonb
);
