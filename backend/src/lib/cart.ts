import type { Product } from "@/data/katalog";

export interface CartItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  priceUnit: string;
  quantity: number;
  image?: string;
  seller: string;
  location: string;
  stock: number;
  stockUnit: string;
}

const CART_STORAGE_KEY = "samangga_cart_items";
const CART_EVENT = "samangga_cart_change";

const EMPTY_CART: CartItem[] = [];
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;

export function notifyCartChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_EVENT));
  }
}

export function subscribeCart(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(CART_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_EVENT, callback);
  };
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedItems = EMPTY_CART;
      return EMPTY_CART;
    }
    if (raw === cachedRaw) {
      return cachedItems;
    }
    const parsed = JSON.parse(raw);
    cachedRaw = raw;
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedItems;
  } catch {
    cachedRaw = null;
    cachedItems = EMPTY_CART;
    return EMPTY_CART;
  }
}

export function getServerCartItems(): CartItem[] {
  return EMPTY_CART;
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(items);
    cachedRaw = raw;
    cachedItems = items;
    window.localStorage.setItem(CART_STORAGE_KEY, raw);
    notifyCartChange();
  } catch (err) {
    console.error("Gagal menyimpan keranjang:", err);
  }
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const current = getCartItems();
  const existingIndex = current.findIndex((item) => item.id === product.id);

  let updated: CartItem[];
  if (existingIndex >= 0) {
    updated = current.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
        : item,
    );
  } else {
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      priceUnit: product.priceUnit,
      quantity: Math.min(Math.max(1, quantity), product.stock),
      image: product.image,
      seller: product.seller,
      location: product.location,
      stock: product.stock,
      stockUnit: product.stockUnit,
    };
    updated = [newItem, ...current];
  }

  saveCartItems(updated);
  return updated;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  const current = getCartItems();
  const updated = current.map((item) =>
    item.id === productId
      ? { ...item, quantity: Math.min(quantity, item.stock) }
      : item,
  );
  saveCartItems(updated);
  return updated;
}

export function removeFromCart(productId: string): CartItem[] {
  const current = getCartItems();
  const updated = current.filter((item) => item.id !== productId);
  saveCartItems(updated);
  return updated;
}

export function clearCart(): void {
  saveCartItems([]);
}
