# 🍽️ Çakır Restaurant Web Sitesi

## Kurulum Adımları

### 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) adresine gidin ve ücretsiz hesap açın
2. **"New Project"** butonuna tıklayın
3. Projeniz oluşturulduktan sonra sol menüden **"SQL Editor"** açın
4. Bu repo'daki **`supabase-schema.sql`** dosyasının içeriğini kopyalayıp SQL Editor'a yapıştırın
5. **"Run"** butonuna basın — tablolar ve örnek veriler oluşacak

### 2. Supabase API Anahtarlarını Alın

1. Supabase panelinizde sol menüden **Settings → API** gidin
2. Şu değerleri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** anahtarı → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** anahtarı → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Vercel'e Deploy

1. Bu projeyi GitHub'a yükleyin (ya da zip olarak Vercel'e sürükleyin)
2. [vercel.com](https://vercel.com) → **"New Project"** → reponuzu seçin
3. **Environment Variables** bölümüne şu değişkenleri girin:

```
NEXT_PUBLIC_SUPABASE_URL     = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...
SUPABASE_SERVICE_ROLE_KEY    = eyJxxx...
ADMIN_PASSWORD               = kendi-şifrenizi-yazın
```

4. **"Deploy"** butonuna basın — birkaç dakikada site yayında!

### 4. Local Development (İsteğe bağlı)

```bash
# Bağımlılıkları yükle
npm install

# .env.local dosyasını oluştur
cp .env.local.example .env.local
# Sonra .env.local dosyasını açıp değerleri doldurun

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` açın.

---

## Sayfa Adresleri

| Adres | Açıklama |
|-------|----------|
| `/` | Müşteri menü sayfası |
| `/admin` | Yönetim paneli |

---

## Admin Paneli Kullanımı

- `/admin` adresine gidin
- `.env.local` dosyasında belirlediğiniz `ADMIN_PASSWORD` şifresini girin
- **Kategori ekle/sil**, **ürün ekle/sil/güncelle**, **fiyat değiştir**
- Göz ikonuyla ürünleri geçici olarak gizleyebilirsiniz

---

## Teknolojiler

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL veritabanı)
- **TypeScript**
