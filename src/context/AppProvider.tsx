import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { EQUIPO_INICIAL, type MiembroEquipo } from "../data/equipo";
import { PRODUCTOS, imagenProducto } from "../data/productos";
import { STORAGE_KEYS, loadList, loadObject, remove, save } from "../utils/storage";
import {
  AppContext,
  type AppState,
  type CartItem,
  type Profile,
  type ProductoCatalogo,
  type Session,
} from "./AppContext";

type AdminProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

// Deja sembrados el catálogo y el equipo la primera vez (igual que
// initializeAdminModule() del sitio anterior).
function seedStorage() {
  if (loadList(STORAGE_KEYS.ADMIN_PRODUCTS).length === 0) {
    save(
      STORAGE_KEYS.ADMIN_PRODUCTS,
      PRODUCTOS.map(({ id, name, category, price, stock }) => ({
        id,
        name,
        category,
        price,
        stock,
      })),
    );
  }
  if (loadList(STORAGE_KEYS.ADMIN_USERS).length === 0) {
    save(STORAGE_KEYS.ADMIN_USERS, EQUIPO_INICIAL);
  }
}

// Combina el catálogo base con los datos administrados en localStorage.
function loadProducts(): ProductoCatalogo[] {
  const stored = loadList<AdminProduct>(STORAGE_KEYS.ADMIN_PRODUCTS);
  const known = new Set(PRODUCTOS.map((product) => product.id));

  const merged: ProductoCatalogo[] = PRODUCTOS.map((product) => {
    const admin = stored.find((item) => item.id === product.id);
    return admin
      ? {
          ...product,
          name: admin.name,
          category: admin.category,
          price: Number(admin.price),
          stock: Number(admin.stock),
        }
      : product;
  });

  const extra: ProductoCatalogo[] = stored
    .filter((item) => !known.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      stock: Number(item.stock),
      image: "",
      principio: "",
      especie: "",
      description: "Producto veterinario administrado desde el catálogo de la clínica.",
    }));

  return [...merged, ...extra];
}

function loadCart(): CartItem[] {
  const saved =
    loadObject<unknown>(STORAGE_KEYS.CART) ??
    loadObject<unknown>(STORAGE_KEYS.LEGACY_CART);
  if (!Array.isArray(saved)) return [];

  return saved
    .filter((item) => item && Number(item.quantity) > 0)
    .map((item) => ({
      code: String(item.code || item.id || ""),
      name: item.name || "Producto",
      price: Number(item.price) || 0,
      image: item.image || "",
      quantity: Number(item.quantity) || 1,
    }))
    .filter((item) => item.code);
}

function loadSession(): Session | null {
  const session = loadObject<Session>(STORAGE_KEYS.SESSION);
  return session?.email ? session : null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [products] = useState<ProductoCatalogo[]>(() => {
    seedStorage();
    return loadProducts();
  });
  const [team] = useState<MiembroEquipo[]>(() =>
    loadList<MiembroEquipo>(STORAGE_KEYS.ADMIN_USERS).filter(
      (user) => user.status !== "Inactivo",
    ),
  );
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    loadList<Profile>(STORAGE_KEYS.PROFILES),
  );
  const [session, setSession] = useState<Session | null>(loadSession);

  useEffect(() => {
    save(STORAGE_KEYS.CART, cart);
  }, [cart]);

  const getStock = useCallback(
    (code: string) =>
      Number(products.find((product) => product.id === code)?.stock ?? 0),
    [products],
  );

  const getQuantity = useCallback(
    (code: string) => cart.find((item) => item.code === code)?.quantity ?? 0,
    [cart],
  );

  const addToCart = useCallback(
    (code: string) => {
      const product = products.find((item) => item.id === code);
      if (!product) return false;
      if (getQuantity(code) >= product.stock) return false;

      setCart((current) => {
        const existing = current.find((item) => item.code === code);
        if (existing) {
          return current.map((item) =>
            item.code === code ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [
          ...current,
          {
            code,
            name: product.name,
            price: product.price,
            image: imagenProducto(product.image),
            quantity: 1,
          },
        ];
      });
      return true;
    },
    [products, getQuantity],
  );

  const changeQuantity = useCallback(
    (code: string, amount: number) => {
      setCart((current) => {
        const item = current.find((entry) => entry.code === code);
        if (!item) return current;

        const stock = getStock(code);
        if (amount > 0 && stock > 0 && item.quantity >= stock) return current;

        const quantity = item.quantity + amount;
        if (quantity <= 0) return current.filter((entry) => entry.code !== code);
        return current.map((entry) =>
          entry.code === code ? { ...entry, quantity } : entry,
        );
      });
    },
    [getStock],
  );

  const removeFromCart = useCallback((code: string) => {
    setCart((current) => current.filter((item) => item.code !== code));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const saveProfiles = useCallback((list: Profile[]) => {
    setProfiles(list);
    save(STORAGE_KEYS.PROFILES, list);
  }, []);

  const startSession = useCallback((profile: Profile) => {
    const next: Session = {
      name: profile.name,
      apellido: profile.apellido || "",
      email: profile.email,
      birthDate: profile.birthDate || "",
      phone: profile.phone || "",
      role: profile.role,
    };
    setSession(next);
    save(STORAGE_KEYS.SESSION, next);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    remove(STORAGE_KEYS.SESSION);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      products,
      team,
      cart,
      cartQuantity: cart.reduce((total, item) => total + item.quantity, 0),
      cartTotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      getQuantity,
      getStock,
      addToCart,
      changeQuantity,
      removeFromCart,
      clearCart,
      profiles,
      saveProfiles,
      session,
      startSession,
      logout,
    }),
    [
      products,
      team,
      cart,
      getQuantity,
      getStock,
      addToCart,
      changeQuantity,
      removeFromCart,
      clearCart,
      profiles,
      saveProfiles,
      session,
      startSession,
      logout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
