-- ============================================
-- Wedding Media PWA — Supabase Setup
-- ============================================
-- Run this SQL in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- 1. Create the media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('reception', 'ceremony', 'party', 'after_wedding')),
  guest_name TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_path TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden')),
  size_bytes BIGINT,
  original_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Public can read only approved media
CREATE POLICY "Public read approved media"
  ON media
  FOR SELECT
  USING (status = 'approved');

-- Public can insert new media (uploads)
CREATE POLICY "Allow public insert"
  ON media
  FOR INSERT
  WITH CHECK (true);

-- No public UPDATE or DELETE policies.
-- Admin operations use the service_role key which bypasses RLS.

-- 4. Create indexes for performance
CREATE INDEX idx_media_status ON media (status);
CREATE INDEX idx_media_stage ON media (stage);
CREATE INDEX idx_media_created_at ON media (created_at);

-- ============================================
-- Storage Bucket Setup
-- ============================================
-- NOTE: It's easier to create the bucket via the Supabase Dashboard:
-- Storage > New Bucket > Name: "wedding-media" > Public: ON
--
-- If you prefer SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-media', 'wedding-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow anyone to upload files
CREATE POLICY "Allow public upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'wedding-media');

-- Allow anyone to read files
CREATE POLICY "Allow public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wedding-media');

-- Allow service_role to delete files (admin)
-- (service_role bypasses RLS, so this is implicit, but adding for clarity)
CREATE POLICY "Allow service role delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'wedding-media');
