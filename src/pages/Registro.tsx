import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { CampoError } from "../components/CampoError";
import { useApp, type Role, type Profile } from "../context/AppContext";
import { REGIONES_COMUNAS } from "../data/regiones";
import { usePage } from "../hooks/usePage";
import {
  ANIO_MAXIMO_NACIMIENTO,
  claseCampo,
  formatearTelefono,
  normalizeEmail,
  soloTeclas,
} from "../utils/validaciones";

import { INICIAL, validarRegistro, type Campos } from "../utils/registro";
type Errores = Partial<Record<keyof Campos, string>>;

export const Registro = () => {
  usePage("Registro | Clínica NutriDifs", "auth-page");
  return <UserForm />;
};

export function UserForm({ managed = false, initial, onDone }: { managed?: boolean; initial?: Profile; onDone?: () => void }) {
  const { register, manageUser, session } = useApp();
  const [role, setRole] = useState<Role>(initial?.role || "Cliente");
  const navigate = useNavigate();
  const [datos, setDatos] = useState<Campos>(initial ? { ...INICIAL, ...initial, confirmPassword: initial.password, aceptaTerminos: true } : INICIAL);
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
      locked: initial?.locked || false,
      role: managed ? role : "Cliente",
    };

    try {
      if (managed) { manageUser(profile, initial?.email); onDone?.(); }
      else { register(profile); navigate("/"); }
    } catch (error) { setMessage((error as Error).message); }
  };

  return (
    <section className="auth-card user-form">
      <Link className="auth-brand" to="/">
        Clínica NutriDifs
      </Link>
      <span className="auth-eyebrow">{managed ? "GESTIÓN DE USUARIOS" : "NUEVO CLIENTE"}</span>
      <h1>{initial ? "Modificar usuario" : "Crear cuenta"}</h1>
      <p className="auth-description">
        Regístrate para gestionar tus datos y solicitar atención veterinaria.
      </p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {managed && <><label htmlFor="user-role">Rol</label><select id="user-role" value={role} onChange={e => setRole(e.target.value as Role)} disabled={session?.role !== "Administrador"}>
          <option value="Cliente">USUARIO</option>
          {session?.role === "Administrador" && <><option value="Administrador">ADMINISTRADOR</option><option value="Vendedor">VENDEDOR</option></>}
        </select></>}
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
          {managed ? "Guardar usuario" : "Registrarme"}
        </button>
        <p className="profile-message" role="status">
          {message}
        </p>
      </form>
      {managed ? <button type="button" onClick={onDone}>Cancelar</button> : <nav className="auth-links" aria-label="Opciones de cuenta">
        <Link to="/login">Ya tengo una cuenta</Link>
        <Link to="/">Volver al inicio</Link>
      </nav>}
    </section>
  );
};
