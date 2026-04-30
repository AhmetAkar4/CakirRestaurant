import { createClient } from "@/lib/supabase/client";
import MenuClient from "@/components/menu/MenuClient";
import { CategoryWithItems } from "@/types";
import Image from "next/image";

async function getData(): Promise<CategoryWithItems[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(`
      *,
      menu_items (*)
    `)
    .order("sort_order", { ascending: true })
    .order("sort_order", { foreignTable: "menu_items", ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return (data as CategoryWithItems[]) || [];
}

export const revalidate = 60; // Her 60 saniyede bir yenile

export default async function HomePage() {
  const categories = await getData();

  return (
    <div className="min-h-screen texture-bg">
      {/* Header */}
      <header className="bg-brand-brown shadow-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Çakır Restaurant Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div>
              <p className="text-brand-yellow text-xs font-body tracking-[0.2em] uppercase opacity-80">
                Mustafa
              </p>
              <h1 className="text-brand-yellow font-display text-2xl leading-none font-bold">
                Çakır
              </h1>
              <p className="text-brand-yellow/60 text-[10px] tracking-widest uppercase font-body">
                Restaurant · Since 2002
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-brand-yellow/70 text-xs font-body italic">
              Geleneksel Lezzetler
            </p>
          </div>
        </div>
        {/* Altın bant */}
        <div className="h-1 bg-brand-yellow" />
      </header>

      {/* İçerik */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <MenuClient categories={categories} />
      </main>

      {/* Footer */}
      <footer className="bg-brand-brown mt-16">
        <div className="gold-divider" />
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-brand-yellow/60 text-sm font-body">
            © 2002 – {new Date().getFullYear()} Mustafa Çakır Restaurant
          </p>
          <p className="text-brand-yellow/40 text-xs mt-1 font-body italic">
            Geleneksel Lezzetler
          </p>
        </div>
      </footer>
    </div>
  );
}
