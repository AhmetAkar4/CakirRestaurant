export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  has_portions: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price_full?: number | null;
  price_half?: number | null;
  price?: number | null;
  is_available: boolean;
  sort_order: number;
  image_url?: string | null;
  created_at: string;
}

export interface CategoryWithItems extends Category {
  menu_items: MenuItem[];
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment?: string;
  created_at: string;
}
