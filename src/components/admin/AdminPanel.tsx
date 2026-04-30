"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, MenuItem } from "@/types";
import {
  Plus, Trash2, LogOut, ChevronDown, ChevronRight,
  Save, Eye, EyeOff, Lock, ImageIcon, X, Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function formatPrice(price: number | null | undefined) {
  if (!price) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

// ── GİRİŞ ────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) onLogin();
    else { setError("Şifre hatalı!"); setPassword(""); }
  };

  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-brown">Admin Paneli</h1>
          <p className="text-brand-brown/50 text-sm font-body mt-1">Çakır Restaurant</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              className="admin-input w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl font-body text-brand-brown bg-gray-50 transition-all"
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/40 hover:text-brand-brown">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center font-body">{error}</p>}
          <button type="submit"
            className="w-full bg-brand-brown text-brand-yellow font-body font-bold py-3 rounded-xl hover:bg-brand-brown-light transition-colors">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

// ── FOTOĞRAF YÜKLEYİCİ ───────────────────────────────────────
// itemId verilirse fotoğraf yüklenince direkt DB'ye kaydeder (autoSave)
function ImageUploader({
  itemId,
  currentUrl,
  onUploaded,
  autoSave = false,
}: {
  itemId: string;
  currentUrl?: string | null;
  onUploaded: (url: string | null) => void;
  autoSave?: boolean;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  // currentUrl dışarıdan değişirse preview'u güncelle
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `items/${itemId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      setPreview(url);
      onUploaded(url);
      // autoSave: fotoğrafı hemen DB'ye kaydet, Kaydet butonuna gerek yok
      if (autoSave) {
        await supabase.from("menu_items").update({ image_url: url }).eq("id", itemId);
      }
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    setPreview(null);
    onUploaded(null);
    if (autoSave) {
      await supabase.from("menu_items").update({ image_url: null }).eq("id", itemId);
    }
  };

  return (
    <div className="mt-2">
      {preview ? (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-brand-yellow/30">
          <Image src={preview} alt="Yemek fotoğrafı" fill className="object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-20 border-2 border-dashed border-brand-yellow/40 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-brand-yellow hover:bg-brand-yellow/5 transition-colors text-brand-brown/40 hover:text-brand-brown/60"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-body">Fotoğraf ekle</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ── MENÜ ÖĞESİ SATIRI ───────────────────────────────────────
function MenuItemRow({
  item, hasPortions, onUpdate, onDelete, onToggle,
}: {
  item: MenuItem;
  hasPortions: boolean;
  onUpdate: (id: string, data: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [priceFull, setPriceFull] = useState(String(item.price_full || ""));
  const [priceHalf, setPriceHalf] = useState(String(item.price_half || ""));
  const [price, setPrice] = useState(String(item.price || ""));
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url || null);

  const handleSave = () => {
    const updates: Partial<MenuItem> = { name, image_url: imageUrl };
    if (hasPortions) {
      updates.price_full = Number(priceFull) || 0;
      updates.price_half = Number(priceHalf) || 0;
    } else {
      updates.price = Number(price) || 0;
    }
    onUpdate(item.id, updates);
    setEditing(false);
  };

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all
      ${item.is_available ? "border-gray-100 bg-gray-50" : "border-red-100 bg-red-50 opacity-60"}`}>
      
      <div className="p-3">
        {editing ? (
          <div className="space-y-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="admin-input w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
              placeholder="Ürün adı" />
            <div className="flex gap-2">
              {hasPortions ? (
                <>
                  <input type="number" value={priceFull} onChange={(e) => setPriceFull(e.target.value)}
                    className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                    placeholder="Tam ₺" />
                  <input type="number" value={priceHalf} onChange={(e) => setPriceHalf(e.target.value)}
                    className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                    placeholder="Yarım ₺" />
                </>
              ) : (
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                  placeholder="Fiyat ₺" />
              )}
            </div>
            <ImageUploader itemId={item.id} currentUrl={imageUrl} onUploaded={setImageUrl} autoSave={true} />
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave}
                className="flex-1 bg-brand-brown text-brand-yellow px-3 py-2 rounded-lg text-sm font-body font-bold flex items-center justify-center gap-1 hover:bg-brand-brown-light transition-colors">
                <Save className="w-3.5 h-3.5" /> Kaydet
              </button>
              <button onClick={() => setEditing(false)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-body text-brand-brown/50 hover:border-gray-300">
                İptal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Normal mod: fotoğraf doğrudan buradan yüklenip anında kaydedilir */}
            <ImageUploader itemId={item.id} currentUrl={imageUrl} onUploaded={setImageUrl} autoSave={true} />
            <div className="flex items-center gap-2">
            <button onClick={() => onToggle(item.id, item.is_available)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${item.is_available ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-400 hover:bg-red-200"}`}>
              {item.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <span className="font-body font-semibold text-sm text-brand-brown truncate block">{item.name}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasPortions ? (
                <div className="flex gap-1">
                  <span className="bg-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">{formatPrice(item.price_full)}</span>
                  <span className="bg-brand-yellow/30 border border-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">{formatPrice(item.price_half)}</span>
                </div>
              ) : (
                <span className="bg-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">{formatPrice(item.price)}</span>
              )}
              <button onClick={() => setEditing(true)}
                className="ml-1 w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center">
                <Save className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (confirm(`"${item.name}" silinecek?`)) onDelete(item.id); }}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── KATEGORİ KARTI ───────────────────────────────────────────
type CategoryWithItems = Category & { menu_items: MenuItem[] };

function CategoryCard({
  category, onDeleteCategory, onAddItem, onUpdateItem, onDeleteItem, onToggleItem,
}: {
  category: CategoryWithItems;
  onDeleteCategory: (id: string) => void;
  onAddItem: (categoryId: string, data: Partial<MenuItem>) => Promise<MenuItem | null>;
  onUpdateItem: (id: string, data: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleItem: (id: string, current: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPriceFull, setNewPriceFull] = useState("");
  const [newPriceHalf, setNewPriceHalf] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const ICONS: Record<string, string> = {
    corbalar: "🍲", yemekler: "🍽️", "durumler-doner": "🌯", tatlilar: "🍮", icecekler: "🥤",
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const data: Partial<MenuItem> = { name: newName };
    if (category.has_portions) {
      data.price_full = Number(newPriceFull) || 0;
      data.price_half = Number(newPriceHalf) || 0;
    } else {
      data.price = Number(newPrice) || 0;
    }
    if (newImageUrl) data.image_url = newImageUrl;
    const result = await onAddItem(category.id, data);
    if (result) {
      setNewName(""); setNewPriceFull(""); setNewPriceHalf("");
      setNewPrice(""); setNewItemId(null); setNewImageUrl(null);
      setShowAddForm(false);
    }
    setAdding(false);
  };

  // Fotoğraf için geçici ID oluştur
  const ensureNewItemId = () => {
    if (!newItemId) {
      const id = crypto.randomUUID();
      setNewItemId(id);
      return id;
    }
    return newItemId;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
      {/* Kategori arka plan fotoğrafı — autoSave ile anında kaydolur */}
      <div className="relative">
        <ImageUploader
          itemId={`cat-${category.id}`}
          currentUrl={category.image_url}
          onUploaded={async (url) => {
            const supabase = createClient();
            await supabase.from("categories").update({ image_url: url }).eq("id", category.id);
          }}
          autoSave={false}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-brand-brown/5 border-b border-gray-100">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 font-body font-bold text-brand-brown flex-1 text-left">
          {open ? <ChevronDown className="w-4 h-4 text-brand-brown/50" /> : <ChevronRight className="w-4 h-4 text-brand-brown/50" />}
          <span>{category.name}</span>
          <span className="ml-1 text-xs font-normal text-brand-brown/40">({category.menu_items.length})</span>
          {category.has_portions && (
            <span className="text-[10px] bg-brand-yellow/30 text-brand-brown px-2 py-0.5 rounded-full">Tam/Yarım</span>
          )}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs bg-brand-yellow text-brand-brown font-body font-bold px-3 py-1.5 rounded-lg hover:bg-brand-yellow-dark transition-colors">
            <Plus className="w-3 h-3" /> Ürün Ekle
          </button>
          <button onClick={() => { if (confirm(`"${category.name}" ve tüm ürünleri silinecek!`)) onDeleteCategory(category.id); }}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {showAddForm && (
            <div className="bg-brand-yellow/10 border-2 border-brand-yellow/30 rounded-xl p-3 space-y-2 mb-3">
              <p className="text-xs font-body font-bold text-brand-brown/60 uppercase tracking-wider">Yeni Ürün</p>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="admin-input w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                placeholder="Ürün adı *" />
              <div className="flex gap-2">
                {category.has_portions ? (
                  <>
                    <input type="number" value={newPriceFull} onChange={(e) => setNewPriceFull(e.target.value)}
                      className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                      placeholder="Tam ₺" />
                    <input type="number" value={newPriceHalf} onChange={(e) => setNewPriceHalf(e.target.value)}
                      className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                      placeholder="Yarım ₺" />
                  </>
                ) : (
                  <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                    className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                    placeholder="Fiyat ₺" />
                )}
              </div>

              {/* Fotoğraf (yeni ürün için geçici ID ile) */}
              <div>
                <p className="text-xs text-brand-brown/40 font-body mb-1">Fotoğraf (isteğe bağlı)</p>
                <ImageUploader
                  itemId={ensureNewItemId()}
                  currentUrl={newImageUrl}
                  onUploaded={setNewImageUrl}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} disabled={!newName.trim() || adding}
                  className="flex-1 bg-brand-brown text-brand-yellow px-3 py-2 rounded-lg text-sm font-body font-bold flex items-center justify-center gap-1 hover:bg-brand-brown-light transition-colors disabled:opacity-40">
                  {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {adding ? "Ekleniyor..." : "Ekle"}
                </button>
                <button onClick={() => { setShowAddForm(false); setNewName(""); setNewImageUrl(null); }}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-body text-brand-brown/50 hover:border-gray-300">
                  İptal
                </button>
              </div>
            </div>
          )}

          {category.menu_items.length === 0 ? (
            <p className="text-center text-brand-brown/30 text-sm font-body py-4">Ürün yok. Ekle butonuna tıklayın.</p>
          ) : (
            category.menu_items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                hasPortions={category.has_portions}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                onToggle={onToggleItem}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── ANA PANEL ────────────────────────────────────────────────
export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatHasPortions, setNewCatHasPortions] = useState(false);

  const supabase = createClient();

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*, menu_items(*)")
      .order("sort_order", { ascending: true })
      .order("sort_order", { foreignTable: "menu_items", ascending: true });
    setCategories((data as CategoryWithItems[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn, fetchData]);

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) showToast("Silinemedi!", "err");
    else { showToast("Kategori silindi."); fetchData(); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase()
      .replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i")
      .replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
      .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order));
    const { error } = await supabase.from("categories").insert({
      name: newCatName, slug: slug + "-" + Date.now(),
      sort_order: maxOrder + 1, has_portions: newCatHasPortions,
    });
    if (error) showToast("Eklenemedi!", "err");
    else {
      showToast("Kategori eklendi!");
      setNewCatName(""); setNewCatHasPortions(false); setShowNewCatForm(false);
      fetchData();
    }
  };

  const handleAddItem = async (categoryId: string, data: Partial<MenuItem>): Promise<MenuItem | null> => {
    const cat = categories.find((c) => c.id === categoryId);
    const maxOrder = Math.max(0, ...(cat?.menu_items || []).map((i) => i.sort_order));
    const { data: inserted, error } = await supabase
      .from("menu_items")
      .insert({ ...data, category_id: categoryId, sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) { showToast("Eklenemedi!", "err"); return null; }
    showToast("Ürün eklendi!");
    fetchData();
    return inserted as MenuItem;
  };

  const handleUpdateItem = async (id: string, data: Partial<MenuItem>) => {
    const { error } = await supabase.from("menu_items").update(data).eq("id", id);
    if (error) showToast("Kaydedilemedi!", "err");
    else { showToast("Kaydedildi ✓"); fetchData(); }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) showToast("Silinemedi!", "err");
    else { showToast("Ürün silindi."); fetchData(); }
  };

  const handleToggleItem = async (id: string, current: boolean) => {
    handleUpdateItem(id, { is_available: !current } as Partial<MenuItem>);
  };

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-brown shadow-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h1 className="font-display text-brand-yellow text-lg font-bold leading-none">Yönetim Paneli</h1>
              <p className="text-brand-yellow/50 text-[10px] font-body">Çakır Restaurant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank"
              className="text-xs text-brand-yellow/70 hover:text-brand-yellow font-body flex items-center gap-1 border border-brand-yellow/30 px-3 py-1.5 rounded-lg transition-colors">
              <Eye className="w-3 h-3" /> Siteyi Gör
            </Link>
            <button onClick={() => setIsLoggedIn(false)}
              className="text-xs text-brand-yellow/70 hover:text-brand-yellow font-body flex items-center gap-1 border border-brand-yellow/30 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut className="w-3 h-3" /> Çıkış
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-brand-yellow" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-brand-brown">Kategoriler</h2>
          <button onClick={() => setShowNewCatForm(!showNewCatForm)}
            className="flex items-center gap-2 bg-brand-brown text-brand-yellow font-body font-bold px-4 py-2 rounded-xl hover:bg-brand-brown-light transition-colors text-sm shadow-md">
            <Plus className="w-4 h-4" /> Yeni Kategori
          </button>
        </div>

        {showNewCatForm && (
          <div className="bg-white border-2 border-brand-yellow/40 rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="font-body font-bold text-brand-brown text-sm">Yeni Kategori</p>
            <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              className="admin-input w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-body text-brand-brown bg-gray-50"
              placeholder="Kategori adı (örn: Salatalar)" />
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setNewCatHasPortions(!newCatHasPortions)}
                className={`w-12 h-6 rounded-full transition-colors relative ${newCatHasPortions ? "bg-brand-brown" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${newCatHasPortions ? "left-7" : "left-1"}`} />
              </div>
              <span className="text-sm font-body text-brand-brown">Tam / Yarım porsiyon var</span>
            </label>
            <div className="flex gap-2">
              <button onClick={handleAddCategory} disabled={!newCatName.trim()}
                className="flex-1 bg-brand-brown text-brand-yellow font-body font-bold py-2.5 rounded-xl hover:bg-brand-brown-light transition-colors disabled:opacity-40">
                Ekle
              </button>
              <button onClick={() => setShowNewCatForm(false)}
                className="px-4 border-2 border-gray-200 rounded-xl font-body text-brand-brown/50 hover:border-gray-300">
                İptal
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 font-body text-brand-brown/40 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDeleteCategory={handleDeleteCategory}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onToggleItem={handleToggleItem}
            />
          ))
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl font-body font-bold text-sm z-50
          ${toast.type === "ok" ? "bg-brand-brown text-brand-yellow" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
