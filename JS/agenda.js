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

function isTodayOrFutureDate(dateValue) {
  if (!dateValue) return false;

  const selected = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
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
    const correoInput = formulario.elements["correo"];
    const telefonoInput = formulario.elements["telefono"];
    const fechaInput = formulario.elements["fecha"];

    rutInput.setCustomValidity("");
    correoInput.setCustomValidity("");
    telefonoInput.setCustomValidity("");
    fechaInput.setCustomValidity("");

    if (!isValidRut(normalizeRut(rutInput.value))) {
      rutInput.setCustomValidity(
        "Ingresa un RUT chileno válido, con o sin puntos y guion (ej: 12.345.678-5).",
      );
      return rutInput;
    }

    if (!isValidEmail(correoInput.value)) {
      correoInput.setCustomValidity(
        "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.",
      );
      return correoInput;
    }

    if (!isValidPhone(telefonoInput.value)) {
      telefonoInput.setCustomValidity(
        "Ingresa un teléfono chileno válido (ej: +56 9 1234 5678).",
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

    mensaje.textContent =
      "Solicitud enviada. Nos pondremos en contacto contigo para confirmar.";
    formulario.reset();
    actualizarOtraEspecie();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeConsultas();
  initializeAppointment();
});
