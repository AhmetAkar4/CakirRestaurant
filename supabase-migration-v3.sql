-- =====================================================
-- v3 MİGRASYON — SUPABASE SQL EDITOR'DA ÇALIŞTIRIN
-- =====================================================

-- 1) menu_items INSERT policy (anon key ile ekleme için)
DROP POLICY IF EXISTS "Public insert menu items" ON menu_items;
CREATE POLICY "Public insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (true);

-- 2) menu_items UPDATE policy (zaten yoksa)
DROP POLICY IF EXISTS "Public update menu items" ON menu_items;
CREATE POLICY "Public update menu items"
  ON menu_items FOR UPDATE
  USING (true);

-- 3) menu_items DELETE policy (zaten yoksa)
DROP POLICY IF EXISTS "Public delete menu items" ON menu_items;
CREATE POLICY "Public delete menu items"
  ON menu_items FOR DELETE
  USING (true);

-- 4) categories INSERT/UPDATE/DELETE policy
DROP POLICY IF EXISTS "Public insert categories" ON categories;
CREATE POLICY "Public insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update categories" ON categories;
CREATE POLICY "Public update categories"
  ON categories FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Public delete categories" ON categories;
CREATE POLICY "Public delete categories"
  ON categories FOR DELETE
  USING (true);

-- 5) Storage — anon key ile fotoğraf yükleme
DROP POLICY IF EXISTS "Anon upload menu images" ON storage.objects;
CREATE POLICY "Anon upload menu images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Anon update menu images" ON storage.objects;
CREATE POLICY "Anon update menu images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Anon delete menu images" ON storage.objects;
CREATE POLICY "Anon delete menu images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images');

-- 6) reviews tablosu (daha önce oluşturulmadıysa)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 7) menu_items image_url kolonu (daha önce eklenmemişse)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url text;

-- 8) Storage bucket (yoksa oluştur)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;
