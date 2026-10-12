export type MiembroEquipo = {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: "Activo" | "Inactivo";
};

// Se copia a localStorage ("admin-users") la primera vez que se abre el sitio.
export const EQUIPO_INICIAL: MiembroEquipo[] = [
  { name: "Ana Pérez", email: "ana@gmail.com", role: "Veterinaria", status: "Activo" },
  { name: "Pedro Soto", email: "pedro@gmail.com", role: "Asistente", status: "Activo" },
  { id: "USR001", name: "Carolina Quinan", email: "carolina@gmail.com", role: "Administrador", status: "Activo" },
  { id: "USR002", name: "Francisco Arce", email: "francisco@gmail.com", role: "Administrador", status: "Activo" },
  { id: "USR003", name: "Bayron Mena", email: "bayron@gmail.com", role: "Asistente", status: "Activo" },
];
