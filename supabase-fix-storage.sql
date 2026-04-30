-- =====================================================
-- FOTOĞRAF YÜKLEMEYİ DÜZELT — SQL EDITOR'DA ÇALIŞTIRIN
-- =====================================================

-- Storage bucket public yap (en önemli adım)
UPDATE storage.buckets SET public = true WHERE id = 'menu-images';

-- Eski politikaları temizle
DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anon update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Anon delete menu images" ON storage.objects;

-- Herkes okuyabilsin
CREATE POLICY "Allow public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

-- Herkes yükleyebilsin (anon dahil)
CREATE POLICY "Allow public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-images');

-- Herkes güncelleyebilsin
CREATE POLICY "Allow public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-images');

-- Herkes silebilsin
CREATE POLICY "Allow public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images');

-- menu_items için de tüm işlemlere izin ver
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select menu items" ON menu_items;
DROP POLICY IF EXISTS "Public insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Public update menu items" ON menu_items;
DROP POLICY IF EXISTS "Public delete menu items" ON menu_items;

CREATE POLICY "Allow all menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

-- categories için de
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select categories" ON categories;
DROP POLICY IF EXISTS "Public insert categories" ON categories;
DROP POLICY IF EXISTS "Public update categories" ON categories;
DROP POLICY IF EXISTS "Public delete categories" ON categories;

CREATE POLICY "Allow all categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Kategorilere image_url kolonu ekle
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
