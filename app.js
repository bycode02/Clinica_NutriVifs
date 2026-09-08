/*
 * CARRITO DE COMPRAS
 * Gestiona el carrito compartido entre las paginas del sitio.
 */

const CART_STORAGE_KEY = "clinica-nutridifs-cart";
let cartItems = loadCart();

// Convierte un valor numerico en formato de moneda chilena.
function formatCurrency(value) {
  return `$${value.toLocaleString("es-CL")}`;
}

// Escapa texto antes de insertarlo en el HTML del panel.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Lee el carrito guardado y devuelve una lista valida de productos.
function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart)
      ? savedCart.filter((item) => item && item.id && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

// Guarda el estado actual del carrito en el navegador.
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

// Obtiene los datos visibles de un producto del catalogo.
function getProductData(productCard) {
  const priceText =
    productCard.querySelector(".product-price")?.textContent || "0";
  const image = productCard.querySelector(".product-image");

  return {
    id: productCard.dataset.codigo,
    name: productCard.querySelector("h3")?.textContent.trim() || "Producto",
    image: image?.getAttribute("src") || "",
    price: Number.parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0,
  };
}

// Agrega un producto nuevo o incrementa su cantidad si ya existe.
function addProduct(product) {
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartCounter();
  openCart();
}

// Cambia la cantidad de un producto y elimina la linea cuando llega a cero.
function changeQuantity(productId, amount) {
  const item = cartItems.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  item.quantity += amount;
  cartItems = cartItems.filter((cartItem) => cartItem.quantity > 0);
  saveCart();
  renderCart();
  updateCartCounter();
}

// Calcula la suma total de todos los subtotales del carrito.
function getCartTotal() {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

// Elimina todos los productos del carrito y actualiza su estado guardado.
function clearCart() {
  cartItems = [];
  saveCart();
  renderCart();
  updateCartCounter();
}

// Renderiza cada producto, sus controles y el total del carrito.
function renderCart() {
  const cartContent = document.querySelector("#cart-content");

  if (!cartContent) {
    return;
  }

  if (cartItems.length === 0) {
    cartContent.innerHTML =
      '<p class="cart-empty-message">Tu carrito esta vacio.</p>';
    return;
  }

  cartContent.innerHTML = `
    <div class="cart-items">
      ${cartItems
        .map(
          (item) => `
            <article class="cart-item">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
              <div class="cart-item-details">
                <h3>${escapeHtml(item.name)}</h3>
                <p>${formatCurrency(item.price)} cada uno</p>
                <strong>Subtotal: ${formatCurrency(item.price * item.quantity)}</strong>
                <div class="cart-quantity-controls" aria-label="Cantidad de ${escapeHtml(item.name)}">
                  <button type="button" data-cart-minus="${escapeHtml(item.id)}" aria-label="Disminuir cantidad">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-cart-plus="${escapeHtml(item.id)}" aria-label="Aumentar cantidad">+</button>
                </div>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
    <button type="button" class="cart-clear-button" data-cart-clear>
      Vaciar carrito
    </button>
    <div class="cart-total">
      <span>Total</span>
      <strong>${formatCurrency(getCartTotal())}</strong>
    </div>
  `;
}

// Actualiza el numero de unidades junto al enlace del encabezado.
function updateCartCounter() {
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const cartLinks = document.querySelectorAll(".carrito-compras");

  cartLinks.forEach((link) => {
    link.innerHTML = `Carrito <span class="cart-counter">${totalQuantity}</span>`;
    link.setAttribute("aria-label", `Carrito, ${totalQuantity} productos`);
  });
}

// Abre el panel lateral y bloquea el desplazamiento del documento.
function openCart() {
  const panel = document.querySelector("#cart-panel");
  const overlay = document.querySelector(".cart-overlay");

  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.classList.add("is-visible");
  document.body.classList.add("cart-is-open");
}

// Cierra el panel lateral y devuelve el desplazamiento al documento.
function closeCart() {
  const panel = document.querySelector("#cart-panel");
  const overlay = document.querySelector(".cart-overlay");

  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("cart-is-open");
}

// Conecta los enlaces, botones y formulario del panel con sus acciones.
function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const cartLink = event.target.closest(".carrito-compras");
    const addButton = event.target.closest(".add-cart-button");
    const plusButton = event.target.closest("[data-cart-plus]");
    const minusButton = event.target.closest("[data-cart-minus]");
    const clearButton = event.target.closest("[data-cart-clear]");
    const closeButton = event.target.closest("[data-cart-close]");

    if (cartLink) {
      event.preventDefault();
      openCart();
    }

    if (addButton) {
      const productCard = addButton.closest(".product-card");
      if (productCard) {
        addProduct(getProductData(productCard));
      }
    }

    if (plusButton) {
      changeQuantity(plusButton.dataset.cartPlus, 1);
    }

    if (minusButton) {
      changeQuantity(minusButton.dataset.cartMinus, -1);
    }

    if (clearButton) {
      clearCart();
    }

    if (closeButton) {
      closeCart();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
    }
  });

  document
    .querySelector("#cart-contact-form")
    ?.addEventListener("submit", handleContactSubmit);
}

// Valida el formulario y muestra la confirmacion de la solicitud.
function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#cart-form-message");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  message.textContent =
    "Solicitud preparada. Nos pondremos en contacto contigo.";
  form.reset();
  clearCart();
}

// Inicializa el carrito en cualquier pagina que cargue este archivo.
function initializeCart() {
  renderCart();
  updateCartCounter();
  bindCartEvents();
}

// bayron (Consultas y quienes somos)
function initializeConsultas() {
  const modalAgendamiento = document.getElementById("modal-agendamiento");
  const botonesAgendar = document.querySelectorAll(".btn-abrir-modal");
  const botonCerrarModal = document.querySelector(".cerrar-modal");
  const textoServicio = document.getElementById("texto-servicio-seleccionado");
  const formAgendar = document.getElementById("form-agendar");

  // Mostrar modal al hacer clic en "Agendar"
  if (botonesAgendar.length > 0 && modalAgendamiento) {
      botonesAgendar.forEach(boton => {
          boton.addEventListener("click", (e) => {
              const servicio = e.target.getAttribute("data-servicio");
              textoServicio.textContent = `Servicio: ${servicio}`;
              modalAgendamiento.style.display = "block";
          });
      });
  }

  // Cerrar modal con la "X"
  if (botonCerrarModal) {
      botonCerrarModal.addEventListener("click", () => {
          modalAgendamiento.style.display = "none";
      });
  }

  // Cerrar modal al hacer clic fuera de él
  window.addEventListener("click", (e) => {
      if (e.target === modalAgendamiento) {
          modalAgendamiento.style.display = "none";
      }
  });

  // Manejar el envío del formulario
  if (formAgendar) {
      formAgendar.addEventListener("submit", (e) => {
          e.preventDefault(); // Evita que la página recargue
          const fecha = document.getElementById("fecha-cita").value;
          const hora = document.getElementById("hora-cita").value;
          
          alert(`¡Cita agendada exitosamente!\nFecha: ${fecha}\nHora: ${hora}`);
          modalAgendamiento.style.display = "none";
          formAgendar.reset(); // Limpia los campos
      });
  }
}

// Evento principal: Ejecuta las funciones de todos cuando la página carga
document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  initializeConsultas();
});
