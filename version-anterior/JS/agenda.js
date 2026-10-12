// =========================================================
// CONSULTAS Y AGENDAMIENTO
// =========================================================

function isValidRut(rut) {
  rut = String(rut || "")
    .trim()
    .toUpperCase();

  if (!/^\d{6,8}[0-9K]$/.test(rut)) return false;

  const digits = rut.slice(0, -1).split("").reverse();
  const verifier = rut.at(-1) === "K" ? -1 : Number(rut.at(-1));

  let multiplier = 2;
  let sum = 0;

  digits.forEach((digit) => {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  });

  const expected = 11 - (sum % 11);
  const calculated = expected === 11 ? 0 : expected === 10 ? -1 : expected;

  return calculated === verifier;
}

function normalizeRut(rut) {
  return String(rut || "")
    .replace(/[.\-\s]/g, "")
    .toUpperCase();
}

// Formatea en vivo mientras se escribe: 12.345.678-9
function formatearRut(valor) {
  const limpio = String(valor || "")
    .toUpperCase()
    .replace(/[^0-9K]/g, "")
    .slice(0, 9);

  if (limpio.length <= 1) return limpio;

  const dv = limpio.slice(-1);
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpo}-${dv}`;
}

const RUT_FORMATO_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/;
const CORREO_AGENDAMIENTO_REGEX =
  /^[A-Za-z0-9]{1,24}@(gmail\.com|profesor\.duoc\.cl|duoc\.cl)$/;
const TELEFONO_AGENDAMIENTO_REGEX = /^\+56\d{9}$/;
const ANIO_MAXIMO_NACIMIENTO = 2012; // Nacido este año o antes = 14+ años.

function isValidBirthDate(fechaNacimiento) {
  if (!fechaNacimiento) return false;

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return false;

  return nacimiento.getFullYear() <= ANIO_MAXIMO_NACIMIENTO;
}

function isTodayOrFutureDate(dateValue) {
  if (!dateValue) return false;

  const selected = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
}

// Muestra/oculta el mensaje de error dentro de la propia casilla
// (en vez de depender solo del tooltip nativo del navegador).
function mostrarErrorCampo(campo, mensaje) {
  if (!campo) return;
  // Si el campo está envuelto en ".campo-formulario" (agendar consulta), el
  // mensaje se agrega dentro de ese contenedor. Si no (ej: formulario de
  // registro, sin ese contenedor), se agrega justo debajo del propio campo.
  const contenedor = campo.closest(".campo-formulario");
  let error = contenedor
    ? contenedor.querySelector(".campo-error")
    : campo.nextElementSibling?.classList?.contains("campo-error")
      ? campo.nextElementSibling
      : null;

  if (mensaje && !error) {
    error = document.createElement("small");
    error.className = "campo-error";
    if (contenedor) {
      contenedor.appendChild(error);
    } else {
      campo.insertAdjacentElement("afterend", error);
    }
  }

  if (error) error.textContent = mensaje || "";
  campo.classList.toggle("campo-invalido", Boolean(mensaje));
}

function limpiarErroresCampos(formulario) {
  formulario.querySelectorAll(".campo-error").forEach((el) => el.remove());
  formulario
    .querySelectorAll(".campo-invalido")
    .forEach((el) => el.classList.remove("campo-invalido"));
}

function initializeConsultas() {
  const modalAgendamiento = document.getElementById("modal-agendamiento");
  const botonesAgendar = document.querySelectorAll(".btn-abrir-modal");
  const botonCerrarModal = document.querySelector(".cerrar-modal");
  const textoServicio = document.getElementById("texto-servicio-seleccionado");
  const formAgendar = document.getElementById("form-agendar");
  const inputFecha = document.getElementById("fecha-cita");

  if (inputFecha) {
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
  }

  if (botonesAgendar.length > 0 && modalAgendamiento) {
    botonesAgendar.forEach((boton) => {
      boton.addEventListener("click", () => {
        const servicio = boton.dataset.servicio || "Consulta General";
        if (textoServicio) textoServicio.textContent = `Servicio: ${servicio}`;
        modalAgendamiento.style.display = "block";
      });
    });
  } else if (botonesAgendar.length > 0) {
    botonesAgendar.forEach((boton) => {
      boton.addEventListener("click", () => {
        const consulta = encodeURIComponent(
          boton.dataset.servicio || "general",
        );
        window.open(`agendar.html?consulta=${consulta}`, "_blank", "noopener");
      });
    });
  }

  botonCerrarModal?.addEventListener("click", () => {
    if (modalAgendamiento) modalAgendamiento.style.display = "none";
  });

  if (modalAgendamiento) {
    window.addEventListener("click", (event) => {
      if (event.target === modalAgendamiento) {
        modalAgendamiento.style.display = "none";
      }
    });
  }

  formAgendar?.addEventListener("submit", (event) => {
    event.preventDefault();

    const fechaInput = document.getElementById("fecha-cita");
    const horaInput = document.getElementById("hora-cita");
    const appointmentMessage = document.getElementById("appointment-message");

    fechaInput?.setCustomValidity("");

    if (fechaInput && !isTodayOrFutureDate(fechaInput.value)) {
      fechaInput.setCustomValidity("La fecha no puede ser anterior a hoy.");
    }

    if (!formAgendar.checkValidity()) {
      formAgendar.reportValidity();
      return;
    }

    const fecha = fechaInput?.value;
    const hora = horaInput?.value;

    if (appointmentMessage) {
      appointmentMessage.textContent = `Cita solicitada para el ${fecha} a las ${hora}.`;
    }

    if (modalAgendamiento) modalAgendamiento.style.display = "none";
    formAgendar.reset();
    fechaInput?.setCustomValidity("");
  });
}

function initializeAppointment() {
  const formulario = document.getElementById("appointment-form");
  const mensaje = document.getElementById("appointment-message");
  const tipoConsulta = document.getElementById("tipo-consulta");
  const especie = document.getElementById("especie");
  const otraEspecieContenedor = document.getElementById(
    "otra-especie-contenedor",
  );
  const otraEspecie = document.getElementById("otra-especie");

  if (
    !formulario ||
    !mensaje ||
    !tipoConsulta ||
    !especie ||
    !otraEspecieContenedor ||
    !otraEspecie
  ) {
    return;
  }

  const actualizarOtraEspecie = () => {
    const mostrar = especie.value === "otro";
    otraEspecieContenedor.hidden = !mostrar;
    otraEspecie.required = mostrar;
    if (!mostrar) otraEspecie.value = "";
  };

  especie.addEventListener("change", actualizarOtraEspecie);
  actualizarOtraEspecie();

  // El calendario de fecha de nacimiento solo permite años 2012 o anteriores.
  const fechaNacimientoInputVivo = formulario.elements["fecha-nacimiento"];
  if (fechaNacimientoInputVivo) {
    fechaNacimientoInputVivo.max = `${ANIO_MAXIMO_NACIMIENTO}-12-31`;
  }

  // Formateo en vivo de RUT y teléfono mientras el usuario escribe.
  const rutInputVivo = formulario.elements["rut"];
  const telefonoInputVivo = formulario.elements["telefono"];

  // Bloquea cualquier tecla que no sea parte de un RUT (0-9, k/K, . y -).
  rutInputVivo?.addEventListener("keydown", (event) => {
    const teclasPermitidas = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (teclasPermitidas.includes(event.key)) return;
    if (!/^[0-9kK.\-]$/.test(event.key)) {
      event.preventDefault();
    }
  });

  rutInputVivo?.addEventListener("input", () => {
    rutInputVivo.value = formatearRut(rutInputVivo.value);
  });

  // El "+" queda fijo por defecto; el usuario solo escribe números.
  if (telefonoInputVivo && !telefonoInputVivo.value) {
    telefonoInputVivo.value = "+";
  }

  telefonoInputVivo?.addEventListener("keydown", (event) => {
    const teclasPermitidas = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (teclasPermitidas.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  });

  telefonoInputVivo?.addEventListener("input", () => {
    const soloDigitos = telefonoInputVivo.value.replace(/\D/g, "").slice(0, 11);
    telefonoInputVivo.value = soloDigitos ? `+${soloDigitos}` : "+";
  });

  // Intercepta la validación nativa de cada campo requerido para mostrar
  // el mensaje de error dentro de la casilla en lugar del tooltip nativo.
  formulario.querySelectorAll("input, select, textarea").forEach((campo) => {
    campo.addEventListener("invalid", (event) => {
      event.preventDefault();
      mostrarErrorCampo(campo, campo.validationMessage);
    });
    campo.addEventListener("input", () => mostrarErrorCampo(campo, ""));
    campo.addEventListener("change", () => mostrarErrorCampo(campo, ""));
  });

  const consultaNormalizada = (
    new URLSearchParams(window.location.search).get("consulta") || ""
  ).toLowerCase();

  if (consultaNormalizada.includes("urgencia")) {
    tipoConsulta.value = "urgencia";
  } else if (
    consultaNormalizada.includes("vacuna") ||
    consultaNormalizada.includes("antirrabica") ||
    consultaNormalizada.includes("felina") ||
    consultaNormalizada.includes("canina")
  ) {
    tipoConsulta.value = "vacunacion";
  } else if (consultaNormalizada.includes("desparas")) {
    tipoConsulta.value = "desparasitacion";
  } else if (consultaNormalizada.includes("general")) {
    tipoConsulta.value = "general";
  }

  const validarAgendamiento = () => {
    const rutInput = formulario.elements["rut"];
    const fechaNacimientoInput = formulario.elements["fecha-nacimiento"];
    const correoInput = formulario.elements["correo"];
    const telefonoInput = formulario.elements["telefono"];
    const fechaInput = formulario.elements["fecha"];

    [rutInput, fechaNacimientoInput, correoInput, telefonoInput, fechaInput].forEach(
      (campo) => campo.setCustomValidity(""),
    );

    if (
      !RUT_FORMATO_REGEX.test(rutInput.value) ||
      !isValidRut(normalizeRut(rutInput.value))
    ) {
      rutInput.setCustomValidity(
        "RUT inválido. Debe tener 7 u 8 números y un dígito verificador (0-9 o K), con el formato 12.345.678-5.",
      );
      return rutInput;
    }

    if (!isValidBirthDate(fechaNacimientoInput.value)) {
      fechaNacimientoInput.setCustomValidity(
        `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`,
      );
      return fechaNacimientoInput;
    }

    if (!CORREO_AGENDAMIENTO_REGEX.test(correoInput.value)) {
      correoInput.setCustomValidity(
        "Correo inválido. Máx. 24 letras/números antes de @, y solo @gmail.com, @duoc.cl o @profesor.duoc.cl.",
      );
      return correoInput;
    }

    if (!TELEFONO_AGENDAMIENTO_REGEX.test(telefonoInput.value)) {
      telefonoInput.setCustomValidity(
        "Teléfono inválido. Solo números, con el formato +56934020512.",
      );
      return telefonoInput;
    }

    if (!isTodayOrFutureDate(fechaInput.value)) {
      fechaInput.setCustomValidity(
        "La fecha preferida no puede ser anterior a hoy.",
      );
      return fechaInput;
    }

    return null;
  };

  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const campoInvalido = validarAgendamiento();

    if (campoInvalido || !formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    limpiarErroresCampos(formulario);
    mensaje.textContent =
      "Solicitud enviada. Nos pondremos en contacto contigo para confirmar.";
    formulario.reset();
    actualizarOtraEspecie();
    if (telefonoInputVivo) telefonoInputVivo.value = "+";
  });
}

// Valida los campos del formulario de registro con el mismo criterio que
// "Agendar consulta" y deja el mensaje de error en el campo correspondiente
// (vía setCustomValidity). Devuelve el primer campo inválido, o null.
function validarRegistro(formulario) {
  const nombreInput = formulario.elements["name"];
  const apellidoInput = formulario.elements["apellido"];
  const correoInput = formulario.elements["email"];
  const fechaNacimientoInput = formulario.elements["birthDate"];
  const telefonoInput = formulario.elements["phone"];
  const passwordInput = formulario.elements["password"];
  const confirmPasswordInput = formulario.elements["confirmPassword"];

  [
    nombreInput,
    apellidoInput,
    correoInput,
    fechaNacimientoInput,
    telefonoInput,
    passwordInput,
    confirmPasswordInput,
  ].forEach((campo) => campo?.setCustomValidity(""));

  if (nombreInput && !nombreInput.value.trim()) {
    nombreInput.setCustomValidity("El nombre es obligatorio.");
    return nombreInput;
  }

  if (apellidoInput && !apellidoInput.value.trim()) {
    apellidoInput.setCustomValidity("El apellido es obligatorio.");
    return apellidoInput;
  }

  if (correoInput && !CORREO_AGENDAMIENTO_REGEX.test(normalizeEmail(correoInput.value))) {
    correoInput.setCustomValidity(
      "Correo inválido. Máx. 24 letras/números antes de @, y solo @gmail.com, @duoc.cl o @profesor.duoc.cl.",
    );
    return correoInput;
  }

  if (fechaNacimientoInput && !isValidBirthDate(fechaNacimientoInput.value)) {
    fechaNacimientoInput.setCustomValidity(
      `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`,
    );
    return fechaNacimientoInput;
  }

  if (
    telefonoInput &&
    telefonoInput.value &&
    telefonoInput.value !== "+" &&
    !TELEFONO_AGENDAMIENTO_REGEX.test(telefonoInput.value)
  ) {
    telefonoInput.setCustomValidity(
      "Teléfono inválido. Solo números, con el formato +56934020512.",
    );
    return telefonoInput;
  }

  if (passwordInput && !isValidPassword(passwordInput.value)) {
    passwordInput.setCustomValidity(
      "La contraseña debe tener entre 4 y 13 caracteres y al menos una mayúscula.",
    );
    return passwordInput;
  }

  if (
    confirmPasswordInput &&
    passwordInput &&
    confirmPasswordInput.value !== passwordInput.value
  ) {
    confirmPasswordInput.setCustomValidity(
      "La confirmación de contraseña no coincide.",
    );
    return confirmPasswordInput;
  }

  return null;
}

// Aplica al formulario de registro ("Perfil") el mismo formateo en vivo
// y los mismos mensajes de error en casilla que ya usa "Agendar consulta".
function initializeRegisterForms() {
  document
    .querySelectorAll("#register-form, #standalone-register-form")
    .forEach((formulario) => {
      const fechaNacimientoInput = formulario.elements["birthDate"];
      if (fechaNacimientoInput) {
        fechaNacimientoInput.max = `${ANIO_MAXIMO_NACIMIENTO}-12-31`;
      }

      const telefonoInput = formulario.elements["phone"];
      if (telefonoInput && !telefonoInput.value) {
        telefonoInput.value = "+";
      }

      telefonoInput?.addEventListener("keydown", (event) => {
        const teclasPermitidas = [
          "Backspace",
          "Delete",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ];
        if (teclasPermitidas.includes(event.key)) return;
        if (!/^[0-9]$/.test(event.key)) {
          event.preventDefault();
        }
      });

      telefonoInput?.addEventListener("input", () => {
        const soloDigitos = telefonoInput.value.replace(/\D/g, "").slice(0, 11);
        telefonoInput.value = soloDigitos ? `+${soloDigitos}` : "+";
      });

      formulario.querySelectorAll("input, select, textarea").forEach((campo) => {
        campo.addEventListener("invalid", (event) => {
          event.preventDefault();
          mostrarErrorCampo(campo, campo.validationMessage);
        });
        campo.addEventListener("input", () => mostrarErrorCampo(campo, ""));
        campo.addEventListener("change", () => mostrarErrorCampo(campo, ""));
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeConsultas();
  initializeAppointment();
  initializeRegisterForms();
});
