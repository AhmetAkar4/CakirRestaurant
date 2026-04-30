-- Çakır Restaurant Veritabanı Şeması
-- Supabase SQL Editor'da bu kodu çalıştırın

-- Kategoriler tablosu
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0,
  has_portions boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Menü öğeleri tablosu
CREATE TABLE menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_full numeric(10,2),
  price_half numeric(10,2),
  price numeric(10,2),
  is_available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security - herkese okuma izni
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);

-- Servis rolü için tam yetki (admin panel kullanır)
CREATE POLICY "Service role full access categories" ON categories 
  USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access menu_items" ON menu_items 
  USING (auth.role() = 'service_role');

-- Başlangıç kategorileri
INSERT INTO categories (name, slug, sort_order, has_portions) VALUES
  ('Çorbalar', 'corbalar', 1, true),
  ('Yemekler', 'yemekler', 2, true),
  ('Katık Dürümler ve Döner', 'durumler-doner', 3, false),
  ('Tatlılar', 'tatlilar', 4, false),
  ('İçecekler', 'icecekler', 5, false);

-- Örnek menü öğeleri
INSERT INTO menu_items (category_id, name, price_full, price_half, price, sort_order) VALUES
  -- Çorbalar
  ((SELECT id FROM categories WHERE slug='corbalar'), 'Mercimek Çorbası', 60, 40, NULL, 1),
  ((SELECT id FROM categories WHERE slug='corbalar'), 'Ezogelin Çorbası', 60, 40, NULL, 2),
  ((SELECT id FROM categories WHERE slug='corbalar'), 'Domates Çorbası', 65, 45, NULL, 3),
  -- Yemekler
  ((SELECT id FROM categories WHERE slug='yemekler'), 'Kuru Fasulye', 120, 75, NULL, 1),
  ((SELECT id FROM categories WHERE slug='yemekler'), 'Etli Nohut', 130, 80, NULL, 2),
  ((SELECT id FROM categories WHERE slug='yemekler'), 'İmam Bayıldı', 110, 70, NULL, 3),
  -- Dürümler
  ((SELECT id FROM categories WHERE slug='durumler-doner'), 'Tavuk Dürüm', NULL, NULL, 150, 1),
  ((SELECT id FROM categories WHERE slug='durumler-doner'), 'Et Döner Dürüm', NULL, NULL, 180, 2),
  ((SELECT id FROM categories WHERE slug='durumler-doner'), 'Karışık Dürüm', NULL, NULL, 200, 3),
  -- Tatlılar
  ((SELECT id FROM categories WHERE slug='tatlilar'), 'Sütlaç', NULL, NULL, 80, 1),
  ((SELECT id FROM categories WHERE slug='tatlilar'), 'Kazandibi', NULL, NULL, 90, 2),
  ((SELECT id FROM categories WHERE slug='tatlilar'), 'Baklava', NULL, NULL, 120, 3),
  -- İçecekler
  ((SELECT id FROM categories WHERE slug='icecekler'), 'Ayran', NULL, NULL, 30, 1),
  ((SELECT id FROM categories WHERE slug='icecekler'), 'Su', NULL, NULL, 15, 2),
  ((SELECT id FROM categories WHERE slug='icecekler'), 'Meşrubat', NULL, NULL, 40, 3);
