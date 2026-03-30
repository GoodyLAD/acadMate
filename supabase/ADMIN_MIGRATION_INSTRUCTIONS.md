# Admin Portal Migration Instructions

## Problem
The AdminAssignments page is showing empty content because the required database tables (`faculty` and `student_mentor_assignments`) don't exist in the database.

## Solution
Apply the admin tables migration to create the missing tables and sample data.

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Click **New Query**
4. Copy the contents of `supabase/apply_admin_tables.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI (If Available)
```bash
# If you have Supabase CLI installed
supabase db push
```

## What the Migration Creates

### Tables
- **`faculty`**: Stores faculty member information
- **`student_mentor_assignments`**: Links students with their assigned mentors

### Sample Data
- 4 sample faculty members (2 verified, 2 pending verification)
- Proper indexes for performance
- Row Level Security (RLS) policies for admin access

### Features
- Automatic timestamp updates
- Proper foreign key relationships
- Admin-only access policies
- Storage bucket for faculty documents

## Verification
After applying the migration:
1. Go to the Admin Debug page (`/admin-debug`)
2. Click "Test Database Connection"
3. Verify that all tables show as "Exists"
4. Check the AdminAssignments page (`/admin`) - it should now show content

## Troubleshooting
- If you get permission errors, make sure you're logged in as an admin user
- If tables still don't exist, check the Supabase logs for any SQL errors
- The migration is idempotent - it's safe to run multiple times
