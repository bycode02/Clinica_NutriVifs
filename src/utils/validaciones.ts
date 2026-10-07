import type { KeyboardEvent } from "react";

// Reglas de validación compartidas por login, registro, agendar y contacto.

export const RUT_FORMATO_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/;
export const CORREO_AGENDAMIENTO_REGEX =
  /^[A-Za-z0-9]{1,24}@(gmail\.com|profesor\.duoc\.cl|duoc\.cl)$/;
export const TELEFONO_AGENDAMIENTO_REGEX = /^\+56\d{9}$/;
export const ANIO_MAXIMO_NACIMIENTO = 2012; // Nacido este año o antes = 14+ años.

export function normalizeEmail(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// Estos son los dominios aceptados por los formularios de la clínica.
export function isValidEmail(email: string) {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(
    normalizeEmail(email),
  );
}

// Teléfono chileno: +56 seguido de 9 dígitos, o 9 dígitos que empiezan en 9.
export function isValidPhone(phone: string) {
  const value = String(phone || "").replace(/\s/g, "");
  return /^(\+?56)?9\d{8}$/.test(value);
}

export function isValidPassword(password: string) {
  const value = String(password || "");
  return value.length >= 4 && value.length <= 13 && /[A-Z]/.test(value);
}

export function isValidRut(rut: string) {
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

export function normalizeRut(rut: string) {
  return String(rut || "")
    .replace(/[.\-\s]/g, "")
    .toUpperCase();
}

// Formatea en vivo mientras se escribe: 12.345.678-9
export function formatearRut(valor: string) {
  const limpio = String(valor || "")
    .toUpperCase()
    .replace(/[^0-9K]/g, "")
    .slice(0, 9);

  if (limpio.length <= 1) return limpio;

  const dv = limpio.slice(-1);
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpo}-${dv}`;
}

// El "+" queda fijo; el usuario solo escribe números (máx. 11).
export function formatearTelefono(valor: string) {
  const soloDigitos = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);
  return soloDigitos ? `+${soloDigitos}` : "+";
}

export function isValidBirthDate(fechaNacimiento: string) {
  if (!fechaNacimiento) return false;

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return false;

  return nacimiento.getFullYear() <= ANIO_MAXIMO_NACIMIENTO;
}

export function isTodayOrFutureDate(dateValue: string) {
  if (!dateValue) return false;

  const selected = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected.getTime() >= today.getTime();
}

export function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
}

const TECLAS_NAVEGACION = [
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
];

// Bloquea teclas que no calzan con el patrón (para RUT y teléfono).
export function soloTeclas(patron: RegExp) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey) return;
    if (TECLAS_NAVEGACION.includes(event.key)) return;
    if (!patron.test(event.key)) event.preventDefault();
  };
}

export const claseCampo = (mensaje?: string) =>
  mensaje ? "campo-invalido" : undefined;

export const MENSAJES = {
  correoAgendamiento:
    "Correo inválido. Máx. 24 letras/números antes de @, y solo @gmail.com, @duoc.cl o @profesor.duoc.cl.",
  telefono: "Teléfono inválido. Solo números, con el formato +56934020512.",
  nacimiento: `Debes haber nacido el año ${ANIO_MAXIMO_NACIMIENTO} o antes (mínimo 14 años).`,
  password:
    "La contraseña debe tener entre 4 y 13 caracteres y al menos una mayúscula.",
  requerido: "Completa este campo.",
  seleccion: "Selecciona una opción de la lista.",
};
