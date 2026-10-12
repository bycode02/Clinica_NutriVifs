import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useApp, type Role } from "../context/AppContext";
import { usePage } from "../hooks/usePage";
import {
  MENSAJES,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "../utils/validaciones";



export const Login = () => {
  usePage("Iniciar sesión | Clínica NutriDifs", "auth-page");
  const { authenticate } = useApp();
  const [role, setRole] = useState<Role>("Cliente");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setEmailError("");
    setPasswordError("");
    setMessage("");

    const correo = normalizeEmail(email);

    if (correo.length > 100 || !isValidEmail(correo)) {
      setEmailError(
        "El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.",
      );
      return;
    }

    if (!isValidPassword(password)) {
      setPasswordError(MENSAJES.password);
      return;
    }

    try { authenticate(correo, password, role); navigate("/"); }
    catch (error) { setMessage((error as Error).message); }
  };

  return (
    <main className="auth-shell">
      <Link className="auth-brand" to="/">
        Clínica NutriDifs
      </Link>
      <p className="auth-kicker">Acceso de usuarios</p>
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-subtitle">
        Ingresa para continuar con tus solicitudes y reservas.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field"><label htmlFor="login-role">Rol de la cuenta</label><select id="login-role" value={role} onChange={e => setRole(e.target.value as Role)}><option value="Administrador">ADMINISTRADOR</option><option value="Vendedor">VENDEDOR</option><option value="Cliente">USUARIO</option></select><small>Modo demostración: puedes elegir cualquier rol para esta sesión.</small></div>
        <div className="auth-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="auth-field-error" role="alert">
            {emailError}
          </p>
        </div>
        <div className="auth-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="auth-field-error" role="alert">
            {passwordError}
          </p>
        </div>
        <p className="auth-message" aria-live="polite">
          {message}
        </p>
        <button className="auth-button" type="submit">
          Ingresar
        </button>
      </form>
      <nav className="auth-links" aria-label="Opciones de acceso">
        <Link to="/registro">Crear una cuenta</Link>
        <Link to="/">Volver al inicio</Link>
      </nav>
    </main>
  );
};
