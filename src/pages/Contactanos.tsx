import { useState, type FormEvent } from "react";
import { CampoError } from "../components/CampoError";
import { usePage } from "../hooks/usePage";
import { claseCampo, isValidEmail, isValidPhone } from "../utils/validaciones";

type Errores = { identificacion?: string; motivo?: string; mensaje?: string };

export default function Contactanos() {
  usePage("Clinica NutriDifs | Contáctanos");
  const [identificacion, setIdentificacion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const valor = identificacion.trim();
    const nuevosErrores: Errores = {};

    if (!valor || (!isValidEmail(valor) && !isValidPhone(valor))) {
      nuevosErrores.identificacion =
        "Ingresa un correo permitido (@duoc.cl, @profesor.duoc.cl o @gmail.com) o un teléfono chileno válido.";
    }
    if (!motivo) nuevosErrores.motivo = "Selecciona un motivo de contacto.";
    if (!mensaje.trim()) {
      nuevosErrores.mensaje = "Escribe tu mensaje (máximo 500 caracteres).";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setFeedback("");
      return;
    }

    setFeedback("Mensaje enviado correctamente. Te contactaremos pronto.");
    setIdentificacion("");
    setMotivo("");
    setMensaje("");
  };

  return (
    <main>
      <section className="contacto-section container" aria-labelledby="contacto-title">
        <h1 id="contacto-title" className="titulo-consultas">
          Contáctanos
        </h1>

        <div className="contacto-grid">
          <div className="contacto-formulario">
            <form onSubmit={handleSubmit} noValidate>
              <div className="campo-formulario">
                <label htmlFor="contacto-identificacion">Correo o Teléfono:</label>
                <input
                  type="text"
                  id="contacto-identificacion"
                  name="identificacion"
                  placeholder="Ej: +569... o correo@gmail.com"
                  className={claseCampo(errores.identificacion)}
                  value={identificacion}
                  onChange={(event) => {
                    setIdentificacion(event.target.value);
                    setErrores((actual) => ({ ...actual, identificacion: undefined }));
                  }}
                />
                <CampoError mensaje={errores.identificacion} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="contacto-motivo">Motivo de contacto:</label>
                <select
                  id="contacto-motivo"
                  name="motivo"
                  className={claseCampo(errores.motivo)}
                  value={motivo}
                  onChange={(event) => {
                    setMotivo(event.target.value);
                    setErrores((actual) => ({ ...actual, motivo: undefined }));
                  }}
                >
                  <option value="" disabled>
                    Selecciona un motivo...
                  </option>
                  <option value="reclamo">Reclamo / Devolución</option>
                  <option value="consulta">Consulta por información</option>
                  <option value="sugerencia">Sugerencias</option>
                </select>
                <CampoError mensaje={errores.motivo} />
              </div>

              <div className="campo-formulario">
                <label htmlFor="mensaje">Mensaje:</label>
                {/* La pauta exige un máximo de 500 caracteres. */}
                <textarea
                  id="mensaje"
                  name="mensaje"
                  maxLength={500}
                  placeholder="Escribe tu consulta (máximo 500 caracteres)..."
                  className={claseCampo(errores.mensaje)}
                  value={mensaje}
                  onChange={(event) => {
                    setMensaje(event.target.value);
                    setErrores((actual) => ({ ...actual, mensaje: undefined }));
                  }}
                />
                <CampoError mensaje={errores.mensaje} />
              </div>

              <button type="submit" className="btn-agendar">
                Enviar Mensaje
              </button>
              <p role="status" aria-live="polite">
                {feedback}
              </p>
            </form>
          </div>

          <div className="contacto-mapa">
            <h3>Nuestra Ubicación</h3>
            <p>
              Encuéntranos en Rancagua, Región del Libertador General Bernardo
              O'Higgins.
            </p>
            <div className="mapa-placeholder">
              <iframe
                title="Ubicación de Clinica NutriDifs en Google Maps"
                src="https://www.google.com/maps?q=Clinica+NutriDifs+Chile&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
