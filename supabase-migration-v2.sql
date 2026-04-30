-- =====================================================
-- GÜNCELLEMELERİ SUPABASE SQL EDITOR'DA ÇALIŞTIRIN
-- =====================================================

-- 1) menu_items tablosuna image_url kolonu ekle
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url text;

-- 2) Değerlendirmeler tablosu
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 3) Storage bucket oluştur (menu-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4) Storage policy - herkes okuyabilsin
CREATE POLICY "Public read menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- 5) Storage policy - servis rolü yükleyebilsin
CREATE POLICY "Service role upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Service role delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images');
