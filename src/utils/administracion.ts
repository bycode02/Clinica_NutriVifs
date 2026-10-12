import type { Profile, ProductoCatalogo, Role } from "../context/AppContext";
import { validarRegistro } from "./registro";
import { normalizeEmail } from "./validaciones";
export const ROLES: Role[] = ["Administrador", "Vendedor", "Cliente"];
export function requireRole(role: Role | undefined, allowed: Role[]) {
  if (!role || !allowed.includes(role)) throw new Error("No tienes permiso para realizar esta operación.");
}
export function validateUser(profile: Profile, users: Profile[], originalEmail?: string) {
  const errors = validarRegistro({ ...profile, confirmPassword: profile.password, aceptaTerminos: true });
  const error = Object.values(errors).find(Boolean);
  if (error) throw new Error(error);
  if (!ROLES.includes(profile.role || "Cliente")) throw new Error("Rol inválido.");
  if (users.some(u => u.email !== originalEmail && normalizeEmail(u.email) === normalizeEmail(profile.email))) throw new Error("Ese correo ya está registrado.");
  if (users.some(u => u.email !== originalEmail && u.password === profile.password)) throw new Error("Esa contraseña ya está en uso.");
}
export function validateStock(stock: number) {
  if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("El stock debe ser un número entero mayor o igual a cero.");
}
export function validateProduct(product: ProductoCatalogo, categories: string[]) {
  for (const value of [product.name, product.distributor || ""]) {
    if (value.trim().length < 3 || !/^[\p{L}\p{N} ]+$/u.test(value.trim())) throw new Error("Nombre y distribuidora: mínimo 3 caracteres, sin símbolos.");
  }
  if (!Number.isSafeInteger(product.price) || product.price < 100) throw new Error("El precio debe tener al menos 3 dígitos, sin símbolos ni decimales.");
  validateStock(product.stock);
  if (!categories.includes(product.category)) throw new Error("Selecciona una categoría válida.");
}
export function normalizeCategory(name: string) {
  const value = name.trim().toUpperCase();
  if (value.length < 3 || !/^[\p{L} ]+$/u.test(value)) throw new Error("Categoría: mínimo 3 letras, sin números ni símbolos.");
  return value;
}
