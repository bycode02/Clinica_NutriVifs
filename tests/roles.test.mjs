import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
// Compile application TypeScript in memory for Node's test runner.
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText, filename);
};
const { requireRole, validateUser, validateStock, validateProduct, normalizeCategory } = require("../src/utils/administracion.ts");
const user = { name: "Prueba", apellido: "Roles", email: "roles@duoc.cl", birthDate: "2000-01-01", direccion: "Prueba 123", genero: "otro", phone: "", region: "Metropolitana de Santiago", comuna: "Santiago", password: "Prueba123", role: "Cliente", failedAttempts: 0, locked: false };
test("solo administrador puede usar operaciones administrativas", () => {
  for (const role of [undefined, "Cliente", "Vendedor"]) assert.throws(() => requireRole(role, ["Administrador"]));
  assert.doesNotThrow(() => requireRole("Administrador", ["Administrador"]));
});
test("stock permite vendedor y administrador, bloquea cliente e invitado", () => {
  for (const role of ["Administrador", "Vendedor"]) assert.doesNotThrow(() => requireRole(role, ["Administrador", "Vendedor"]));
  for (const role of [undefined, "Cliente"]) assert.throws(() => requireRole(role, ["Administrador", "Vendedor"]));
});
test("categorías aceptan acentos y mayúsculas, rechazan números y símbolos", () => {
  assert.equal(normalizeCategory("  nutrición  "), "NUTRICIÓN");
  for (const value of ["ab", "abc1", "abc-", "   "]) assert.throws(() => normalizeCategory(value));
});
test("stock admite cero, rechaza negativos, fracciones y valores no finitos", () => {
  for (const value of [0, 12]) assert.doesNotThrow(() => validateStock(value));
  for (const value of [-1, 0.5, NaN, Infinity]) assert.throws(() => validateStock(value));
});
test("productos validan distribuidora, precio y pertenencia a categoría", () => {
  const product = { name: "VET 123", distributor: "DISTRIBUIDORA SUR", price: 100, stock: 0, category: "VACUNAS" };
  assert.doesNotThrow(() => validateProduct(product, ["VACUNAS"]));
  for (const patch of [{ name: "A!B" }, { distributor: "ab" }, { price: 99 }, { price: 100.5 }, { category: "OTRA" }]) assert.throws(() => validateProduct({ ...product, ...patch }, ["VACUNAS"]));
});
test("usuarios reutilizan restricciones existentes", () => {
  assert.doesNotThrow(() => validateUser(user, []));
  for (const patch of [{ email: "a@example.com" }, { password: "minuscula" }, { birthDate: "2020-01-01" }, { phone: "1234" }, { name: "" }, { region: "" }, { role: "otro" }]) assert.throws(() => validateUser({ ...user, ...patch }, []));
});
test("duplicados no distinguen mayúsculas y editar no duplica el propio usuario", () => {
  assert.throws(() => validateUser({ ...user, email: "ROLES@DUOC.CL" }, [user]));
  assert.doesNotThrow(() => validateUser(user, [user], user.email));
  assert.throws(() => validateUser({ ...user, email: "otro@duoc.cl" }, [user]));
});
