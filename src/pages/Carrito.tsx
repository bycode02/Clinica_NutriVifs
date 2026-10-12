import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { usePage } from "../hooks/usePage";
import { formatCurrency } from "../utils/format";

type Notice = { message: string; onConfirm?: () => void } | null;

export default function Carrito() {
  usePage("Carrito | Clínica NutriDifs", "cart-page-body");
  const { cart, cartTotal, changeQuantity, removeFromCart, clearCart } = useApp();
  const [notice, setNotice] = useState<Notice>(null);

  const pay = () => {
    if (cart.length === 0) {
      setNotice({ message: "Agrega al menos un producto antes de pagar." });
      return;
    }
    setNotice({
      message: `El total de tu compra es ${formatCurrency(cartTotal)}. ¿Deseas continuar con el pago?`,
      onConfirm: () => {
        clearCart();
        setNotice({ message: "Pago iniciado correctamente. ¡Gracias por tu compra!" });
      },
    });
  };

  return (
    <main className="cart-page">
      <section className="cart-page-shell" aria-labelledby="cart-page-title">
        <div className="cart-page-header">
          <div>
            <p className="profile-kicker">Carrito</p>
            <h1 id="cart-page-title">Mis productos</h1>
          </div>
          <Link className="profile-back-link" to="/productos">
            Seguir comprando
          </Link>
        </div>

        <div className="cart-page-layout">
          <div className="cart-page-items-wrap">
            <div className="cart-page-items">
              {cart.map((product) => (
                <article className="cart-item" key={product.code}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : null}
                  <div className="cart-item-info">
                    <h2>{product.name}</h2>
                    <strong>{formatCurrency(product.price)}</strong>
                    <div className="cart-item-actions">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        onClick={() => changeQuantity(product.code, -1)}
                      >
                        −
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        onClick={() => changeQuantity(product.code, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => removeFromCart(product.code)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="cart-page-empty" hidden={cart.length > 0}>
              Tu carrito está vacío.
            </p>
          </div>

          <div className="cart-page-summary">
            <h2>Resumen</h2>
            <div className="cart-page-summary-row">
              <span>Productos</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
            <button type="button" className="cart-page-button" onClick={clearCart}>
              Vaciar carrito
            </button>
            <button type="button" className="cart-page-button primary" onClick={pay}>
              Pagar
            </button>

            {notice ? (
              <div className="cart-notice" role="status">
                <p>{notice.message}</p>
                <div className="cart-notice-actions">
                  {notice.onConfirm ? (
                    <>
                      <button
                        type="button"
                        className="cart-page-button primary"
                        onClick={notice.onConfirm}
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        className="cart-page-button"
                        onClick={() => setNotice(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="cart-page-button"
                      onClick={() => setNotice(null)}
                    >
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
