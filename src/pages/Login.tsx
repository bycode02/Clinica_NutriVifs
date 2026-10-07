import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { usePage } from "../hooks/usePage";
import {
  MENSAJES,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "../utils/validaciones";

const BLOQUEADA =
  "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla.";

export const Login = () => {
  usePage("Iniciar sesión | Clínica NutriDifs", "auth-page");
  const { profiles, saveProfiles, startSession } = useApp();
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

    const profile = profiles.find((item) => item.email === correo);

    if (!profile) {
      setEmailError("No existe una cuenta registrada con este correo.");
      return;
    }

    if (profile.locked) {
      setPasswordError(BLOQUEADA);
      return;
    }

    if (profile.password !== password) {
      const failedAttempts = (profile.failedAttempts || 0) + 1;
      // Después del tercer intento fallido la cuenta queda bloqueada.
      const locked = failedAttempts >= 3;
      saveProfiles(
        profiles.map((item) =>
          item === profile ? { ...item, failedAttempts, locked } : item,
        ),
      );
      setPasswordError(
        locked ? BLOQUEADA : "La contraseña no coincide con esta cuenta.",
      );
      return;
    }

    saveProfiles(
      profiles.map((item) =>
        item === profile ? { ...item, failedAttempts: 0 } : item,
      ),
    );
    startSession(profile);
    setMessage("Sesión iniciada correctamente.");
    navigate("/");
  };

  return (
    <main className="auth-shell">
      <Link className="auth-brand" to="/">
        Clínica NutriDifs
      </Link>
      <p className="auth-kicker">Acceso de clientes</p>
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-subtitle">
        Ingresa para continuar con tus solicitudes y reservas.
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
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
