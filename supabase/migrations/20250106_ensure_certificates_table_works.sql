-- Ensure the certificates table works properly for the faculty-student system
-- This creates the certificates table if it doesn't exist and sets up proper permissions

-- 1. Check if certificates table exists and its structure
SELECT 'Certificates Table Check' as info,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'NOT EXISTS' 
       END as table_status;

-- 2. Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'co_curricular')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_uploaded_at ON public.certificates(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_certificates_verified_by ON public.certificates(verified_by);

-- 4. Disable RLS on certificates table (for now, to ensure it works)
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;

-- 5. Grant all permissions
GRANT ALL ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO anon;

-- 6. Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Add trigger for updated_at
DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Test inserting a certificate (simulating student upload)
INSERT INTO public.certificates (
    id,
    student_id,
    title,
    description,
    category,
    status,
    file_url,
    file_name,
    uploaded_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    'Real Certificate Upload Test',
    'This simulates a real certificate upload from a student',
    'academic',
    'pending',
    'https://storage.supabase.co/certificates/test/' || extract(epoch from now()) || '.pdf',
    'real_certificate_test.pdf',
    now()
FROM public.profiles p
WHERE p.role::text = 'student' 
AND (LOWER(p.full_name) LIKE '%ansh%' OR LOWER(p.email) LIKE '%ansh%')
AND NOT EXISTS (
    SELECT 1 FROM public.certificates c2 
    WHERE c2.student_id = p.id 
    AND c2.title = 'Real Certificate Upload Test'
);

-- 9. Verify the certificate was created and can be seen by faculty
SELECT 'Certificate Creation Test' as info,
       c.id as certificate_id,
       c.title,
       c.status,
       c.uploaded_at,
       p.full_name as student_name,
       p.email as student_email,
       CASE 
         WHEN sma.id IS NOT NULL THEN 'VISIBLE TO FACULTY'
         ELSE 'NOT VISIBLE TO FACULTY'
       END as visibility_status
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
LEFT JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id AND f.email = 'karan962575@gmail.com'
WHERE c.title = 'Real Certificate Upload Test';

-- 10. Show final verification
SELECT 'FINAL VERIFICATION - Faculty Dashboard Will Show' as info,
       COUNT(*) as certificates_visible_to_faculty
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com';
