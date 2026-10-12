import { createContext, useContext } from "react";
import type { MiembroEquipo } from "../data/equipo";
import type { Producto } from "../data/productos";

export type Role = "Administrador" | "Vendedor" | "Cliente";

export type CartItem = {
  code: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type Profile = {
  name: string;
  apellido: string;
  email: string;
  birthDate: string;
  direccion: string;
  genero: string;
  phone: string;
  region: string;
  comuna: string;
  password: string;
  failedAttempts: number;
  locked: boolean;
  role?: Role;
};

export type Session = {
  name: string;
  apellido: string;
  email: string;
  birthDate: string;
  phone: string;
  role?: Role;
};

export type ProductoCatalogo = Producto & { description?: string; distributor?: string };

export type AppState = {
  products: ProductoCatalogo[];
  team: MiembroEquipo[];
  cart: CartItem[];
  cartQuantity: number;
  cartTotal: number;
  getQuantity: (code: string) => number;
  getStock: (code: string) => number;
  addToCart: (code: string) => boolean;
  changeQuantity: (code: string, amount: number) => void;
  removeFromCart: (code: string) => void;
  clearCart: () => void;
  profiles: Profile[];
  register: (profile: Profile) => void;
  authenticate: (email: string, password: string, role: Role) => void;
  manageUser: (profile: Profile, originalEmail?: string) => void;
  deleteUser: (email: string) => void;
  categories: string[];
  saveProduct: (product: ProductoCatalogo) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, stock: number) => void;
  saveCategory: (name: string, previous?: string) => void;
  deleteCategory: (name: string) => void;
  session: Session | null;
  logout: () => void;
};

export const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return context;
}
