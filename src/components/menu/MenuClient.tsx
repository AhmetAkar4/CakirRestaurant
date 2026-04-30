"use client";

import { useState } from "react";
import { CategoryWithItems, MenuItem } from "@/types";

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
      className="menu-item-enter bg-white rounded-2xl border border-brand-yellow/20 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-bold text-brand-brown text-base leading-tight truncate">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-brand-brown/50 text-xs mt-0.5 font-body line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        {hasPortions ? (
          <div className="flex gap-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-[10px] text-brand-brown/50 font-body mb-0.5">
                Tam
              </div>
              <div className="bg-brand-yellow text-brand-brown font-body font-black text-sm px-3 py-1.5 rounded-xl">
                {item.price_full ? formatPrice(item.price_full) : "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-brand-brown/50 font-body mb-0.5">
                Yarım
              </div>
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

export default function MenuClient({
  categories,
}: {
  categories: CategoryWithItems[];
}) {
  const [activeSlug, setActiveSlug] = useState<string>(
    categories[0]?.slug || ""
  );

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const availableItems =
    activeCategory?.menu_items.filter((item) => item.is_available) || [];

  return (
    <div>
      {/* Kategori seçici */}
      <div className="mb-6">
        <p className="text-brand-brown/50 text-xs font-body tracking-widest uppercase mb-3 text-center">
          Kategoriler
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`category-card snap-start flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-colors duration-200 min-w-[80px]
                ${
                  activeSlug === cat.slug
                    ? "active bg-brand-brown border-brand-brown text-brand-yellow shadow-lg"
                    : "bg-white border-brand-yellow/30 text-brand-brown hover:border-brand-yellow hover:bg-brand-yellow/10"
                }`}
            >
              <span className="text-2xl">
                {CATEGORY_ICONS[cat.slug] || "🍴"}
              </span>
              <span className="text-[11px] font-body font-bold text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Aktif kategori başlığı */}
      {activeCategory && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{CATEGORY_ICONS[activeCategory.slug] || "🍴"}</span>
            <h2 className="font-display text-2xl font-bold text-brand-brown">
              {activeCategory.name}
            </h2>
          </div>
          <div className="gold-divider w-32 ml-14" />
          {activeCategory.has_portions && (
            <p className="text-brand-brown/50 text-xs font-body mt-2 ml-14">
              * Tam ve yarım porsiyon seçenekleri mevcuttur
            </p>
          )}
        </div>
      )}

      {/* Menü öğeleri */}
      {availableItems.length === 0 ? (
        <div className="text-center py-16 text-brand-brown/40 font-body">
          Bu kategoride henüz ürün bulunmuyor.
        </div>
      ) : (
        <div className="grid gap-3">
          {availableItems.map((item, index) => (
            <MenuItemCard
              key={item.id}
              item={item}
              hasPortions={activeCategory?.has_portions || false}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
