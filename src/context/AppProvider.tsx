import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EQUIPO_INICIAL, type MiembroEquipo } from "../data/equipo";
import { PRODUCTOS, CATEGORIAS, imagenProducto } from "../data/productos";
import { STORAGE_KEYS, loadList, loadObject, remove, save } from "../utils/storage";
import { normalizeEmail } from "../utils/validaciones";
import { requireRole, validateUser, validateProduct, validateStock, normalizeCategory, ROLES } from "../utils/administracion";
import { AppContext, type AppState, type CartItem, type Profile, type ProductoCatalogo, type Session, type Role } from "./AppContext";

const CATEGORY_KEY = "clinica-nutridifs-categories";
function loadProducts(): ProductoCatalogo[] {
  const stored = loadObject<ProductoCatalogo[]>(STORAGE_KEYS.ADMIN_PRODUCTS);
  const source: ProductoCatalogo[] = Array.isArray(stored) ? stored : PRODUCTOS;
  return source.map(item => {
    const base = PRODUCTOS.find(p => p.id === item.id);
    return { ...base, ...item, image: item.image || base?.image || "", principio: item.principio || base?.principio || "", especie: item.especie || base?.especie || "",
      category: item.category.toUpperCase(), distributor: item.distributor || "Distribuidora VetSur" };
  });
}
function loadProfiles() {
  return loadList<Profile>(STORAGE_KEYS.PROFILES).map(profile => ({ ...profile, role: ROLES.includes(profile.role as Role) ? profile.role : "Cliente" as Role }));
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductoCatalogo[]>(loadProducts);
  const [categories, setCategories] = useState<string[]>(() => loadObject<string[]>(CATEGORY_KEY) ?? [...new Set([...CATEGORIAS, ...loadProducts().map(p => p.category)].map(c => c.toUpperCase()))]);
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [session, setSession] = useState<Session | null>(() => {
    const stored = loadObject<Session>(STORAGE_KEYS.SESSION);
    const account = loadProfiles().find(p => p.email === stored?.email && !p.locked);
    return account ? { ...account, role: stored?.role || account.role || "Cliente" } : null;
  });
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [team] = useState(() => (loadObject<MiembroEquipo[]>(STORAGE_KEYS.ADMIN_USERS) ?? EQUIPO_INICIAL).filter(user => user.status !== "Inactivo"));
  useEffect(() => { save(STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { save(STORAGE_KEYS.ADMIN_PRODUCTS, products); }, [products]);
  useEffect(() => { save(CATEGORY_KEY, categories); }, [categories]);
  const saveProfiles = (list: Profile[]) => { save(STORAGE_KEYS.PROFILES, list); setProfiles(list); };
  const startSession = (profile: Profile, role = profile.role || "Cliente") => {
    const next: Session = { name: profile.name, apellido: profile.apellido, email: profile.email, birthDate: profile.birthDate, phone: profile.phone, role };
    save(STORAGE_KEYS.SESSION, next); setSession(next);
  };
  const logout = () => { setSession(null); remove(STORAGE_KEYS.SESSION); };
  const register = (profile: Profile) => {
    const next = { ...profile, email: normalizeEmail(profile.email), role: "Cliente" as Role, failedAttempts: 0, locked: false };
    validateUser(next, profiles);
    saveProfiles([...profiles, next]); startSession(next);
  };
  const authenticate = (email: string, password: string, role: Role) => {
    const profile = profiles.find(p => p.email === normalizeEmail(email));
    if (!profile) throw new Error("No existe una cuenta registrada con este correo.");
    if (profile.locked) throw new Error("Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte.");
    if (profile.password !== password) {
      const failedAttempts = (profile.failedAttempts || 0) + 1;
      saveProfiles(profiles.map(p => p === profile ? { ...p, failedAttempts, locked: failedAttempts >= 3 } : p));
      throw new Error(failedAttempts >= 3 ? "Cuenta bloqueada por 3 intentos fallidos." : "La contraseña no coincide con esta cuenta.");
    }
    if (!ROLES.includes(role)) throw new Error("Selecciona un rol válido.");
    saveProfiles(profiles.map(p => p === profile ? { ...p, failedAttempts: 0 } : p));
    // Modo demostración solicitado: el usuario elige el rol de esta sesión.
    // En producción el servidor debe asignar y comprobar el rol de la cuenta.
    startSession(profile, role);
  };
  const manageUser = (profile: Profile, originalEmail?: string) => {
    requireRole(session?.role, ["Administrador"]);
    const next = { ...profile, email: normalizeEmail(profile.email), role: profile.role || "Cliente" as Role };
    if (originalEmail && !profiles.some(p => p.email === originalEmail)) throw new Error("El usuario ya no existe.");
    validateUser(next, profiles, originalEmail);
    saveProfiles(originalEmail ? profiles.map(p => p.email === originalEmail ? next : p) : [...profiles, next]);
    if (originalEmail === session?.email) startSession(next);
  };
  const deleteUser = (email: string) => {
    requireRole(session?.role, ["Administrador"]);
    saveProfiles(profiles.filter(p => p.email !== email));
    if (email === session?.email) logout();
  };
  const commitProducts = (next: ProductoCatalogo[]) => {
    setProducts(next);
    save(STORAGE_KEYS.ADMIN_PRODUCTS, next);
    setCart(current => current.flatMap(item => {
      const product = next.find(p => p.id === item.code);
      return product && product.stock > 0 ? [{ ...item, name: product.name, price: product.price, quantity: Math.min(item.quantity, product.stock) }] : [];
    }));
  };
  const saveProduct = (product: ProductoCatalogo) => {
    requireRole(session?.role, ["Administrador", "Vendedor"]);
    validateProduct(product, categories);
    const next = { ...product, name: product.name.trim(), distributor: product.distributor?.trim() };
    commitProducts(products.some(p => p.id === product.id) ? products.map(p => p.id === product.id ? next : p) : [...products, next]);
  };
  const deleteProduct = (id: string) => {
    requireRole(session?.role, ["Administrador"]);
    commitProducts(products.filter(p => p.id !== id));
  };
  const updateStock = (id: string, stock: number) => {
    requireRole(session?.role, ["Administrador", "Vendedor"]);
    validateStock(stock);
    if (!products.some(p => p.id === id)) throw new Error("El producto ya no existe.");
    commitProducts(products.map(p => p.id === id ? { ...p, stock } : p));
  };
  const saveCategory = (name: string, previous?: string) => {
    requireRole(session?.role, ["Administrador"]);
    const next = normalizeCategory(name);
    if (categories.some(c => c === next && c !== previous)) throw new Error("La categoría ya existe.");
    if (previous && !categories.includes(previous)) throw new Error("La categoría ya no existe.");
    setCategories(previous ? categories.map(c => c === previous ? next : c) : [...categories, next]);
    if (previous) commitProducts(products.map(p => p.category === previous ? { ...p, category: next } : p));
  };
  const deleteCategory = (name: string) => {
    requireRole(session?.role, ["Administrador"]);
    setCategories(categories.filter(c => c !== name));
    commitProducts(products.map(p => p.category === name ? { ...p, category: "" } : p));
  };
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
        if (amount > 0 && item.quantity >= stock) return current;

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

  const value: AppState = { products, categories, team, cart, cartQuantity: cart.reduce((n, p) => n + p.quantity, 0), cartTotal: cart.reduce((n, p) => n + p.price * p.quantity, 0), getQuantity, getStock, addToCart, changeQuantity, removeFromCart, clearCart, profiles, session, register, authenticate, manageUser, deleteUser, saveProduct, deleteProduct, updateStock, saveCategory, deleteCategory, logout };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
