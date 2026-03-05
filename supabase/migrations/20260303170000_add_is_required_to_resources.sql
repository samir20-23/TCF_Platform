-- Migration to add 'is_required' to resources table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'is_required'
    ) THEN
        ALTER TABLE public.resources ADD COLUMN is_required BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
