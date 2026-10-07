import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { usePage } from "../hooks/usePage";

export default function Perfil() {
  usePage("Perfil | Clínica NutriDifs", "profile-page-body");
  const { session, logout } = useApp();
  const navigate = useNavigate();

  const fullName = session
    ? [session.name, session.apellido].filter(Boolean).join(" ") || "Usuario"
    : "";
  const initials = session
    ? (session.name || "U").charAt(0).toUpperCase() +
      (session.apellido || session.name || "U").charAt(0).toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="profile-page">
      <section className="profile-page-shell" aria-labelledby="profile-page-title">
        <div className="profile-sidebar-card">
          <div className="profile-avatar">{initials}</div>
          <p className="profile-badge">Cuenta</p>
          <h1>{session ? fullName : "Invitado"}</h1>
          <p>
            {session
              ? session.email || "Sin correo"
              : "Inicia sesión para ver tus datos"}
          </p>
          {session ? (
            <button
              type="button"
              className="profile-page-logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          ) : (
            <Link className="profile-page-login" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>

        <article className="profile-details-card">
          <div className="profile-page-header">
            <div>
              <p className="profile-kicker">Perfil</p>
              <h2 id="profile-page-title">Información del usuario</h2>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Nombre completo</span>
              <strong>{session ? fullName : "Sin iniciar sesión"}</strong>
            </div>
            <div className="profile-info-item">
              <span>Correo</span>
              <strong>
                {session ? session.email || "Sin correo" : "Sin iniciar sesión"}
              </strong>
            </div>
            <div className="profile-info-item">
              <span>Fecha de nacimiento</span>
              <strong>
                {!session
                  ? "No disponible"
                  : session.birthDate
                    ? new Date(`${session.birthDate}T00:00:00`).toLocaleDateString("es-CL")
                    : "No especificada"}
              </strong>
            </div>
            <div className="profile-info-item">
              <span>Teléfono</span>
              <strong>
                {session ? session.phone || "No especificado" : "No disponible"}
              </strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
