"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { CategoryWithItems, MenuItem, Review } from "@/types";
import { Search, Star, UtensilsCrossed, X, ChevronLeft } from "lucide-react";
import Image from "next/image";

const CATEGORY_ICONS: Record<string, string> = {
  corbalar: "🍲",
  yemekler: "🍽️",
  "durumler-doner": "🌯",
  tatlilar: "🍮",
  icecekler: "🥤",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ── MENÜ KARTI ─────────────────────────────────────────────
function MenuItemCard({
  item,
  hasPortions,
  index,
}: {
  item: MenuItem;
  hasPortions: boolean;
  index: number;
}) {
  return (
    <div
      className="menu-item-enter bg-white rounded-2xl shadow-sm border border-brand-yellow/15 overflow-hidden hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {item.image_url && (
        <div className="relative w-full h-40">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-bold text-brand-brown text-base leading-tight">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-brand-brown/50 text-xs mt-0.5 font-body line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        {hasPortions ? (
          <div className="flex gap-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-[10px] text-brand-brown/50 font-body mb-0.5">Tam</div>
              <div className="bg-brand-yellow text-brand-brown font-body font-black text-sm px-3 py-1.5 rounded-xl">
                {item.price_full ? formatPrice(item.price_full) : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-brand-brown/50 font-body mb-0.5">Yarım</div>
              <div className="bg-brand-yellow/25 border border-brand-yellow text-brand-brown font-body font-bold text-sm px-3 py-1.5 rounded-xl">
                {item.price_half ? formatPrice(item.price_half) : "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <div className="bg-brand-yellow text-brand-brown font-body font-black text-base px-4 py-2 rounded-xl">
              {item.price ? formatPrice(item.price) : "—"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MENÜ SEKMESİ ─────────────────────────────────────────────
function MenuTab({ categories }: { categories: CategoryWithItems[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");
  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const availableItems = activeCategory?.menu_items.filter((i) => i.is_available) || [];

  return (
    <div>
      {/* Kategori seçici */}
      <div className="mb-5">
        <p className="text-brand-brown/40 text-[10px] font-body tracking-widest uppercase mb-3 text-center">
          Kategoriler
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`category-card snap-start flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-colors min-w-[76px]
                ${activeSlug === cat.slug
                  ? "active bg-brand-brown border-brand-brown text-brand-yellow shadow-lg"
                  : "bg-white border-brand-yellow/30 text-brand-brown hover:border-brand-yellow"
                }`}
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat.slug] || "🍴"}</span>
              <span className="text-[10px] font-body font-bold text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Başlık */}
      {activeCategory && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{CATEGORY_ICONS[activeCategory.slug] || "🍴"}</span>
            <h2 className="font-display text-2xl font-bold text-brand-brown">{activeCategory.name}</h2>
          </div>
          <div className="gold-divider w-32 ml-14" />
          {activeCategory.has_portions && (
            <p className="text-brand-brown/40 text-xs font-body mt-1.5 ml-14">* Tam ve yarım porsiyon</p>
          )}
        </div>
      )}

      {availableItems.length === 0 ? (
        <div className="text-center py-16 text-brand-brown/30 font-body">Bu kategoride ürün yok.</div>
      ) : (
        <div className="grid gap-3">
          {availableItems.map((item, i) => (
            <MenuItemCard key={item.id} item={item} hasPortions={activeCategory?.has_portions || false} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ARAMA SEKMESİ ─────────────────────────────────────────────
function SearchTab({ categories }: { categories: CategoryWithItems[] }) {
  const [query, setQuery] = useState("");

  const allItems = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.menu_items
          .filter((i) => i.is_available)
          .map((item) => ({ ...item, categoryName: cat.name, has_portions: cat.has_portions }))
      ),
    [categories]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return allItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allItems]);

  return (
    <div>
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Yemek ara..."
          autoFocus
          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-brand-yellow/30 bg-white font-body text-brand-brown text-base focus:outline-none focus:border-brand-yellow transition-colors shadow-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-brown/30 hover:text-brand-brown">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-brand-yellow/40 mx-auto mb-3" />
          <p className="text-brand-brown/40 font-body">Aramak istediğiniz yemeği yazın</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-brand-brown/40 font-body">"{query}" için sonuç bulunamadı</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((item, i) => (
            <div key={item.id}>
              <p className="text-xs text-brand-brown/40 font-body mb-1 ml-1">{item.categoryName}</p>
              <MenuItemCard item={item} hasPortions={item.has_portions} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DEĞERLENDİRME SEKMESİ ─────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hover || value) ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsTab() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setReviews((data as Review[]) || []);
        setLoading(false);
      });
  }, [supabase]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) return;
    setSubmitting(true);
    const { data } = await supabase
      .from("reviews")
      .insert({ name, rating, comment: comment || null })
      .select()
      .single();
    if (data) {
      setReviews([data as Review, ...reviews]);
      setSubmitted(true);
      setName("");
      setRating(0);
      setComment("");
    }
    setSubmitting(false);
  };

  const renderStars = (r: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < r ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}`} />
    ));

  return (
    <div className="space-y-6">
      {/* Özet */}
      {reviews.length > 0 && (
        <div className="bg-brand-brown rounded-2xl p-5 text-center">
          <p className="font-display text-5xl font-bold text-brand-yellow">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center gap-1 my-2">{renderStars(Math.round(avgRating))}</div>
          <p className="text-brand-yellow/60 text-sm font-body">{reviews.length} değerlendirme</p>
        </div>
      )}

      {/* Form */}
      {submitted ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🙏</p>
          <p className="font-body font-bold text-green-700">Değerlendirmeniz için teşekkürler!</p>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-sm text-green-600 underline font-body">
            Tekrar değerlendir
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-brand-yellow/20 p-5 space-y-4 shadow-sm">
          <h3 className="font-display text-lg font-bold text-brand-brown">Değerlendirme Yap</h3>
          <div>
            <label className="text-xs font-body text-brand-brown/50 uppercase tracking-wider mb-1.5 block">Puanınız *</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-xs font-body text-brand-brown/50 uppercase tracking-wider mb-1.5 block">Adınız *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="admin-input w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-body text-brand-brown bg-gray-50 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-body text-brand-brown/50 uppercase tracking-wider mb-1.5 block">Yorumunuz</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deneyiminizi paylaşın..."
              rows={3}
              className="admin-input w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-body text-brand-brown bg-gray-50 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || rating === 0 || submitting}
            className="w-full bg-brand-brown text-brand-yellow font-body font-bold py-3 rounded-xl hover:bg-brand-brown-light transition-colors disabled:opacity-40"
          >
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
      )}

      {/* Yorumlar */}
      {loading ? (
        <div className="text-center py-8 text-brand-brown/30 font-body">Yükleniyor...</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-body font-bold text-brand-brown text-sm">{rev.name}</p>
                  <div className="flex gap-0.5 mt-0.5">{renderStars(rev.rating)}</div>
                </div>
                <span className="text-[11px] text-brand-brown/30 font-body flex-shrink-0">
                  {new Date(rev.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
              {rev.comment && (
                <p className="text-brand-brown/60 text-sm font-body mt-2 leading-relaxed">{rev.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ANA COMPONENT ─────────────────────────────────────────────
type Tab = "menu" | "search" | "reviews";

export default function MenuClient({ categories }: { categories: CategoryWithItems[] }) {
  const [tab, setTab] = useState<Tab>("menu");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "menu", label: "Menü", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: "search", label: "Arama", icon: <Search className="w-5 h-5" /> },
    { id: "reviews", label: "Yorumlar", icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="pb-24">
      {tab === "menu" && <MenuTab categories={categories} />}
      {tab === "search" && <SearchTab categories={categories} />}
      {tab === "reviews" && <ReviewsTab />}

      {/* Alt Navigasyon */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-brand-yellow/20 shadow-2xl">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
                ${tab === t.id ? "text-brand-brown" : "text-brand-brown/30 hover:text-brand-brown/60"}`}
            >
              <div className={`transition-transform ${tab === t.id ? "scale-110" : ""}`}>
                {t.icon}
              </div>
              <span className="text-[10px] font-body font-bold tracking-wide">{t.label}</span>
              {tab === t.id && (
                <div className="absolute top-0 w-12 h-0.5 bg-brand-yellow rounded-full" style={{ left: "50%", transform: "translateX(-50%)" }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
