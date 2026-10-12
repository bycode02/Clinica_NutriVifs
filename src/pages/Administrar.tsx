import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import { useApp, type Profile, type ProductoCatalogo } from "../context/AppContext";
import { ProductDescription } from "../components/ProductCard";
import { imagenProducto } from "../data/productos";
import { formatCurrency } from "../utils/format";
import { usePage } from "../hooks/usePage";
import { UserForm } from "./Registro";
import "../styles/administrar.css";

type Section = "USUARIOS" | "PRODUCTOS" | "CATEGORIAS";
function Access({ seller = false }: { seller?: boolean }) {
  const { session } = useApp();
  usePage("Administrar | Clínica NutriDifs");
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "Cliente" || !session.role) return <Navigate to="/perfil" replace />;
  if (seller && session.role === "Administrador") return <Navigate to="/administrar" replace />;
  if (!seller && session.role === "Vendedor") return <Navigate to="/vendedor" replace />;
  return <Management seller={seller} />;
}
export function Administrar() { return <Access />; }
export function Vendedor() { return <Access seller />; }

function Management({ seller }: { seller: boolean }) {
  const app = useApp();
  const [section, setSection] = useState<Section>(seller ? "PRODUCTOS" : "USUARIOS");
  const [userForm, setUserForm] = useState<Profile | "new" | null>(null);
  const [productForm, setProductForm] = useState<ProductoCatalogo | "new" | null>(null);
  const [categoryForm, setCategoryForm] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ label: string; run: () => void } | null>(null);
  const perform = (action: () => void, success: string) => {
    try { action(); setMessage(success); } catch (error) { setMessage((error as Error).message); }
  };
  const changeSection = (next: Section) => { setSection(next); setUserForm(null); setProductForm(null); setCategoryForm(null); setMessage(""); setPendingDelete(null); };
  return <main className="management container">
    <header className="management-heading"><div><p className="profile-kicker">{seller ? "VENDEDOR" : "ADMINISTRADOR"}</p><h1>Administrar</h1><p>{seller ? "Consulta el catálogo, actualiza el stock y crea cuentas de clientes." : "Gestiona los usuarios y el catálogo de tu tienda."}</p></div><Link to="/perfil">Volver al perfil</Link></header>
    <div className="management-layout">
      <aside className="management-sidebar"><nav aria-label="Secciones de administración">{(seller ? ["PRODUCTOS", "USUARIOS"] as Section[] : ["USUARIOS", "PRODUCTOS", "CATEGORIAS"] as Section[]).map(item => <button key={item} type="button" aria-pressed={section === item} onClick={() => changeSection(item)}>{seller && item === "USUARIOS" ? "CREAR CLIENTE" : item}</button>)}</nav><p>{seller ? "Puedes modificar el stock y registrar clientes." : "Los cambios se reflejan inmediatamente en la tienda."}</p></aside>
      <section className="management-panel" aria-label={section}>
        <header className="management-panel-heading"><div><h2>{seller && section === "USUARIOS" ? "Crear cliente" : section.charAt(0) + section.slice(1).toLowerCase()}</h2><p>{section === "PRODUCTOS" ? `${app.products.length} productos` : section === "CATEGORIAS" ? `${app.categories.length} categorías` : seller ? "Las nuevas cuentas tendrán el rol USUARIO." : `${app.profiles.length} usuarios registrados`}</p></div>
          {!(seller && section === "PRODUCTOS") && <button type="button" className="management-primary" onClick={() => { setMessage(""); if (section === "USUARIOS") setUserForm("new"); if (section === "PRODUCTOS") setProductForm("new"); if (section === "CATEGORIAS") { setCategoryForm(""); setCategoryName(""); } }}>add+</button>}
        </header>
        <p className="management-message" role="status">{message}</p>
        {pendingDelete && <div className="management-confirm" role="alert"><p>{pendingDelete.label}</p><button type="button" className="management-danger" onClick={() => { perform(pendingDelete.run, "Eliminado correctamente."); setPendingDelete(null); }}>Confirmar eliminación</button><button type="button" onClick={() => setPendingDelete(null)}>Cancelar</button></div>}
        {section === "USUARIOS" && <>
          {userForm && <UserForm key={userForm === "new" ? "new" : userForm.email} managed initial={userForm === "new" ? undefined : userForm} onDone={() => setUserForm(null)} />}
          {!seller && app.profiles.map(user => <article className="management-row" key={user.email}>
            <svg className="management-avatar" role="img" aria-label={`Avatar de ${user.name}`} viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#e5f4ee"/><circle cx="40" cy="29" r="13" fill="#268365"/><path d="M16 67c0-25 48-25 48 0" fill="#268365"/></svg>
            <div className="management-row-info"><span className="management-badge">{user.role === "Cliente" ? "USUARIO" : user.role?.toUpperCase()}</span><h3>{user.name} {user.apellido}</h3><p>{user.email}</p><p>{user.phone || "Sin teléfono"}</p><p>{user.direccion}, {user.comuna}</p>{user.locked && <p>Cuenta bloqueada</p>}</div>
            <div className="management-actions"><button type="button" onClick={() => { setUserForm(user); setMessage(""); }}>Modificar</button>{user.locked && <button type="button" onClick={() => perform(() => app.manageUser({ ...user, locked: false, failedAttempts: 0 }, user.email), "Cuenta desbloqueada.")}>Desbloquear</button>}<button type="button" className="management-danger" onClick={() => setPendingDelete({ label: `¿Eliminar a ${user.name}?${user.email === app.session?.email ? " Se cerrará tu sesión." : ""}`, run: () => app.deleteUser(user.email) })}>Eliminar usuario</button></div>
          </article>)}
          {!seller && !app.profiles.length && <p className="management-empty">Aún no hay usuarios registrados.</p>}
          {seller && !userForm && <p className="management-empty">Selecciona add+ para registrar un cliente.</p>}
        </>}
        {section === "PRODUCTOS" && <>
          {productForm && !seller && <ProductForm key={productForm === "new" ? "new" : productForm.id} initial={productForm === "new" ? undefined : productForm} onClose={() => setProductForm(null)} />}
          {app.products.map(product => <article className="management-row" key={product.id}>
            {product.image ? <img className="management-product-image" src={imagenProducto(product.image)} alt={product.name} /> : <div className="management-product-placeholder" aria-label="Producto sin imagen">NV</div>}
            <div className="management-row-info"><span className="management-badge">{product.category || "Sin categoría"}</span><h3>{product.name}</h3><p><ProductDescription product={product} /></p><strong>{formatCurrency(product.price)}</strong><p>Distribuidora: {product.distributor}</p><p>Stock: {product.stock} unidades</p></div>
            <div className="management-actions"><StockForm key={`${product.id}-${product.stock}`} product={product} onSave={stock => perform(() => app.updateStock(product.id, stock), "Stock actualizado.")} />{!seller && <><button type="button" onClick={() => setProductForm(product)}>Modificar</button><button type="button" className="management-danger" onClick={() => setPendingDelete({ label: `¿Eliminar ${product.name}? También se quitará del carrito.`, run: () => app.deleteProduct(product.id) })}>Eliminar producto</button></>}</div>
          </article>)}
          {!app.products.length && <p className="management-empty">No hay productos. Agrega uno para comenzar.</p>}
        </>}
        {section === "CATEGORIAS" && !seller && <>
          {categoryForm !== null && <form className="management-form" onSubmit={e => { e.preventDefault(); perform(() => { app.saveCategory(categoryName, categoryForm || undefined); setCategoryForm(null); }, "Categoría guardada."); }}><h3>{categoryForm ? "Modificar categoría" : "Agregar categoría"}</h3><label htmlFor="category-name">Nombre</label><input id="category-name" autoFocus value={categoryName} onChange={e => setCategoryName(e.target.value.toUpperCase())} required minLength={3} /><small>Mínimo 3 letras, sin símbolos ni números.</small><div className="management-form-actions"><button className="management-primary" type="submit">Guardar categoría</button><button type="button" onClick={() => setCategoryForm(null)}>Cancelar</button></div></form>}
          <div className="management-categories">{app.categories.map(category => <article className="management-category" key={category}><button type="button" className="management-category-delete" aria-label={`Eliminar categoría ${category}`} onClick={() => setPendingDelete({ label: `¿Eliminar ${category}? Sus productos se conservarán sin categoría.`, run: () => app.deleteCategory(category) })}>−</button><h3>{category}</h3><p>{app.products.filter(p => p.category === category).length} productos</p><button type="button" onClick={() => { setCategoryForm(category); setCategoryName(category); }}>Modificar</button></article>)}</div>
          {!app.categories.length && <p className="management-empty">No hay categorías. Agrega una para clasificar productos.</p>}
        </>}
      </section>
    </div>
  </main>;
}
function StockForm({ product, onSave }: { product: ProductoCatalogo; onSave: (stock: number) => void }) {
  const [stock, setStock] = useState(String(product.stock));
  return <form className="management-stock" onSubmit={e => { e.preventDefault(); if (/^\d+$/.test(stock)) onSave(Number(stock)); }}><label htmlFor={`stock-${product.id}`}>Stock</label><input id={`stock-${product.id}`} type="number" min="0" step="1" required value={stock} onChange={e => setStock(e.target.value)} /><button type="submit">Guardar stock</button></form>;
}
function ProductForm({ initial, onClose }: { initial?: ProductoCatalogo; onClose: () => void }) {
  const { categories, saveProduct } = useApp();
  const [product, setProduct] = useState<ProductoCatalogo>(initial || { id: crypto.randomUUID(), name: "", price: 0, distributor: "", stock: 0, category: categories[0] || "", image: "", principio: "", especie: "", description: "" });
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(String(initial?.stock || 0));
  const [error, setError] = useState("");
  const update = (key: keyof ProductoCatalogo, value: string) => setProduct(p => ({ ...p, [key]: value }));
  const submit = (e: FormEvent) => { e.preventDefault(); try { if (!/^\d{3,}$/.test(price) || !/^\d+$/.test(stock)) throw new Error("Precio: mínimo 3 dígitos; stock: entero no negativo. Sin símbolos."); saveProduct({ ...product, price: Number(price), stock: Number(stock) }); onClose(); } catch (err) { setError((err as Error).message); } };
  return <form className="management-form" onSubmit={submit}><h3>{initial ? "Modificar producto" : "Agregar producto"}</h3>
    <label htmlFor="product-name">Nombre del producto</label><input id="product-name" autoFocus required minLength={3} value={product.name} onChange={e => update("name", e.target.value)} />
    <label htmlFor="product-price">Precio (CLP)</label><input id="product-price" inputMode="numeric" required value={price} onChange={e => setPrice(e.target.value)} /><small>Al menos 3 dígitos, sin separadores ni símbolos.</small>
    <label htmlFor="product-distributor">Distribuidora</label><input id="product-distributor" required minLength={3} value={product.distributor} onChange={e => update("distributor", e.target.value)} /><small>Nombre y distribuidora: mínimo 3 caracteres; se admiten mayúsculas, letras y números, sin símbolos. La distribuidora solo se muestra en administración.</small>
    <label htmlFor="product-category">Categoría</label><select id="product-category" required value={product.category} onChange={e => update("category", e.target.value)}><option value="">Selecciona una categoría</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
    {!categories.length && <p>Primero agrega una categoría en CATEGORIAS.</p>}
    <label htmlFor="product-stock">Stock inicial</label><input id="product-stock" type="number" min="0" step="1" required value={stock} onChange={e => setStock(e.target.value)} />
    <label htmlFor="product-description">Descripción (opcional)</label><textarea id="product-description" value={product.description || ""} onChange={e => update("description", e.target.value)} />
    <p role="alert">{error}</p><div className="management-form-actions"><button type="submit" className="management-primary">Guardar producto</button><button type="button" onClick={onClose}>Cancelar</button></div>
  </form>;
}
