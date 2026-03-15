-- Migration: Add custom_css and custom_html columns to blogs table
-- Run this in Supabase SQL Editor

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS custom_html TEXT DEFAULT '';
