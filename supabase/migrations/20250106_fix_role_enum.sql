-- Fix role enum type issue
-- First, let's check what the user_role enum contains

-- Check the current enum values
SELECT unnest(enum_range(NULL::user_role)) as role_values;

-- If the enum doesn't exist or doesn't have the right values, create/update it
DO $$ 
BEGIN
    -- Check if user_role enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the enum if it doesn't exist
        CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
    ELSE
        -- Add missing values if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'student' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'student';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'faculty' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'faculty';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'admin';
        END IF;
    END IF;
END $$;

-- Now show the available enum values
SELECT unnest(enum_range(NULL::user_role)) as available_roles;
