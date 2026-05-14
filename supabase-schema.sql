-- ============================================
-- OttoBob.ai — Phase 1 & 2 Database Schema
-- Run this ENTIRE script in Supabase SQL Editor
-- Project: OttoBob.ai (Otto University)
-- Date: May 2026
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: students
-- ============================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    major TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'contacted', 'interviewing', 'approved', 'active', 'rejected')),
    next_follow_up_date DATE,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure photo_url column exists if table was already created
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Indexes for students
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_follow_up ON public.students(next_follow_up_date);

-- ============================================
-- TABLE 2: activity_logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('imessage', 'manual', 'system')),
    author TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for chronological ordering per student
CREATE INDEX IF NOT EXISTS idx_activity_logs_lead_timestamp
    ON public.activity_logs(student_id, timestamp DESC);

-- ============================================
-- GRANTS — Secure access (Authenticated ONLY)
-- ============================================
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.activity_logs FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.activity_logs TO authenticated;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Allow all for anon on students" ON public.students;
DROP POLICY IF EXISTS "Allow all for anon on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow all for authenticated on students" ON public.students;
DROP POLICY IF EXISTS "Allow all for authenticated on activity_logs" ON public.activity_logs;

-- Secure Phase: Heavily Guarded - Only authenticated users can perform operations
CREATE POLICY "Allow all for authenticated on students" ON public.students
    FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated on activity_logs" ON public.activity_logs
    FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');



-- ============================================
-- AUTO-UPDATE TRIGGER for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_students_updated_at ON public.students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE — Phase 2 database schema is ready
-- ============================================

-- ============================================
-- STORAGE: avatars
-- ============================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for avatars bucket
-- 1. Allow public read access
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars');

-- 3. Allow authenticated users to update/delete their uploads
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatars" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars');
