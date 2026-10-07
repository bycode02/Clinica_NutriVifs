import { useCallback, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { ProductDetail } from "../components/ProductDetail";
import { useApp, type ProductoCatalogo } from "../context/AppContext";
import { CATEGORIAS, FILTROS_PRECIO } from "../data/productos";
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
  const { products } = useApp();
  const [category, setCategory] = useState("todos");
  const [priceFilter, setPriceFilter] = useState("todos");
  const [detail, setDetail] = useState<ProductoCatalogo | null>(null);
  const closeDetail = useCallback(() => setDetail(null), []);

  const isVisible = (product: ProductoCatalogo) =>
    (category === "todos" ||
      product.category.toLowerCase() === category.toLowerCase()) &&
    matchesPrice(product.price, priceFilter);

  const visibleCount = products.filter(isVisible).length;
  // Mantiene el detalle sincronizado con el stock actual del catálogo.
  const detailProduct = detail
    ? (products.find((product) => product.id === detail.id) ?? detail)
    : null;

  return (
    <>
      <main>
        <section className="products-page container" aria-labelledby="products-title">
          <div className="filter-section">
            <h2>Filtrar por Categoría</h2>

            <div className="filter-buttons">
              {["todos", ...CATEGORIAS].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-btn${category === item ? " active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item === "todos" ? "Todos" : item}
                </button>
              ))}
            </div>

            <div className="price-filter">
              <label htmlFor="price-filter">Filtrar por precio</label>
              <select
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

          <div className="products-introduction">
            <span className="products-label">Clinica NutriDifs</span>
            <h1 className="products-title" id="products-title">
              Nuestros productos
            </h1>
            <p>
              En nuestra clínica tenemos los mejores productos para la salud y
              bienestar de tus mascotas, todos de la mejor calidad y con los
              precios más competitivos del mercado.
            </p>
            <p>
              Nuestro catálogo de productos veterinarios incluye medicamentos,
              vacunas, antiparasitarios y suplementos nutricionales
              seleccionados para satisfacer las necesidades de tu compañero
              peludo.
            </p>

            <div className="products-info">
              <div className="products-info-item">
                <strong>Calidad</strong>
                <span>Productos seleccionados</span>
              </div>
              <div className="products-info-item">
                <strong>Variedad</strong>
                <span>Opciones para tu mascota</span>
              </div>
              <div className="products-info-item">
                <strong>Bienestar</strong>
                <span>Cuidado responsable</span>
              </div>
            </div>
          </div>

          <div className="products-catalog">
            <div className="catalogo-header">
              <h2>Catálogo Farmacéutico Veterinario</h2>
              <p>
                Encuentra medicamentos, antiparasitarios y vacunas certificadas
                para tus mascotas.
              </p>
            </div>

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
