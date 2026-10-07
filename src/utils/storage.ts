export const STORAGE_KEYS = {
  CART: "carrito",
  LEGACY_CART: "clinica-nutridifs-cart",
  PROFILES: "clinica-nutridifs-profiles",
  SESSION: "clinica-nutridifs-session",
  ADMIN_PRODUCTS: "admin-products",
  ADMIN_USERS: "admin-users",
} as const;

export function loadList<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function loadObject<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function remove(key: string) {
  localStorage.removeItem(key);
}
