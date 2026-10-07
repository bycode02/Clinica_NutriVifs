import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { CampoError } from "../components/CampoError";
import { usePage } from "../hooks/usePage";
import {
  ANIO_MAXIMO_NACIMIENTO,
  CORREO_AGENDAMIENTO_REGEX,
  MENSAJES,
  RUT_FORMATO_REGEX,
  TELEFONO_AGENDAMIENTO_REGEX,
  claseCampo,
  formatearRut,
  formatearTelefono,
  isTodayOrFutureDate,
  isValidBirthDate,
  isValidRut,
  normalizeRut,
  soloTeclas,
  todayIso,
} from "../utils/validaciones";

const INICIAL = {
  nombre: "",
  apellido: "",
  rut: "",
  fechaNacimiento: "",
  correo: "",
  telefono: "+",
  mascota: "",
  especie: "",
  otraEspecie: "",
  tipoConsulta: "",
  fecha: "",
  motivo: "",
};

type Campos = typeof INICIAL;
type Errores = Partial<Record<keyof Campos, string>>;

// Preselecciona el tipo de consulta según ?consulta= (viene de Consultas).
function tipoDesdeConsulta(consulta: string) {
  const valor = consulta.toLowerCase();
  if (valor.includes("urgencia")) return "urgencia";
  if (
    valor.includes("vacuna") ||
    valor.includes("antirrabica") ||
    valor.includes("felina") ||
    valor.includes("canina")
  ) {
    return "vacunacion";
  }
  if (valor.includes("desparas")) return "desparasitacion";
  if (valor.includes("general")) return "general";
  return "";
}

function validarAgendamiento(datos: Campos): Errores {
  const errores: Errores = {};
  const requeridos: (keyof Campos)[] = [
    "nombre",
    "apellido",
    "rut",
    "fechaNacimiento",
    "correo",
    "telefono",
    "mascota",
    "fecha",
    "motivo",
  ];
  requeridos.forEach((campo) => {
    if (!datos[campo].trim()) errores[campo] = MENSAJES.requerido;
  });
  if (!datos.especie) errores.especie = MENSAJES.seleccion;
  if (!datos.tipoConsulta) errores.tipoConsulta = MENSAJES.seleccion;
  if (datos.especie === "otro" && !datos.otraEspecie.trim()) {
    errores.otraEspecie = MENSAJES.requerido;
  }

  if (!RUT_FORMATO_REGEX.test(datos.rut) || !isValidRut(normalizeRut(datos.rut))) {
    errores.rut =
      "RUT inválido. Debe tener 7 u 8 números y un dígito verificador (0-9 o K), con el formato 12.345.678-5.";
  }
  if (!isValidBirthDate(datos.fechaNacimiento)) {
    errores.fechaNacimiento = MENSAJES.nacimiento;
  }
  if (!CORREO_AGENDAMIENTO_REGEX.test(datos.correo)) {
    errores.correo = MENSAJES.correoAgendamiento;
  }
  if (!TELEFONO_AGENDAMIENTO_REGEX.test(datos.telefono)) {
    errores.telefono = MENSAJES.telefono;
  }
  if (!isTodayOrFutureDate(datos.fecha)) {
    errores.fecha = "La fecha preferida no puede ser anterior a hoy.";
  }
  if (datos.motivo.trim() && datos.motivo.trim().length < 20) {
    errores.motivo = "El motivo debe tener al menos 20 caracteres.";
  }
  return errores;
}

export default function Agendar() {
  usePage("Agendar consulta | Clinica NutriDifs");
  const [searchParams] = useSearchParams();
  const [datos, setDatos] = useState<Campos>(() => ({
    ...INICIAL,
    tipoConsulta: tipoDesdeConsulta(searchParams.get("consulta") || ""),
  }));
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState("");

  const actualizar = (campo: keyof Campos, valor: string) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: undefined }));
  };

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => actualizar(event.target.name as keyof Campos, event.target.value);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nuevosErrores = validarAgendamiento(datos);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;

    setMensaje(
      "Solicitud enviada. Nos pondremos en contacto contigo para confirmar.",
    );
    setDatos(INICIAL);
  };

  return (
    <main>
      <section className="services-section container appointment-page">
        <span className="hero-subtitle">ATENCION VETERINARIA</span>
        <h1 className="titulo-consultas">Agenda tu consulta</h1>
        <p className="consultas-descripcion">
          Completa tus datos y nos pondremos en contacto contigo para confirmar
          la hora.
        </p>

        <div className="appointment-layout">
          <div className="appointment-info">
            <h2>Elige la atencion que necesitas</h2>
            <p>
              Atendemos perros, gatos y animales pequenos con atencion cercana y
              responsable.
            </p>
            <ul>
              <li>Consultas generales y de urgencia</li>
              <li>Vacunacion y desparasitacion</li>
              <li>Controles y seguimiento</li>
              <li>Atencion para aves y conejos</li>
            </ul>
          </div>

          <form className="appointment-form" onSubmit={handleSubmit} noValidate>
            <div className="campo-formulario">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" autoComplete="given-name" name="nombre" type="text" maxLength={100}
                className={claseCampo(errores.nombre)} value={datos.nombre} onChange={onChange} />
              <CampoError mensaje={errores.nombre} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="apellido">Apellido</label>
              <input id="apellido" autoComplete="family-name" name="apellido" type="text" maxLength={100}
                className={claseCampo(errores.apellido)} value={datos.apellido} onChange={onChange} />
              <CampoError mensaje={errores.apellido} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="rut">RUT (ej: 12.345.678-9)</label>
              <input id="rut" name="rut" type="text" inputMode="text" placeholder="12.345.678-9" maxLength={12}
                className={claseCampo(errores.rut)} value={datos.rut}
                onKeyDown={soloTeclas(/^[0-9kK.-]$/)}
                onChange={(event) => actualizar("rut", formatearRut(event.target.value))} />
              <CampoError mensaje={errores.rut} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
              <input id="fecha-nacimiento" autoComplete="bday" name="fechaNacimiento" type="date"
                max={`${ANIO_MAXIMO_NACIMIENTO}-12-31`}
                className={claseCampo(errores.fechaNacimiento)} value={datos.fechaNacimiento} onChange={onChange} />
              <small className="campo-ayuda">
                Solo pueden agendar una consulta personas mayores de 14 años.
              </small>
              <CampoError mensaje={errores.fechaNacimiento} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="correo">Correo (ej: usuario@gmail.com)</label>
              <input id="correo" autoComplete="email" name="correo" type="text" inputMode="email" maxLength={42}
                placeholder="usuario@duoc.cl"
                className={claseCampo(errores.correo)} value={datos.correo} onChange={onChange} />
              <CampoError mensaje={errores.correo} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="telefono">Telefono (ej: +56934020512)</label>
              <input id="telefono" autoComplete="tel" name="telefono" type="tel" inputMode="tel"
                placeholder="+56934020512" maxLength={12}
                className={claseCampo(errores.telefono)} value={datos.telefono}
                onKeyDown={soloTeclas(/^[0-9]$/)}
                onChange={(event) => actualizar("telefono", formatearTelefono(event.target.value))} />
              <CampoError mensaje={errores.telefono} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="mascota">Nombre de tu mascota</label>
              <input id="mascota" name="mascota" type="text"
                className={claseCampo(errores.mascota)} value={datos.mascota} onChange={onChange} />
              <CampoError mensaje={errores.mascota} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="especie">Especie</label>
              <select id="especie" name="especie" className={claseCampo(errores.especie)}
                value={datos.especie}
                onChange={(event) => {
                  actualizar("especie", event.target.value);
                  if (event.target.value !== "otro") actualizar("otraEspecie", "");
                }}>
                <option value="" disabled>Selecciona una opcion</option>
                <option>Perro</option>
                <option>Gato</option>
                <option>Ave</option>
                <option>Conejo</option>
                <option value="otro">Otro</option>
              </select>
              <CampoError mensaje={errores.especie} />
            </div>

            <div className="campo-formulario campo-completo" hidden={datos.especie !== "otro"}>
              <label htmlFor="otra-especie">Escribe la especie</label>
              <input id="otra-especie" name="otraEspecie" type="text" placeholder="Ej: Hurón"
                className={claseCampo(errores.otraEspecie)} value={datos.otraEspecie} onChange={onChange} />
              <CampoError mensaje={errores.otraEspecie} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="tipo-consulta">Tipo de consulta</label>
              <select id="tipo-consulta" name="tipoConsulta" className={claseCampo(errores.tipoConsulta)}
                value={datos.tipoConsulta} onChange={onChange}>
                <option value="" disabled>Selecciona una opcion</option>
                <option value="general">Consulta general</option>
                <option value="urgencia">Consulta de urgencia</option>
                <option value="vacunacion">Vacunacion</option>
                <option value="desparasitacion">Desparasitacion</option>
              </select>
              <CampoError mensaje={errores.tipoConsulta} />
            </div>

            <div className="campo-formulario">
              <label htmlFor="fecha">Fecha preferida</label>
              <input id="fecha" name="fecha" type="date" min={todayIso()}
                className={claseCampo(errores.fecha)} value={datos.fecha} onChange={onChange} />
              <CampoError mensaje={errores.fecha} />
            </div>

            <div className="campo-formulario campo-completo">
              <label htmlFor="motivo">Motivo de la consulta (minimo 20 caracteres)</label>
              <textarea id="motivo" name="motivo" rows={5} minLength={20} maxLength={500}
                placeholder="Describe con detalle lo que le ocurre a tu mascota"
                className={claseCampo(errores.motivo)} value={datos.motivo} onChange={onChange} />
              <CampoError mensaje={errores.motivo} />
            </div>

            <button type="submit" className="btn-agendar campo-completo">
              Solicitar consulta
            </button>
            <p className="campo-completo" role="status" aria-live="polite">
              {mensaje}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
