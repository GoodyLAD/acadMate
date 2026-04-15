-- Add remark column to certificates table (optional, for storing approval notes)
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS remark TEXT;
