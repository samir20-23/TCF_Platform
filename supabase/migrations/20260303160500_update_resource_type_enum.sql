-- Migration to add 'document' to resource_type enum
DO $$
BEGIN
    -- Check if 'document' exists in the resource_type enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'resource_type' AND e.enumlabel = 'document'
    ) THEN
        ALTER TYPE public.resource_type ADD VALUE 'document';
    END IF;
END $$;
