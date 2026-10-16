import { useRef, useState } from "react";
import { UserForm } from "./Registro";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { usePage } from "../hooks/usePage";

export default function Perfil() {
  usePage("Perfil | Clínica NutriDifs", "profile-page-body");
  const { session, profiles, logout } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const editButton = useRef<HTMLButtonElement>(null);
  const profile = profiles.find(p => p.email === session?.email);
  const finishEditing = () => { setEditing(false); editButton.current?.focus(); };

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
        <div className="profile-sidebar">
          <div className="profile-sidebar-card">
            <div className="profile-avatar">{initials}</div>
            <p className="profile-badge">{session ? session.role || "Cliente" : "Invitado"}</p>
            <h1>{session ? fullName : "Invitado"}</h1>
            <p>
              {session
                ? session.email || "Sin correo"
                : "Inicia sesión para ver tus datos"}
            </p>
            <div className="profile-page-actions">
              {(session?.role === "Administrador" || session?.role === "Vendedor") && <Link className="profile-page-login" to={session.role === "Administrador" ? "/administrar" : "/vendedor"}>Administrar</Link>}
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
          </div>
        </div>

        <article className="profile-details-card">
          <div className="profile-page-header">
            <div>
              <p className="profile-kicker">Perfil</p>
              <h2 id="profile-page-title">Información del usuario</h2>
            </div>
            {session && profile && <button ref={editButton} type="button" className="profile-edit-button" aria-expanded={editing} aria-controls="profile-editor" onClick={() => { setEditing(!editing); setMessage(""); }}>
              {editing ? "Cancelar edición" : "Editar perfil"}
            </button>}
          </div>
          <p role="status" className="profile-message">{message}</p>
          {editing && profile ? <div id="profile-editor">
            <UserForm editProfile initial={profile} onDone={finishEditing} onSaved={() => { finishEditing(); setMessage("Perfil actualizado correctamente."); }} />
          </div> : <div className="profile-info-grid" role="region" aria-label="Datos del usuario" tabIndex={0}>
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
            {[
              ["Dirección", profile?.direccion], ["Región", profile?.region],
              ["Comuna", profile?.comuna], ["Género", ({ femenino: "Femenino", masculino: "Masculino", otro: "Otro", "prefiero-no-decir": "Prefiero no decir" } as Record<string, string>)[profile?.genero || ""]],
            ].map(([label, value]) => <div className="profile-info-item" key={label}><span>{label}</span><strong>{value || "No especificado"}</strong></div>)}
          </div>}
        </article>
      </section>
    </main>
  );
}
