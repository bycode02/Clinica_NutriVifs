/*
 * CARRITO DE COMPRAS
 * Gestiona el carrito compartido entre las paginas del sitio.
 */

const CART_STORAGE_KEY = "clinica-nutridifs-cart";
const PROFILE_STORAGE_KEY = "clinica-nutridifs-profiles";
const SESSION_STORAGE_KEY = "clinica-nutridifs-session";
let cartItems = loadCart();
let profiles = loadProfiles();
let activeProfile = loadSession();

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

// Lee las cuentas registradas en el navegador.
function loadProfiles() {
  try {
    const savedProfiles = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    return Array.isArray(savedProfiles) ? savedProfiles : [];
  } catch {
    return [];
  }
}

// Guarda todas las cuentas registradas en el navegador.
function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

// Lee la cuenta que tiene una sesión activa.
function loadSession() {
  try {
    const savedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
    return savedSession?.email ? savedSession : null;
  } catch {
    return null;
  }
}

// Normaliza el correo para comparar cuentas sin distinguir mayúsculas.
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Comprueba que el correo tenga un formato válido.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Comprueba que la fecha tenga formato dd/mm/yyyy y que la persona tenga 16 años.
function isAtLeastSixteen(birthDate) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate);

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const today = new Date();

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  let age = today.getFullYear() - year;
  const birthdayHasNotPassed =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);

  if (birthdayHasNotPassed) {
    age -= 1;
  }

  return age >= 16;
}

// Comprueba las reglas de longitud y mayúscula de la contraseña.
function isValidPassword(password) {
  return (
    password.length >= 4 && password.length <= 13 && /[A-Z]/.test(password)
  );
}

// Guarda la cuenta actual como sesión activa.
function startSession(profile) {
  activeProfile = {
    name: profile.name,
    email: profile.email,
    birthDate: profile.birthDate,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeProfile));
  renderProfile();
  renderCart();
}

// Cierra la sesión actual sin eliminar la cuenta registrada.
function logoutProfile() {
  activeProfile = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  showProfileView("login");
  renderProfile();
  renderCart();
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
  const contactMessage = document.querySelector(".cart-profile-message");

  if (contactMessage) {
    contactMessage.textContent = activeProfile
      ? `Hola ${activeProfile.name}, la solicitud se enviará al correo ${activeProfile.email}.`
      : "La solicitud se enviará con los datos de tu perfil.";
  }

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

// Abre el panel de perfil y muestra la vista correspondiente a la sesión.
function openProfile() {
  const panel = document.querySelector("#profile-panel");
  const overlay = document.querySelector(".profile-overlay");

  renderProfile();
  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.classList.add("is-visible");
  document.body.classList.add("profile-is-open");
}

// Cierra el panel de perfil y habilita nuevamente el desplazamiento.
function closeProfile() {
  const panel = document.querySelector("#profile-panel");
  const overlay = document.querySelector(".profile-overlay");

  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("profile-is-open");
}

// Cambia entre los formularios de inicio de sesión y registro.
function showProfileView(view) {
  const loginView = document.querySelector("#login-view");
  const registerView = document.querySelector("#register-view");

  loginView?.toggleAttribute("hidden", view !== "login");
  registerView?.toggleAttribute("hidden", view !== "register");
}

// Actualiza el panel con el estado de sesión actual.
function renderProfile() {
  const authView = document.querySelector("#profile-auth-view");
  const sessionView = document.querySelector("#profile-session-view");
  const profileName = document.querySelector("#profile-session-name");
  const profileEmail = document.querySelector("#profile-session-email");
  const profileLinks = document.querySelectorAll(".profile-link");

  if (!authView || !sessionView) {
    return;
  }

  authView.toggleAttribute("hidden", Boolean(activeProfile));
  sessionView.toggleAttribute("hidden", !activeProfile);

  if (!activeProfile) {
    showProfileView("login");
  }

  if (activeProfile) {
    profileName.textContent = activeProfile.name;
    profileEmail.textContent = activeProfile.email;
  }

  profileLinks.forEach((link) => {
    link.textContent = activeProfile
      ? `Perfil (${activeProfile.name})`
      : "Perfil";
  });
}

// Inicia sesión cuando encuentra un correo y contraseña coincidentes.
function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = normalizeEmail(form.elements.email.value);
  const password = form.elements.password.value;
  const message = document.querySelector("#login-message");
  const profile = profiles.find((item) => item.email === email);

  if (!profile || profile.password !== password) {
    message.textContent =
      "La cuenta no existe o el correo y/o contraseña no coinciden.";
    return;
  }

  startSession(profile);
  message.textContent = "Sesión iniciada correctamente.";
  form.reset();
}

// Valida y crea una cuenta nueva antes de iniciar su sesión.
function handleRegisterSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const email = normalizeEmail(form.elements.email.value);
  const birthDate = form.elements.birthDate.value.trim();
  const password = form.elements.password.value;
  const message = document.querySelector("#register-message");
  const emailAlreadyUsed = profiles.some((item) => item.email === email);
  const passwordAlreadyUsed = profiles.some(
    (item) => item.password === password,
  );

  if (
    name.length < 2 ||
    !isValidEmail(email) ||
    !isAtLeastSixteen(birthDate) ||
    !isValidPassword(password)
  ) {
    message.textContent =
      "Valores incorrectos. Revisa los datos y la contraseña.";
    return;
  }

  if (emailAlreadyUsed || passwordAlreadyUsed) {
    message.textContent = "El correo y/o la contraseña ya están usados.";
    return;
  }

  const profile = { name, email, birthDate, password };
  profiles.push(profile);
  saveProfiles();
  startSession(profile);
  message.textContent = "Cuenta creada y sesión iniciada correctamente.";
  form.reset();
}

// Conecta los enlaces, botones y formulario del panel con sus acciones.
function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const cartLink = event.target.closest(".carrito-compras");
    const profileLink = event.target.closest(".profile-link");
    const addButton = event.target.closest(".add-cart-button");
    const plusButton = event.target.closest("[data-cart-plus]");
    const minusButton = event.target.closest("[data-cart-minus]");
    const clearButton = event.target.closest("[data-cart-clear]");
    const closeButton = event.target.closest("[data-cart-close]");
    const profileCloseButton = event.target.closest("[data-profile-close]");
    const registerButton = event.target.closest(
      "[data-profile-view='register']",
    );
    const loginButton = event.target.closest("[data-profile-view='login']");
    const logoutButton = event.target.closest("[data-profile-logout]");

    if (profileLink) {
      event.preventDefault();
      openProfile();
    }

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

    if (profileCloseButton) {
      closeProfile();
    }

    if (registerButton) {
      showProfileView("register");
    }

    if (loginButton) {
      showProfileView("login");
    }

    if (logoutButton) {
      logoutProfile();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeProfile();
    }
  });

  document
    .querySelector("#cart-contact-form")
    ?.addEventListener("submit", handleContactSubmit);
  document
    .querySelector("#login-form")
    ?.addEventListener("submit", handleLoginSubmit);
  document
    .querySelector("#register-form")
    ?.addEventListener("submit", handleRegisterSubmit);
}

// Valida el formulario y muestra la confirmacion de la solicitud.
function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#cart-form-message");

  if (!activeProfile) {
    message.textContent =
      "Necesitas crear un perfil e iniciar sesión para enviar la solicitud.";
    openProfile();
    return;
  }

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
  renderProfile();
  bindCartEvents();
}

document.addEventListener("DOMContentLoaded", initializeCart);
