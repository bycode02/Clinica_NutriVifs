import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
// Compile application TypeScript in memory for Node's test runner.
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
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

Module._extensions[".tsx"] = Module._extensions[".ts"];
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { AppProvider } = require("../src/context/AppProvider.tsx");
const { useApp } = require("../src/context/AppContext.ts");
const { matchesProductName } = require("../src/utils/productSearch.ts");
test("vendedor crea y edita productos y stock, pero no administra usuarios ni elimina productos", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } });
  try {
    storage.set("clinica-nutridifs-profiles", JSON.stringify([user]));
    storage.set("clinica-nutridifs-session", JSON.stringify({ ...user, role: "Vendedor" }));
    let app;
    function Probe() { app = useApp(); return null; }
    const refresh = () => renderToStaticMarkup(createElement(AppProvider, null, createElement(Probe)));
    refresh();
    const product = { ...app.products[0], id: "prueba-vendedor", name: "Producto nuevo", distributor: "VetSur", price: 1000, stock: 2 };
    app.saveProduct(product);
    refresh();
    assert.equal(app.products.find(p => p.id === product.id).name, "Producto nuevo");
    app.saveProduct({ ...product, name: "Producto editado", price: 2000 });
    refresh();
    assert.equal(app.products.find(p => p.id === product.id).price, 2000);
    app.updateStock(product.id, 7);
    refresh();
    assert.equal(app.products.find(p => p.id === product.id).stock, 7);
    assert.throws(() => app.manageUser(user), /permiso/);
    assert.throws(() => app.manageUser(user, user.email), /permiso/);
    assert.throws(() => app.deleteUser(user.email), /permiso/);
    assert.throws(() => app.deleteProduct(product.id), /permiso/);
    assert.throws(() => app.saveCategory("NUEVA"), /permiso/);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});
test("búsqueda por nombre admite coincidencias parciales, tildes, mayúsculas y espacios", () => {
  assert.equal(matchesProductName("Antibiótico Veterinario", "  ANTIBIOTICO  "), true);
  assert.equal(matchesProductName("Antibiótico Veterinario", "veter"), true);
  assert.equal(matchesProductName("Vacuna", ""), true);
  assert.equal(matchesProductName("Vacuna", "antibiotico"), false);
});
