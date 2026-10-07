import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { CampoError } from "../components/CampoError";
import { useApp, type Profile } from "../context/AppContext";
import { REGIONES_COMUNAS } from "../data/regiones";
import { usePage } from "../hooks/usePage";
import {
  ANIO_MAXIMO_NACIMIENTO,
  CORREO_AGENDAMIENTO_REGEX,
  MENSAJES,
  TELEFONO_AGENDAMIENTO_REGEX,
  claseCampo,
  formatearTelefono,
  isValidBirthDate,
  isValidPassword,
  normalizeEmail,
  soloTeclas,
} from "../utils/validaciones";

const INICIAL = {
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

type Campos = typeof INICIAL;
type Errores = Partial<Record<keyof Campos, string>>;

// Mismas reglas que "Agendar consulta"; deja el error bajo cada campo.
function validarRegistro(datos: Campos): Errores {
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

export const Registro = () => {
  usePage("Registro | Clínica NutriDifs", "auth-page");
  const { profiles, saveProfiles, startSession } = useApp();
  const navigate = useNavigate();
  const [datos, setDatos] = useState<Campos>(INICIAL);
  const [errores, setErrores] = useState<Errores>({});
  const [message, setMessage] = useState("");
  const comunas = REGIONES_COMUNAS[datos.region] || [];

  const actualizar = (campo: keyof Campos, valor: string | boolean) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    if (name === "region") {
      setDatos((actual) => ({ ...actual, region: value, comuna: "" }));
      setErrores((actual) => ({ ...actual, region: undefined }));
      return;
    }
    actualizar(name as keyof Campos, value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nuevosErrores = validarRegistro(datos);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) {
      setMessage("Revisa los campos marcados en rojo.");
      return;
    }

    const email = normalizeEmail(datos.email);
    const emailAlreadyUsed = profiles.some((item) => item.email === email);
    const passwordAlreadyUsed = profiles.some(
      (item) => item.password === datos.password,
    );

    if (emailAlreadyUsed || passwordAlreadyUsed) {
      setMessage(
        emailAlreadyUsed
          ? "Ese correo ya está registrado."
          : "Esa contraseña ya está en uso.",
      );
      return;
    }

    const profile: Profile = {
      name: datos.name.trim(),
      apellido: datos.apellido.trim(),
      email,
      birthDate: datos.birthDate,
      direccion: datos.direccion.trim(),
      genero: datos.genero,
      phone: datos.phone === "+" ? "" : datos.phone,
      region: datos.region,
      comuna: datos.comuna,
      password: datos.password,
      failedAttempts: 0,
      locked: false,
    };

    saveProfiles([...profiles, profile]);
    startSession(profile);
    navigate("/");
  };

  return (
    <main className="auth-card">
      <Link className="auth-brand" to="/">
        Clínica NutriDifs
      </Link>
      <span className="auth-eyebrow">NUEVO CLIENTE</span>
      <h1>Crear cuenta</h1>
      <p className="auth-description">
        Regístrate para gestionar tus datos y solicitar atención veterinaria.
      </p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="reg-standalone-name">Nombre</label>
        <input
          type="text"
          id="reg-standalone-name"
          autoComplete="given-name"
          name="name"
          maxLength={100}
          className={claseCampo(errores.name)}
          value={datos.name}
          onChange={onChange}
        />
        <CampoError mensaje={errores.name} />

        <label htmlFor="reg-standalone-apellido">Apellido</label>
        <input
          type="text"
          id="reg-standalone-apellido"
          autoComplete="family-name"
          name="apellido"
          maxLength={100}
          className={claseCampo(errores.apellido)}
          value={datos.apellido}
          onChange={onChange}
        />
        <CampoError mensaje={errores.apellido} />

        <label htmlFor="reg-standalone-email">Correo institucional</label>
        <input
          type="text"
          inputMode="email"
          id="reg-standalone-email"
          autoComplete="email"
          name="email"
          placeholder="usuario@duoc.cl"
          maxLength={42}
          className={claseCampo(errores.email)}
          value={datos.email}
          onChange={onChange}
        />
        <CampoError mensaje={errores.email} />

        <label htmlFor="reg-standalone-phone">Teléfono (opcional)</label>
        <input
          type="tel"
          id="reg-standalone-phone"
          autoComplete="tel"
          name="phone"
          placeholder="+56934040042"
          maxLength={12}
          className={claseCampo(errores.phone)}
          value={datos.phone}
          onKeyDown={soloTeclas(/^[0-9]$/)}
          onChange={(event) =>
            actualizar("phone", formatearTelefono(event.target.value))
          }
        />
        <CampoError mensaje={errores.phone} />

        <label htmlFor="reg-standalone-birth">Fecha de nacimiento</label>
        {/* Nacimiento debe ser el año 2012 o antes (mínimo 14 años). */}
        <input
          type="date"
          id="reg-standalone-birth"
          autoComplete="bday"
          name="birthDate"
          max={`${ANIO_MAXIMO_NACIMIENTO}-12-31`}
          className={claseCampo(errores.birthDate)}
          value={datos.birthDate}
          onChange={onChange}
        />
        <CampoError mensaje={errores.birthDate} />

        <label htmlFor="reg-standalone-direccion">Dirección</label>
        <input
          type="text"
          id="reg-standalone-direccion"
          autoComplete="street-address"
          name="direccion"
          className={claseCampo(errores.direccion)}
          value={datos.direccion}
          onChange={onChange}
        />
        <CampoError mensaje={errores.direccion} />

        <label htmlFor="reg-standalone-region">Región</label>
        <select
          id="reg-standalone-region"
          autoComplete="address-level1"
          name="region"
          className={claseCampo(errores.region)}
          value={datos.region}
          onChange={onChange}
        >
          <option value="">-- Selecciona la región --</option>
          {Object.keys(REGIONES_COMUNAS).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <CampoError mensaje={errores.region} />

        <label htmlFor="reg-standalone-comuna">Comuna</label>
        <select
          id="reg-standalone-comuna"
          autoComplete="address-level2"
          name="comuna"
          disabled={comunas.length === 0}
          className={claseCampo(errores.comuna)}
          value={datos.comuna}
          onChange={onChange}
        >
          <option value="">
            {comunas.length
              ? "-- Selecciona la comuna --"
              : "Selecciona primero una región"}
          </option>
          {comunas.map((comuna) => (
            <option key={comuna} value={comuna}>
              {comuna}
            </option>
          ))}
        </select>
        <CampoError mensaje={errores.comuna} />

        <label htmlFor="reg-standalone-genero">Género</label>
        <select
          id="reg-standalone-genero"
          name="genero"
          className={claseCampo(errores.genero)}
          value={datos.genero}
          onChange={onChange}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
          <option value="otro">Otro</option>
          <option value="prefiero-no-decir">Prefiero no decir</option>
        </select>
        <CampoError mensaje={errores.genero} />

        <label htmlFor="reg-standalone-pass">Contraseña</label>
        <input
          type="password"
          id="reg-standalone-pass"
          autoComplete="new-password"
          name="password"
          className={claseCampo(errores.password)}
          value={datos.password}
          onChange={onChange}
        />
        <CampoError mensaje={errores.password} />

        <label htmlFor="reg-standalone-confirm-pass">Confirmar contraseña</label>
        <input
          type="password"
          id="reg-standalone-confirm-pass"
          autoComplete="new-password"
          name="confirmPassword"
          className={claseCampo(errores.confirmPassword)}
          value={datos.confirmPassword}
          onChange={onChange}
        />
        <CampoError mensaje={errores.confirmPassword} />
        <small>Debe tener entre 4 y 13 caracteres y al menos una mayúscula.</small>

        <label className="auth-checkbox">
          <input
            type="checkbox"
            id="reg-standalone-terminos"
            name="aceptaTerminos"
            checked={datos.aceptaTerminos}
            onChange={(event) =>
              actualizar("aceptaTerminos", event.target.checked)
            }
          />
          Acepto los términos y condiciones de registro.
        </label>
        <CampoError mensaje={errores.aceptaTerminos} />

        <button type="submit" className="btn-primary">
          Registrarme
        </button>
        <p className="profile-message" role="status">
          {message}
        </p>
      </form>
      <nav className="auth-links" aria-label="Opciones de cuenta">
        <Link to="/login">Ya tengo una cuenta</Link>
        <Link to="/">Volver al inicio</Link>
      </nav>
    </main>
  );
};
