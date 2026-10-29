import { useEffect, useState } from "react";
import { useApp, type ProductoCatalogo } from "../context/AppContext";
import { imagenProducto } from "../data/productos";
import { formatCurrency } from "../utils/format";

export const ProductDescription = ({
  product,
}: {
  product: ProductoCatalogo;
}) =>
  product.description ? (
    <>{product.description}</>
  ) : (
    <>
      {product.principio || "Producto veterinario"}
      <br />
      {product.especie && <small>Especie: {product.especie}</small>}
    </>
  );

type Props = {
  product: ProductoCatalogo;
  hidden: boolean;
  onViewDetail: (product: ProductoCatalogo) => void;
};

export const ProductCard = ({ product, hidden, onViewDetail }: Props) => {
  const { addToCart, getQuantity } = useApp();
  const [added, setAdded] = useState(false);
  const quantity = getQuantity(product.id);
  const atStockLimit = quantity >= product.stock;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <article
      className={`product-card${hidden ? " is-filtered-out" : ""}`}
      data-codigo={product.id}
      data-category={product.category}
    >
      {product.image ? (
        <img
          className="product-image"
          src={imagenProducto(product.image)}
          alt={product.name}
        />
      ) : null}

      <div className="product-content">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>
          <ProductDescription product={product} />
        </p>
        <p className={`product-stock${atStockLimit ? " out-of-stock" : ""}`}>
          Stock disponible: {product.stock} unidades
        </p>

        <div className="product-footer">
          <strong className="product-price">
            {formatCurrency(product.price)}
          </strong>
          <button
            type="button"
            className="btn view-detail-button"
            onClick={() => onViewDetail(product)}
          >
            Ver detalle
          </button>
          <button
            type="button"
            className="btn add-cart-button"
            disabled={atStockLimit}
            onClick={() => {
              if (addToCart(product.id)) setAdded(true);
            }}
          >
            {added ? "Agregado" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
};
