const STORAGE_KEYS = {
  CART: "carrito",
  LEGACY_CART: "clinica-nutridifs-cart",
  PROFILES: "clinica-nutridifs-profiles",
  SESSION: "clinica-nutridifs-session",
  ADMIN_PRODUCTS: "admin-products",
  ADMIN_USERS: "admin-users",
};

const state = {
  cartItems: [],
  profiles: [],
  activeProfile: null,
};

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidComment(comment) {
  const value = String(comment || "").trim();
  return value.length >= 1 && value.length <= 500;
}

// =========================================================
// REGIONES Y COMUNAS (selects encadenados)
// =========================================================

const REGIONES_COMUNAS = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  Tarapacá: ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  Antofagasta: ["Antofagasta", "Calama", "Tocopilla"],
  Atacama: ["Copiapó", "Vallenar", "Chañaral"],
  Coquimbo: ["La Serena", "Coquimbo", "Ovalle"],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué"],
  "Metropolitana de Santiago": [
    "Santiago",
    "Providencia",
    "Las Condes",
    "Maipú",
    "Puente Alto",
    "Ñuñoa",
    "La Florida",
    "Peñalolén",
  ],
  "Libertador General Bernardo O'Higgins": [
    "Rancagua",
    "San Fernando",
    "Rengo",
  ],
  Maule: ["Talca", "Curicó", "Linares"],
  Ñuble: ["Chillán", "San Carlos", "Bulnes"],
  Biobío: ["Concepción", "Talcahuano", "Los Ángeles"],
  "La Araucanía": ["Temuco", "Villarrica", "Angol"],
  "Los Ríos": ["Valdivia", "La Unión"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  Aysén: ["Coyhaique", "Puerto Aysén"],
  Magallanes: ["Punta Arenas", "Puerto Natales"],
};

function updateComunaOptions(region, comunaSelect) {
  if (!comunaSelect) return;

  const comunas = REGIONES_COMUNAS[region] || [];

  comunaSelect.innerHTML = comunas.length
    ? '<option value="">-- Selecciona la comuna --</option>' +
      comunas
        .map(
          (c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`,
        )
        .join("")
    : '<option value="">Selecciona primero una región</option>';

  comunaSelect.disabled = comunas.length === 0;
}

function initializeRegionComunaSelects() {
  document.querySelectorAll("[data-region-select]").forEach((regionSelect) => {
    if (regionSelect.dataset.populated === "true") return;

    regionSelect.innerHTML =
      '<option value="">-- Selecciona la región --</option>' +
      Object.keys(REGIONES_COMUNAS)
        .map(
          (region) =>
            `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`,
        )
        .join("");
    regionSelect.dataset.populated = "true";

    const comunaSelect = regionSelect
      .closest("form")
      ?.querySelector("[data-comuna-select]");

    updateComunaOptions(regionSelect.value, comunaSelect);

    regionSelect.addEventListener("change", () => {
      updateComunaOptions(regionSelect.value, comunaSelect);
    });
  });
}

function validateContactForm(form) {
  const nameInput = form.elements.name || form.elements.nombre;
  const emailInput = form.elements.email || form.elements.correo;
  const commentInput =
    form.elements.comment || form.elements.comentario || form.elements.message;

  const name = nameInput?.value.trim() || "";
  const email = normalizeEmail(emailInput?.value || "");
  const comment = commentInput?.value.trim() || "";

  if (!isValidName(name)) {
    nameInput?.setCustomValidity(
      "El nombre es obligatorio y debe tener máximo 100 caracteres.",
    );
    return false;
  }
  nameInput?.setCustomValidity("");

  if (email && email.length > 100) {
    emailInput?.setCustomValidity(
      "El correo no puede superar los 100 caracteres.",
    );
    return false;
  }

  if (email && !isValidEmail(email)) {
    emailInput?.setCustomValidity(
      "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.",
    );
    return false;
  }
  emailInput?.setCustomValidity("");

  if (!isValidComment(comment)) {
    commentInput?.setCustomValidity(
      "El comentario es obligatorio y debe tener máximo 500 caracteres.",
    );
    return false;
  }
  commentInput?.setCustomValidity("");

  return true;
}

// =========================================================
// GESTIÓN DE DATOS (LOCALSTORAGE)
// =========================================================

function loadFromStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadCart() {
  let saved =
    localStorage.getItem(STORAGE_KEYS.CART) ||
    localStorage.getItem(STORAGE_KEYS.LEGACY_CART);

  if (!saved) return [];

  try {
    const cart = JSON.parse(saved);
    if (!Array.isArray(cart)) return [];

    return cart
      .filter((item) => item && Number(item.quantity) > 0)
      .map((item) => ({
        code: String(item.code || item.id || ""),
        name: item.name || "Producto",
        price: Number(item.price) || 0,
        image: item.image || "",
        quantity: Number(item.quantity) || 1,
      }))
      .filter((item) => item.code);
  } catch (error) {
    console.error("Error cargando carrito:", error);
    return [];
  }
}

function loadProfiles() {
  return loadFromStorage(STORAGE_KEYS.PROFILES);
}

function loadSession() {
  try {
    const session = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SESSION) || "null",
    );
    return session?.email ? session : null;
  } catch {
    return null;
  }
}

// =========================================================
// INICIALIZACIÓN
// =========================================================

function initializeState() {
  state.cartItems = loadCart();
  state.profiles = loadProfiles();
  state.activeProfile = loadSession();
}

// =========================================================
// CARRITO
// =========================================================

function saveCart() {
  saveToStorage(STORAGE_KEYS.CART, state.cartItems);
}

function getCartQuantity() {
  return state.cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

function getCartTotal() {
  return state.cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
}

function findCartProduct(code) {
  return state.cartItems.find((item) => item.code === code);
}

function getProductStock(productCard) {
  if (!productCard) return 0;

  if (
    productCard.dataset.stock !== undefined &&
    productCard.dataset.stock !== ""
  ) {
    return Number(productCard.dataset.stock);
  }

  try {
    const products = loadFromStorage(STORAGE_KEYS.ADMIN_PRODUCTS);
    const product = products.find(
      (item) => item.id === productCard.dataset.codigo,
    );
    return product
      ? Number(product.stock)
      : getDefaultStock(productCard.dataset.codigo);
  } catch {
    return getDefaultStock(productCard.dataset.codigo);
  }
}

const stockByCode = {
  ME001: 12,
  ME002: 6,
  ME003: 18,
  ME004: 9,
  ME005: 25,
  ME006: 7,
  ME007: 14,
  ME008: 4,
  ME009: 20,
  ME010: 8,
  ME011: 16,
  ME012: 5,
  ME013: 11,
  ME014: 30,
  ME015: 3,
  ME016: 22,
  ME017: 10,
  ME018: 13,
  ME019: 2,
  ME020: 17,
  ME021: 8,
  ME022: 19,
};

function getDefaultStock(code) {
  return Number(stockByCode[code] || 10);
}

function addProduct(product) {
  if (!product || !product.code) return false;

  const productCard = [...document.querySelectorAll(".product-card")].find(
    (card) => card.dataset.codigo === String(product.code),
  );

  const stock = getProductStock(productCard);
  const existing = findCartProduct(product.code);

  if (existing && stock > 0 && existing.quantity >= stock) {
    return false;
  }

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cartItems.push({
      code: product.code,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
  updateCartCounter();
  updateProductQuantities();

  return true;
}

function getProductData(productCard) {
  if (!productCard) return null;

  const priceText =
    productCard.querySelector(".product-price")?.textContent || "0";

  return {
    code: productCard.dataset.codigo,
    name: productCard.querySelector("h3")?.textContent.trim() || "Producto",
    image:
      productCard.querySelector(".product-image")?.getAttribute("src") || "",
    price: Number.parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0,
  };
}

function addProductFromCard(card) {
  const product = getProductData(card);
  return addProduct(product);
}

function changeQuantity(code, amount) {
  const item = findCartProduct(code);
  if (!item) return;

  if (amount > 0) {
    const card = [...document.querySelectorAll(".product-card")].find(
      (productCard) => productCard.dataset.codigo === String(code),
    );
    const stock = getProductStock(card);

    if (stock > 0 && item.quantity >= stock) return;
  }

  item.quantity += amount;

  if (item.quantity <= 0) {
    state.cartItems = state.cartItems.filter(
      (cartItem) => cartItem.code !== code,
    );
  }

  saveCart();
  renderCart();
  updateCartCounter();
  updateProductQuantities();
}

function removeCartProduct(code) {
  state.cartItems = state.cartItems.filter((item) => item.code !== code);
  saveCart();
  renderCart();
  updateCartCounter();
  updateProductQuantities();
}

function clearCart() {
  state.cartItems = [];
  saveCart();
  renderCart();
  updateCartCounter();
  updateProductQuantities();
}

// =========================================================
// RENDERIZADO DEL CARRITO
// =========================================================

function updateCartCounter() {
  const totalQuantity = getCartQuantity();

  document.querySelectorAll(".carrito-compras").forEach((link) => {
    link.innerHTML = `Carrito <span class="cart-counter">${totalQuantity}</span>`;
    link.setAttribute("aria-label", `Carrito, ${totalQuantity} productos`);
  });

  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = totalQuantity;
  });
}

function renderCart() {
  const cartContent = document.querySelector("#cart-content");
  const cartItemsContainer = document.querySelector("[data-cart-items]");
  const contactMessage = document.querySelector(".cart-profile-message");

  if (contactMessage) {
    contactMessage.textContent = state.activeProfile
      ? `Hola ${state.activeProfile.name}, la solicitud se enviará al correo ${state.activeProfile.email}.`
      : "La solicitud se enviará con los datos de tu perfil.";
  }

  if (cartContent) {
    if (state.cartItems.length === 0) {
      cartContent.innerHTML =
        '<p class="cart-empty-message">Tu carrito está vacío.</p>';
    } else {
      cartContent.innerHTML = `
        <div class="cart-items">
          ${state.cartItems
            .map(
              (item) => `
                <article class="cart-item">
                  ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : ""}
                  <div class="cart-item-details">
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${formatCurrency(item.price)} cada uno</p>
                    <strong>Subtotal: ${formatCurrency(item.price * item.quantity)}</strong>
                    <div class="cart-quantity-controls" aria-label="Cantidad de ${escapeHtml(item.name)}">
                      <button type="button" data-cart-minus="${escapeHtml(item.code)}" aria-label="Disminuir cantidad">-</button>
                      <span>${item.quantity}</span>
                      <button type="button" data-cart-plus="${escapeHtml(item.code)}" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <button type="button" data-cart-remove="${escapeHtml(item.code)}">Eliminar</button>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
        <button type="button" class="cart-clear-button" data-cart-clear>Vaciar carrito</button>
        <div class="cart-total">
          <span>Total</span>
          <strong>${formatCurrency(getCartTotal())}</strong>
        </div>
      `;
    }
  }

  if (cartItemsContainer) {
    const emptyMessage = document.querySelector("[data-cart-empty]");
    const totalElement = document.querySelector("[data-cart-total]");

    cartItemsContainer.innerHTML = "";

    if (state.cartItems.length === 0) {
      if (emptyMessage) emptyMessage.hidden = false;
      if (totalElement) totalElement.textContent = formatCurrency(0);
      return;
    }

    if (emptyMessage) emptyMessage.hidden = true;

    state.cartItems.forEach((product) => {
      const item = document.createElement("article");
      item.className = "cart-item";
      item.innerHTML = `
        ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">` : ""}
        <div class="cart-item-info">
          <h2>${escapeHtml(product.name)}</h2>
          <strong>${formatCurrency(product.price)}</strong>
          <div class="cart-item-actions">
            <button type="button" data-action="decrease" data-code="${escapeHtml(product.code)}" aria-label="Disminuir cantidad">−</button>
            <span>${product.quantity}</span>
            <button type="button" data-action="increase" data-code="${escapeHtml(product.code)}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="remove-cart-item" data-action="remove" data-code="${escapeHtml(product.code)}">Eliminar</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(item);
    });

    if (totalElement) {
      totalElement.textContent = formatCurrency(getCartTotal());
    }
  }
}

// =========================================================
// PANELES (CARRITO Y PERFIL)
// =========================================================

function openCart() {
  const panel = document.querySelector("#cart-panel");
  const overlay = document.querySelector(".cart-overlay");

  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.classList.add("is-visible");
  document.body.classList.add("cart-is-open");
}

function closeCart() {
  const panel = document.querySelector("#cart-panel");
  const overlay = document.querySelector(".cart-overlay");

  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("cart-is-open");
}

function openProfile() {
  const panel = document.querySelector("#profile-panel");
  const overlay = document.querySelector(".profile-overlay");

  if (typeof renderProfile === "function") renderProfile();
  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.classList.add("is-visible");
  document.body.classList.add("profile-is-open");
}

function closeProfile() {
  const panel = document.querySelector("#profile-panel");
  const overlay = document.querySelector(".profile-overlay");

  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("profile-is-open");
}

// =========================================================
// DETALLE DE PRODUCTO
// =========================================================

let currentDetailProduct = null;

function openProductDetail(card) {
  if (!card) return;

  const data = getProductData(card);
  const category = card.dataset.category || "";
  const description = card.querySelector(".product-content p")?.innerHTML || "";
  const stock = getProductStock(card);
  const quantity = findCartProduct(data.code)?.quantity || 0;
  const atLimit = stock > 0 && quantity >= stock;
  const outOfStock = stock <= 0;

  currentDetailProduct = data;

  const content = document.querySelector("#detail-content");
  if (content) {
    content.innerHTML = `
      <img src="${data.image}" alt="${escapeHtml(data.name)}" />
      <span class="detail-category">${escapeHtml(category)}</span>
      <h3>${escapeHtml(data.name)}</h3>
      <strong class="detail-price">${formatCurrency(data.price)}</strong>
      <p class="detail-description">${description}</p>
      <p class="detail-stock ${outOfStock ? "out-of-stock" : ""}">
        ${outOfStock ? "Sin stock disponible" : `Stock disponible: ${stock} unidades`}
      </p>
      <button type="button" class="add-cart-button" data-detail-add ${atLimit || outOfStock ? "disabled" : ""}>
        Agregar al carrito
      </button>
    `;
  }

  const panel = document.querySelector("#detail-panel");
  const overlay = document.querySelector(".detail-overlay");

  panel?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.classList.add("is-visible");
  document.body.classList.add("detail-is-open");
}

function closeProductDetail() {
  const panel = document.querySelector("#detail-panel");
  const overlay = document.querySelector(".detail-overlay");

  panel?.classList.remove("is-open");
  panel?.setAttribute("aria-hidden", "true");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("detail-is-open");
  currentDetailProduct = null;
}

// =========================================================
// FORMULARIO DE CONTACTO
// =========================================================

function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const message = document.querySelector("#cart-form-message");

  if (!state.activeProfile) {
    if (message) {
      message.textContent =
        "Necesitas iniciar sesión para enviar la solicitud.";
    }
    openProfile();
    return;
  }

  if (!state.cartItems.length) {
    if (message) {
      message.textContent = "Tu carrito está vacío.";
    }
    return;
  }

  applyStockDeduction(state.cartItems);

  if (message) {
    message.textContent =
      "Compra realizada con éxito. Nos pondremos en contacto contigo.";
  }

  form.reset();
  clearCart();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// Descuenta el stock comprado y lo persiste en ADMIN_PRODUCTS (localStorage).
function applyStockDeduction(cartItems) {
  const products = loadFromStorage(STORAGE_KEYS.ADMIN_PRODUCTS);
  let changed = false;

  cartItems.forEach((item) => {
    const product = products.find((entry) => entry.id === item.code);
    if (product) {
      product.stock = Math.max(0, Number(product.stock) - item.quantity);
      changed = true;
    }
  });

  if (changed) {
    saveToStorage(STORAGE_KEYS.ADMIN_PRODUCTS, products);
    syncAdminProducts();
  }
}

// =========================================================
// NOTIFICACIONES
// =========================================================

function showNotice(message, onConfirm = null) {
  const notice = document.querySelector("[data-cart-notice]");
  const messageElement = document.querySelector("[data-cart-notice-message]");
  const confirmButton = document.querySelector("[data-notice-confirm]");
  const cancelButton = document.querySelector("[data-notice-cancel]");

  if (!notice || !messageElement) return;

  messageElement.textContent = message;

  if (confirmButton) {
    confirmButton.hidden = !onConfirm;
    confirmButton.onclick = onConfirm || null;
  }

  if (cancelButton) {
    cancelButton.hidden = !onConfirm;
  }

  notice.hidden = false;
}

// =========================================================
// PRODUCTOS
// =========================================================

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.codigo = product.id;
  card.dataset.category = product.category;
  card.dataset.stock = product.stock;

  card.innerHTML = `
    <img class="product-image" src="img/logo.jpg" alt="${escapeHtml(product.name)}">
    <div class="product-content">
      <span class="product-category">${escapeHtml(product.category)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p>Producto veterinario administrado desde el catálogo de la clínica.</p>
      <div class="product-footer">
        <strong class="product-price">${formatCurrency(Number(product.price))}</strong>
        <button type="button" class="add-cart-button">Agregar al carrito</button>
      </div>
    </div>
  `;

  return card;
}

function syncAdminProducts() {
  let storedProducts;

  try {
    storedProducts = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADMIN_PRODUCTS) || "null",
    );
  } catch {
    return;
  }

  if (!Array.isArray(storedProducts)) return;

  const productsGrid = document.querySelector("#products-grid");
  const existingCodes = new Set();

  document.querySelectorAll(".product-card").forEach((card) => {
    const product = storedProducts.find(
      (item) => item.id === card.dataset.codigo,
    );

    if (!product) return;

    existingCodes.add(product.id);

    const title = card.querySelector("h3");
    const category = card.querySelector(".product-category");
    const price = card.querySelector(".product-price");

    if (title) title.textContent = product.name;
    if (category) category.textContent = product.category;
    if (price) price.textContent = formatCurrency(Number(product.price));

    card.dataset.category = product.category;
    card.dataset.stock = product.stock;
  });

  if (productsGrid) {
    storedProducts
      .filter((product) => !existingCodes.has(product.id))
      .forEach((product) => {
        productsGrid.appendChild(createProductCard(product));
      });
  }
}

function addStockLabel(card, quantity) {
  if (!card) return;

  const productContent = card.querySelector(".product-content");
  if (!productContent) return;

  let stockLabel = productContent.querySelector(".product-stock");

  if (!stockLabel) {
    stockLabel = document.createElement("p");
    stockLabel.className = "product-stock";
    const footer = productContent.querySelector(".product-footer");
    footer?.before(stockLabel);
  }

  const stock = getProductStock(card);
  stockLabel.textContent = `Stock disponible: ${stock} unidades`;
  stockLabel.classList.toggle("out-of-stock", quantity >= stock);
}

function renderProductQuantities() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const footer = card.querySelector(".product-footer");

    if (!footer || footer.querySelector(".product-quantity-controls")) return;

    const quantityControls = document.createElement("div");
    quantityControls.className = "product-quantity-controls";
    quantityControls.innerHTML = `
      <button type="button" data-product-action="decrease" aria-label="Quitar una unidad">−</button>
      <span data-product-quantity>0</span>
      <button type="button" data-product-action="increase" aria-label="Agregar una unidad">+</button>
    `;

    footer.appendChild(quantityControls);
  });
}

function updateProductQuantities() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const code = card.dataset.codigo;
    const product = findCartProduct(code);
    const quantity = product?.quantity || 0;

    const quantityElement = card.querySelector("[data-product-quantity]");
    if (quantityElement) quantityElement.textContent = quantity;

    addStockLabel(card, quantity);

    const increaseButton = card.querySelector(
      '[data-product-action="increase"]',
    );
    const addButton = card.querySelector(".add-cart-button");
    const atStockLimit = quantity >= getProductStock(card);

    if (increaseButton) increaseButton.disabled = atStockLimit;
    if (addButton) addButton.disabled = atStockLimit;
  });
}

// =========================================================
// FILTROS DE PRODUCTOS
// =========================================================

function applyProductFilters() {
  const selectedCategory =
    document.querySelector(".filter-btn.active")?.dataset.category || "todos";
  const selectedPrice =
    document.querySelector("[data-price-filter]")?.value || "todos";

  const cards = document.querySelectorAll(".product-card");
  let visibleProducts = 0;

  cards.forEach((card) => {
    const cardCategory =
      card.dataset.category ||
      card.querySelector(".product-category")?.textContent.trim() ||
      "";

    const categoryMatches =
      selectedCategory === "todos" ||
      cardCategory.toLowerCase() === selectedCategory.toLowerCase();

    const priceText = card.querySelector(".product-price")?.textContent || "0";
    const price = Number(priceText.replace(/[^0-9]/g, "")) || 0;

    let priceMatches = true;

    if (selectedPrice !== "todos") {
      const parts = selectedPrice.split("-");
      const minimum = Number(parts[0]) || 0;

      if (selectedPrice.endsWith("-mas")) {
        priceMatches = price >= minimum;
      } else {
        const maximum = Number(parts[1]) || 0;
        priceMatches = price >= minimum && price <= maximum;
      }
    }

    const isVisible = categoryMatches && priceMatches;
    card.classList.toggle("is-filtered-out", !isVisible);
    card.hidden = false;

    if (isVisible) visibleProducts++;
  });

  const result = document.querySelector("[data-filter-result]");
  if (result) {
    result.textContent = `${visibleProducts} producto${
      visibleProducts === 1 ? "" : "s"
    } encontrado${visibleProducts === 1 ? "" : "s"}`;
  }
}

function initializeProductFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const priceFilter = document.querySelector("[data-price-filter]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      applyProductFilters();
    });
  });

  priceFilter?.addEventListener("change", () => {
    applyProductFilters();
  });

  applyProductFilters();
}

// =========================================================
// FORMULARIO DE LA PÁGINA CONTÁCTANOS
// =========================================================

function initializeContactPage() {
  const formulario = document.querySelector("#form-contacto");
  if (!formulario) return;

  const identificacion = formulario.elements["identificacion"];
  const motivo = formulario.elements["motivo"];
  const mensajeInput = formulario.elements["mensaje"];
  const feedback = document.querySelector("#form-contacto-message");

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    identificacion.setCustomValidity("");
    motivo.setCustomValidity("");
    mensajeInput.setCustomValidity("");

    const valor = identificacion.value.trim();
    const esCorreoValido = isValidEmail(valor);
    const esTelefonoValido = isValidPhone(valor);

    if (!valor || (!esCorreoValido && !esTelefonoValido)) {
      identificacion.setCustomValidity(
        "Ingresa un correo permitido (@duoc.cl, @profesor.duoc.cl o @gmail.com) o un teléfono chileno válido.",
      );
      formulario.reportValidity();
      return;
    }

    if (!motivo.value) {
      motivo.setCustomValidity("Selecciona un motivo de contacto.");
      formulario.reportValidity();
      return;
    }

    if (!mensajeInput.value.trim()) {
      mensajeInput.setCustomValidity(
        "Escribe tu mensaje (máximo 500 caracteres).",
      );
      formulario.reportValidity();
      return;
    }

    if (feedback) {
      feedback.textContent =
        "Mensaje enviado correctamente. Te contactaremos pronto.";
    }

    formulario.reset();
  });
}

// =========================================================
// MÓDULO ADMINISTRATIVO
// =========================================================

function initializeAdminModule() {
  // Nota: el panel administrador (mantenedor de productos/usuarios) no se
  // construye en esta entrega. Esta función solo deja sembrados los datos
  // que sí usan las vistas públicas: el catálogo de productos y la sección
  // "El equipo" de la home.
  const readList = (key) => loadFromStorage(key);
  const saveList = (key, list) => saveToStorage(key, list);

  // PRODUCTOS INICIALES
  if (readList(STORAGE_KEYS.ADMIN_PRODUCTS).length === 0) {
    const initialProducts = [
      ["Amoxibay 250mg", "Antibióticos", 4200, 12],
      ["Enrox 50mg", "Antibióticos", 6800, 6],
      ["Metrobay 250mg", "Antibióticos", 3900, 18],
      ["Nexgard", "Antiparasitarios", 9500, 9],
      ["Bravecto", "Antiparasitarios", 18900, 25],
      ["Revolution Plus", "Antiparasitarios", 14500, 7],
      ["Drontal Plus", "Antiparasitarios", 3200, 14],
      ["Milbemax Gato", "Antiparasitarios", 6800, 4],
      ["Meloxicam 1mg", "Antiinflamatorios", 4500, 20],
      ["Carprofeno 50mg", "Antiinflamatorios", 9800, 8],
      ["Clorhexidina shampoo", "Dermatología", 8900, 16],
      ["Dermisol", "Dermatología", 7600, 10],
      ["Panalog", "Dermatología", 12500, 5],
      ["Enterex", "Digestivo", 6200, 11],
      ["Proviable", "Digestivo", 15500, 8],
      ["Cardial B", "Cardíaco", 22000, 6],
      ["Vetmedin", "Cardíaco", 35000, 4],
      ["Tramadol", "Analgésicos", 7200, 9],
      ["Gabapentina", "Analgésicos", 6400, 12],
      ["Vacuna antirrábica", "Vacunas", 12000, 15],
      ["Vacuna séxtuple", "Vacunas", 18000, 10],
      ["Omega 3", "Suplementos", 11500, 13],
    ].map(([name, category, price, stock], index) => ({
      id: `ME${String(index + 1).padStart(3, "0")}`,
      name,
      category,
      price,
      stock,
    }));

    saveList(STORAGE_KEYS.ADMIN_PRODUCTS, initialProducts);
  }

  // USUARIOS INICIALES
  if (readList(STORAGE_KEYS.ADMIN_USERS).length === 0) {
    saveList(STORAGE_KEYS.ADMIN_USERS, [
      {
        id: "USR001",
        name: "Carolina Quinan",
        email: "carolina@gmail.com",
        role: "Administrador",
        status: "Activo",
      },
      {
        id: "USR002",
        name: "Francisco Arce",
        email: "francisco@gmail.com",
        role: "Administrador",
        status: "Activo",
      },
      {
        id: "USR003",
        name: "Bayron Mena",
        email: "bayron@gmail.com",
        role: "Asistente",
        status: "Activo",
      },
    ]);
  }

  // USUARIOS HOME
  const homeUsers = document.querySelector("[data-home-users]");
  if (homeUsers) {
    const activeUsers = readList(STORAGE_KEYS.ADMIN_USERS).filter(
      (user) => user.status !== "Inactivo",
    );

    homeUsers.innerHTML = activeUsers
      .map((user) => {
        const initials = user.name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return `
          <article class="team-card">
            <div class="avatar" aria-hidden="true">${escapeHtml(initials)}</div>
            <h3>${escapeHtml(user.name)}</h3>
            <p class="role">${escapeHtml(user.role || "Equipo clínico")}</p>
            <p class="email">${escapeHtml(user.email)}</p>
          </article>
        `;
      })
      .join("");
  }
}

// =========================================================
// EVENTOS GENERALES
// =========================================================

function bindSiteEvents() {
  document.addEventListener("click", (event) => {
    const cartLink = event.target.closest(".carrito-compras");
    const profileLink = event.target.closest(".profile-link");
    const addButton = event.target.closest(".add-cart-button");
    const plusButton = event.target.closest("[data-cart-plus]");
    const minusButton = event.target.closest("[data-cart-minus]");
    const removeButton = event.target.closest("[data-cart-remove]");
    const clearButton = event.target.closest("[data-cart-clear]");
    const productAction = event.target.closest("[data-product-action]");
    const cartAction = event.target.closest("[data-action]");
    const closeButton = event.target.closest("[data-cart-close]");
    const profileCloseButton = event.target.closest("[data-profile-close]");
    const registerButton = event.target.closest(
      "[data-profile-view='register']",
    );
    const loginButton = event.target.closest("[data-profile-view='login']");
    const logoutButton = event.target.closest("[data-profile-logout]");
    const viewDetailButton = event.target.closest("[data-view-detail]");
    const detailCloseButton = event.target.closest("[data-detail-close]");
    const detailAddButton = event.target.closest("[data-detail-add]");

    if (profileLink) {
      event.preventDefault();
      openProfile();
      return;
    }

    if (cartLink) {
      event.preventDefault();
      openCart();
      return;
    }

    if (detailAddButton) {
      if (currentDetailProduct) {
        const added = addProduct(currentDetailProduct);
        if (added) {
          const card = [...document.querySelectorAll(".product-card")].find(
            (item) => item.dataset.codigo === currentDetailProduct.code,
          );
          openProductDetail(card);
          openCart();
        }
      }
      return;
    }

    if (addButton) {
      const card = addButton.closest(".product-card");
      if (card) {
        const added = addProductFromCard(card);
        if (added) {
          addButton.textContent = "Agregado";
          setTimeout(() => {
            if (document.body.contains(addButton)) {
              addButton.textContent = "Agregar al carrito";
            }
          }, 1200);
          openCart();
        }
      }
      return;
    }

    if (plusButton) {
      changeQuantity(plusButton.dataset.cartPlus, 1);
      return;
    }

    if (minusButton) {
      changeQuantity(minusButton.dataset.cartMinus, -1);
      return;
    }

    if (removeButton) {
      removeCartProduct(removeButton.dataset.cartRemove);
      return;
    }

    if (clearButton) {
      clearCart();
      return;
    }

    if (productAction) {
      const card = productAction.closest(".product-card");
      if (!card) return;

      const action = productAction.dataset.productAction;
      const code = card.dataset.codigo;

      if (action === "increase") {
        addProductFromCard(card);
      } else if (action === "decrease") {
        changeQuantity(code, -1);
      }
      return;
    }

    if (cartAction) {
      const code = cartAction.dataset.code;
      const action = cartAction.dataset.action;

      if (action === "remove") {
        removeCartProduct(code);
      } else if (action === "increase") {
        changeQuantity(code, 1);
      } else if (action === "decrease") {
        changeQuantity(code, -1);
      }
      return;
    }

    if (closeButton) {
      closeCart();
      return;
    }

    if (profileCloseButton) {
      closeProfile();
      return;
    }

    if (registerButton) {
      if (typeof showProfileView === "function") showProfileView("register");
      return;
    }

    if (loginButton) {
      if (typeof showProfileView === "function") showProfileView("login");
      return;
    }

    if (logoutButton) {
      if (typeof logoutProfile === "function") logoutProfile();
      return;
    }

    if (viewDetailButton) {
      const card = viewDetailButton.closest(".product-card");
      if (card) openProductDetail(card);
      return;
    }

    if (detailCloseButton) {
      closeProductDetail();
      return;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeProfile();
      closeProductDetail();
    }
  });

  document
    .querySelector("#cart-contact-form")
    ?.addEventListener("submit", handleContactSubmit);

  if (typeof handleLoginSubmit === "function") {
    document
      .querySelector("#login-form")
      ?.addEventListener("submit", handleLoginSubmit);
  }

  if (typeof handleRegisterSubmit === "function") {
    document
      .querySelector("#register-form")
      ?.addEventListener("submit", handleRegisterSubmit);
  }

  const hideNotice = () => {
    const notice = document.querySelector("[data-cart-notice]");
    if (notice) notice.hidden = true;
  };

  document
    .querySelector("[data-notice-close]")
    ?.addEventListener("click", hideNotice);
  document
    .querySelector("[data-notice-cancel]")
    ?.addEventListener("click", hideNotice);
  document
    .querySelector("[data-clear-cart]")
    ?.addEventListener("click", () => clearCart());

  document.querySelector("[data-pay-cart]")?.addEventListener("click", () => {
    if (state.cartItems.length === 0) {
      showNotice("Agrega al menos un producto antes de pagar.");
      return;
    }

    const total = getCartTotal();
    showNotice(
      `El total de tu compra es ${formatCurrency(total)}. ¿Deseas continuar con el pago?`,
      () => {
        clearCart();
        showNotice("Pago iniciado correctamente. ¡Gracias por tu compra!");
      },
    );
  });
}

function initializeProducts() {
  syncAdminProducts();
  renderProductQuantities();
  updateProductQuantities();
  updateCartCounter();
  renderCart();
  initializeProductFilters();
}

// =========================================================
// INICIALIZACIÓN GENERAL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeState();
  initializeRegionComunaSelects();
  renderCart();
  updateCartCounter();
  if (typeof renderProfile === "function") renderProfile();
  bindSiteEvents();
  initializeContactPage();
  initializeAdminModule();
  initializeProducts();
});
