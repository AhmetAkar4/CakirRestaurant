"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, MenuItem } from "@/types";
import {
  Plus,
  Trash2,
  LogOut,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function formatPrice(price: number | null | undefined) {
  if (!price) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// --- GİRİŞ EKRANI ---
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
    if (res.ok) {
      onLogin();
    } else {
      setError("Şifre hatalı!");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-brand-brown flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-brown">
            Admin Paneli
          </h1>
          <p className="text-brand-brown/50 text-sm font-body mt-1">
            Çakır Restaurant
          </p>
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
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown/40 hover:text-brand-brown"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-body">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-brand-brown text-brand-yellow font-body font-bold py-3 rounded-xl hover:bg-brand-brown-light transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MENÜ ÖĞESİ SATIRI ---
function MenuItemRow({
  item,
  hasPortions,
  onUpdate,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  hasPortions: boolean;
  onUpdate: (id: string, field: string, value: string | number | boolean) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [priceFull, setPriceFull] = useState(String(item.price_full || ""));
  const [priceHalf, setPriceHalf] = useState(String(item.price_half || ""));
  const [price, setPrice] = useState(String(item.price || ""));

  const handleSave = () => {
    onUpdate(item.id, "name", name);
    if (hasPortions) {
      onUpdate(item.id, "price_full", Number(priceFull) || 0);
      onUpdate(item.id, "price_half", Number(priceHalf) || 0);
    } else {
      onUpdate(item.id, "price", Number(price) || 0);
    }
    setEditing(false);
  };

  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all ${
        item.is_available
          ? "border-gray-100 bg-gray-50"
          : "border-red-100 bg-red-50 opacity-60"
      }`}
    >
      {editing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="admin-input w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
            placeholder="Ürün adı"
          />
          <div className="flex gap-2">
            {hasPortions ? (
              <>
                <input
                  type="number"
                  value={priceFull}
                  onChange={(e) => setPriceFull(e.target.value)}
                  className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                  placeholder="Tam ₺"
                />
                <input
                  type="number"
                  value={priceHalf}
                  onChange={(e) => setPriceHalf(e.target.value)}
                  className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                  placeholder="Yarım ₺"
                />
              </>
            ) : (
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                placeholder="Fiyat ₺"
              />
            )}
            <button
              onClick={handleSave}
              className="bg-brand-brown text-brand-yellow px-4 py-2 rounded-lg text-sm font-body font-bold flex items-center gap-1 hover:bg-brand-brown-light transition-colors flex-shrink-0"
            >
              <Save className="w-3 h-3" />
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(item.id, item.is_available)}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              item.is_available
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-red-100 text-red-400 hover:bg-red-200"
            }`}
            title={item.is_available ? "Gizle" : "Göster"}
          >
            {item.is_available ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <span className="font-body font-semibold text-sm text-brand-brown truncate block">
              {item.name}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {hasPortions ? (
              <div className="flex gap-1">
                <span className="bg-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">
                  {formatPrice(item.price_full)}
                </span>
                <span className="bg-brand-yellow/30 border border-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">
                  {formatPrice(item.price_half)}
                </span>
              </div>
            ) : (
              <span className="bg-brand-yellow text-brand-brown text-xs font-bold px-2 py-1 rounded-lg font-body">
                {formatPrice(item.price)}
              </span>
            )}

            <button
              onClick={() => setEditing(true)}
              className="ml-1 w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"
              title="Düzenle"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (confirm(`"${item.name}" silinecek. Emin misiniz?`))
                  onDelete(item.id);
              }}
              className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- KATEGORİ KARTI ---
function CategoryCard({
  category,
  onDeleteCategory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleItem,
}: {
  category: Category & { menu_items: MenuItem[] };
  onDeleteCategory: (id: string) => void;
  onAddItem: (categoryId: string, data: Partial<MenuItem>) => void;
  onUpdateItem: (id: string, field: string, value: string | number | boolean) => void;
  onDeleteItem: (id: string) => void;
  onToggleItem: (id: string, current: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPriceFull, setNewPriceFull] = useState("");
  const [newPriceHalf, setNewPriceHalf] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    const data: Partial<MenuItem> = { name: newName };
    if (category.has_portions) {
      data.price_full = Number(newPriceFull) || 0;
      data.price_half = Number(newPriceHalf) || 0;
    } else {
      data.price = Number(newPrice) || 0;
    }
    onAddItem(category.id, data);
    setNewName("");
    setNewPriceFull("");
    setNewPriceHalf("");
    setNewPrice("");
    setShowAddForm(false);
  };

  const ICONS: Record<string, string> = {
    corbalar: "🍲",
    yemekler: "🍽️",
    "durumler-doner": "🌯",
    tatlilar: "🍮",
    icecekler: "🥤",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
      {/* Kategori başlığı */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-brown/5 border-b border-gray-100">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 font-body font-bold text-brand-brown flex-1 text-left"
        >
          {open ? (
            <ChevronDown className="w-4 h-4 text-brand-brown/50" />
          ) : (
            <ChevronRight className="w-4 h-4 text-brand-brown/50" />
          )}
          <span className="text-lg">{ICONS[category.slug] || "🍴"}</span>
          <span>{category.name}</span>
          <span className="ml-1 text-xs font-normal text-brand-brown/40 font-body">
            ({category.menu_items.length} ürün)
          </span>
          {category.has_portions && (
            <span className="text-[10px] bg-brand-yellow/30 text-brand-brown px-2 py-0.5 rounded-full font-body">
              Tam / Yarım
            </span>
          )}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs bg-brand-yellow text-brand-brown font-body font-bold px-3 py-1.5 rounded-lg hover:bg-brand-yellow-dark transition-colors"
          >
            <Plus className="w-3 h-3" />
            Ürün Ekle
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  `"${category.name}" kategorisi ve tüm ürünleri silinecek!`
                )
              )
                onDeleteCategory(category.id);
            }}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {/* Yeni ürün formu */}
          {showAddForm && (
            <div className="bg-brand-yellow/10 border-2 border-brand-yellow/30 rounded-xl p-3 space-y-2 mb-3">
              <p className="text-xs font-body font-bold text-brand-brown/60 uppercase tracking-wider">
                Yeni Ürün
              </p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="admin-input w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                placeholder="Ürün adı *"
              />
              <div className="flex gap-2">
                {category.has_portions ? (
                  <>
                    <input
                      type="number"
                      value={newPriceFull}
                      onChange={(e) => setNewPriceFull(e.target.value)}
                      className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                      placeholder="Tam Porsiyon ₺"
                    />
                    <input
                      type="number"
                      value={newPriceHalf}
                      onChange={(e) => setNewPriceHalf(e.target.value)}
                      className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                      placeholder="Yarım Porsiyon ₺"
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="admin-input flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-brand-brown bg-white"
                    placeholder="Fiyat ₺"
                  />
                )}
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="bg-brand-brown text-brand-yellow px-4 py-2 rounded-lg text-sm font-body font-bold flex items-center gap-1 hover:bg-brand-brown-light transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              </div>
            </div>
          )}

          {/* Ürün listesi */}
          {category.menu_items.length === 0 ? (
            <p className="text-center text-brand-brown/30 text-sm font-body py-4">
              Henüz ürün yok. Yukarıdan ekleyin.
            </p>
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

// --- ANA ADMIN PANELİ ---
type CategoryWithItems = Category & { menu_items: MenuItem[] };

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

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) showToast("Silinemedi!", "err");
    else { showToast("Kategori silindi."); fetchData(); }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = newCatName
      .toLowerCase()
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order));
    const { error } = await supabase.from("categories").insert({
      name: newCatName,
      slug: slug + "-" + Date.now(),
      sort_order: maxOrder + 1,
      has_portions: newCatHasPortions,
    });
    if (error) showToast("Eklenemedi!", "err");
    else {
      showToast("Kategori eklendi!");
      setNewCatName("");
      setNewCatHasPortions(false);
      setShowNewCatForm(false);
      fetchData();
    }
  };

  const handleAddItem = async (categoryId: string, data: Partial<MenuItem>) => {
    const cat = categories.find((c) => c.id === categoryId);
    const maxOrder = Math.max(0, ...(cat?.menu_items || []).map((i) => i.sort_order));
    const { error } = await supabase.from("menu_items").insert({
      ...data,
      category_id: categoryId,
      sort_order: maxOrder + 1,
    });
    if (error) showToast("Eklenemedi!", "err");
    else { showToast("Ürün eklendi!"); fetchData(); }
  };

  const handleUpdateItem = async (id: string, field: string, value: string | number | boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", id);
    if (error) showToast("Kaydedilemedi!", "err");
    else { showToast("Kaydedildi ✓"); fetchData(); }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) showToast("Silinemedi!", "err");
    else { showToast("Ürün silindi."); fetchData(); }
  };

  const handleToggleItem = async (id: string, current: boolean) => {
    handleUpdateItem(id, "is_available", !current);
  };

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-brand-brown shadow-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h1 className="font-display text-brand-yellow text-lg font-bold leading-none">
                Yönetim Paneli
              </h1>
              <p className="text-brand-yellow/50 text-[10px] font-body">
                Çakır Restaurant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-brand-yellow/70 hover:text-brand-yellow font-body flex items-center gap-1 border border-brand-yellow/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Eye className="w-3 h-3" />
              Siteyi Gör
            </Link>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-brand-yellow/70 hover:text-brand-yellow font-body flex items-center gap-1 border border-brand-yellow/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Çıkış
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-brand-yellow" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Yeni kategori butonu */}
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-brand-brown">
            Kategoriler
          </h2>
          <button
            onClick={() => setShowNewCatForm(!showNewCatForm)}
            className="flex items-center gap-2 bg-brand-brown text-brand-yellow font-body font-bold px-4 py-2 rounded-xl hover:bg-brand-brown-light transition-colors text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            Yeni Kategori
          </button>
        </div>

        {/* Yeni kategori formu */}
        {showNewCatForm && (
          <div className="bg-white border-2 border-brand-yellow/40 rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="font-body font-bold text-brand-brown text-sm">
              Yeni Kategori Ekle
            </p>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="admin-input w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-body text-brand-brown bg-gray-50"
              placeholder="Kategori adı (örn: Salatalar)"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setNewCatHasPortions(!newCatHasPortions)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  newCatHasPortions ? "bg-brand-brown" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    newCatHasPortions ? "left-7" : "left-1"
                  }`}
                />
              </div>
              <span className="text-sm font-body text-brand-brown">
                Tam / Yarım porsiyon seçeneği var
              </span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="flex-1 bg-brand-brown text-brand-yellow font-body font-bold py-2.5 rounded-xl hover:bg-brand-brown-light transition-colors disabled:opacity-40"
              >
                Kategori Ekle
              </button>
              <button
                onClick={() => setShowNewCatForm(false)}
                className="px-4 border-2 border-gray-200 rounded-xl font-body text-brand-brown/50 hover:border-gray-300 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Kategoriler */}
        {loading ? (
          <div className="text-center py-16 font-body text-brand-brown/40">
            Yükleniyor...
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

      {/* Toast bildirimi */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl font-body font-bold text-sm z-50 transition-all animate-bounce-once
            ${toast.type === "ok" ? "bg-brand-brown text-brand-yellow" : "bg-red-500 text-white"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
