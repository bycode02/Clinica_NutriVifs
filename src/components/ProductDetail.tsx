import { useEffect } from "react";
import { useApp, type ProductoCatalogo } from "../context/AppContext";
import { imagenProducto } from "../data/productos";
import { formatCurrency } from "../utils/format";
import { ProductDescription } from "./ProductCard";

type Props = {
  product: ProductoCatalogo | null;
  onClose: () => void;
};

// Panel lateral con el detalle del producto (antes #detail-panel).
export const ProductDetail = ({ product, onClose }: Props) => {
  const { addToCart, getQuantity } = useApp();
  const isOpen = product !== null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("detail-is-open");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("detail-is-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const stock = product?.stock ?? 0;
  const outOfStock = stock <= 0;
  const atLimit = product ? stock > 0 && getQuantity(product.id) >= stock : false;

  return (
    <>
      <div
        className={`detail-overlay${isOpen ? " is-visible" : ""}`}
        onClick={onClose}
      />
      <div
        className={`detail-panel${isOpen ? " is-open" : ""}`}
        id="detail-panel"
        aria-labelledby="detail-title"
        aria-hidden={!isOpen}
      >
        <div className="detail-panel-header">
          <h2 id="detail-title">Detalle del producto</h2>
          <button
            className="detail-close-button"
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="detail-content" id="detail-content">
          {product ? (
            <>
              {product.image ? (
                <img src={imagenProducto(product.image)} alt={product.name} />
              ) : null}
              <span className="detail-category">{product.category}</span>
              <h3>{product.name}</h3>
              <strong className="detail-price">
                {formatCurrency(product.price)}
              </strong>
              <p className="detail-description">
                <ProductDescription product={product} />
              </p>
              <p className={`detail-stock${outOfStock ? " out-of-stock" : ""}`}>
                {outOfStock
                  ? "Sin stock disponible"
                  : `Stock disponible: ${stock} unidades`}
              </p>
              <button
                type="button"
                className="add-cart-button"
                disabled={atLimit || outOfStock}
                onClick={() => addToCart(product.id)}
              >
                Agregar al carrito
              </button>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};
