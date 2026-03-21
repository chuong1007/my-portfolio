-- =============================================
-- Analytics Tracking Tables
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- 1. Visitors table: unique visitors by anonymous hash
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash TEXT UNIQUE NOT NULL,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  device TEXT DEFAULT 'unknown',
  browser TEXT DEFAULT 'unknown',
  country TEXT DEFAULT 'unknown'
);

-- 2. Page views table: each individual page view
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);

-- RLS: Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: anon can INSERT (for tracking)
CREATE POLICY "anon_insert_visitors" ON visitors
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_insert_page_views" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: anon can UPDATE visitors (for last_seen upsert)
CREATE POLICY "anon_update_visitors" ON visitors
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Policy: authenticated can SELECT (for admin dashboard)
CREATE POLICY "auth_select_visitors" ON visitors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_select_page_views" ON page_views
  FOR SELECT TO authenticated USING (true);

-- Policy: anon can SELECT visitors (needed for upsert check)
CREATE POLICY "anon_select_visitors" ON visitors
  FOR SELECT TO anon USING (true);
