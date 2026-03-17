-- Run this in your Supabase SQL Editor to add the is_featured column to the blogs table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blogs' AND column_name='is_featured') THEN
        ALTER TABLE public.blogs ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;
