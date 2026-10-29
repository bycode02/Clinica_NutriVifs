import { matchesProductName } from "../utils/productSearch";
import { useCallback, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { ProductDetail } from "../components/ProductDetail";
import { useApp, type ProductoCatalogo } from "../context/AppContext";
import { FILTROS_PRECIO } from "../data/productos";
import { usePage } from "../hooks/usePage";

function matchesPrice(price: number, filter: string) {
  if (filter === "todos") return true;
  const [min, max] = filter.split("-");
  const minimum = Number(min) || 0;
  if (filter.endsWith("-mas")) return price >= minimum;
  return price >= minimum && price <= (Number(max) || 0);
}

export default function Productos() {
  usePage("Clinica NutriDifs | Productos");
  const { products, categories } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");
  const [priceFilter, setPriceFilter] = useState("todos");
  const [detail, setDetail] = useState<ProductoCatalogo | null>(null);
  const closeDetail = useCallback(() => setDetail(null), []);

  const isVisible = (product: ProductoCatalogo) =>
    (category === "todos" ||
      product.category.toLowerCase() === category.toLowerCase()) &&
    matchesPrice(product.price, priceFilter) &&
    matchesProductName(product.name, search);

  const visibleCount = products.filter(isVisible).length;
  // Mantiene el detalle sincronizado con el stock actual del catálogo.
  const detailProduct = detail
    ? (products.find((product) => product.id === detail.id) ?? detail)
    : null;

  return (
    <>
      <main>
        <section
          className="products-page container"
          aria-labelledby="products-title"
        >
          <div className="filter-section">
            <div className="product-search">
              <label htmlFor="product-search">Buscar por nombre</label>
              <input
                className="form-control"
                id="product-search"
                type="search"
                placeholder="Escribe el nombre del producto"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <h2>Filtrar por Categoría</h2>

            <div className="filter-buttons">
              {["todos", ...categories].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={[
                    "btn",
                    `filter-btn${category === item ? " active" : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setCategory(item)}
                >
                  {item === "todos" ? "Todos" : item}
                </button>
              ))}
            </div>

            <div className="price-filter">
              <label htmlFor="price-filter">Filtrar por precio</label>
              <select
                className="form-select"
                id="price-filter"
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
              >
                {FILTROS_PRECIO.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="filter-result" aria-live="polite">
              {visibleCount} producto{visibleCount === 1 ? "" : "s"} encontrado
              {visibleCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="products-catalog">
            <div className="catalogo-header">
              <h1 id="products-title">Catálogo Farmacéutico Veterinario</h1>
              <p>
                Encuentra medicamentos, antiparasitarios y vacunas certificadas
                para tus mascotas.
              </p>
            </div>

            {visibleCount === 0 && (
              <p role="status">
                No se encontraron productos. Prueba otro nombre o cambia los
                filtros.
              </p>
            )}
            <div className="products-grid" id="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hidden={!isVisible(product)}
                  onViewDetail={setDetail}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <ProductDetail product={detailProduct} onClose={closeDetail} />
    </>
  );
}
