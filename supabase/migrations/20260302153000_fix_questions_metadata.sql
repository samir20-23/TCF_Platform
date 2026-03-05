-- Migration: Fix Questions Table Metadata
-- Adds the missing metadata column to questions table

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
