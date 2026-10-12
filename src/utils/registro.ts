import { CORREO_AGENDAMIENTO_REGEX, MENSAJES, TELEFONO_AGENDAMIENTO_REGEX, isValidBirthDate, isValidPassword, normalizeEmail } from "./validaciones";
export const INICIAL = {
  name: "",
  apellido: "",
  email: "",
  phone: "+",
  birthDate: "",
  direccion: "",
  region: "",
  comuna: "",
  genero: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
};

export type Campos = typeof INICIAL;
type Errores = Partial<Record<keyof Campos, string>>;

// Mismas reglas que "Agendar consulta"; deja el error bajo cada campo.
export function validarRegistro(datos: Campos): Errores {
  const errores: Errores = {};
  const requeridos: (keyof Campos)[] = [
    "name",
    "apellido",
    "email",
    "birthDate",
    "direccion",
    "password",
    "confirmPassword",
  ];
  requeridos.forEach((campo) => {
    if (!String(datos[campo]).trim()) errores[campo] = MENSAJES.requerido;
  });
  (["region", "comuna", "genero"] as const).forEach((campo) => {
    if (!datos[campo]) errores[campo] = MENSAJES.seleccion;
  });

  if (!datos.name.trim()) errores.name = "El nombre es obligatorio.";
  if (!datos.apellido.trim()) errores.apellido = "El apellido es obligatorio.";
  if (!CORREO_AGENDAMIENTO_REGEX.test(normalizeEmail(datos.email))) {
    errores.email = MENSAJES.correoAgendamiento;
  }
  if (!isValidBirthDate(datos.birthDate)) errores.birthDate = MENSAJES.nacimiento;
  if (
    datos.phone &&
    datos.phone !== "+" &&
    !TELEFONO_AGENDAMIENTO_REGEX.test(datos.phone)
  ) {
    errores.phone = MENSAJES.telefono;
  }
  if (!isValidPassword(datos.password)) errores.password = MENSAJES.password;
  if (datos.confirmPassword !== datos.password) {
    errores.confirmPassword = "La confirmación de contraseña no coincide.";
  }
  if (!datos.aceptaTerminos) {
    errores.aceptaTerminos = "Debes aceptar las condiciones de registro.";
  }
  return errores;
}

