import { CATEGORIAS_SERVICIOS, type Servicio } from "../data/servicios";
import { usePage } from "../hooks/usePage";

// Igual que antes: "Agendar" abre el formulario en una pestaña nueva con el
// servicio en ?consulta= para preseleccionar el tipo de consulta.
const urlAgendar = (servicio: Servicio) =>
  `/agendar?consulta=${encodeURIComponent(servicio.consulta)}`;

export default function Consultas() {
  usePage("Clínica NutriDifs| Consultas");

  return (
    <main>
      <section className="services-section container" aria-labelledby="consultas-title">
        <h1 id="consultas-title" className="titulo-consultas">
          Nuestras Consultas
        </h1>
        <p className="consultas-descripcion">
          Conoce nuestros servicios veterinarios, sus precios, duración y
          especies atendidas.
        </p>

        {CATEGORIAS_SERVICIOS.map((categoria) => (
          <section
            key={categoria.id}
            className={categoria.className}
            aria-labelledby={categoria.id}
          >
            <h2 id={categoria.id}>{categoria.title}</h2>

            <div className="services-grid consultas-grid">
              {categoria.servicios.map((servicio) => (
                <article className="service-card" key={servicio.code}>
                  <img
                    src={`/img/${servicio.image}`}
                    alt={servicio.alt}
                    className="service-image"
                  />
                  <span className="service-code">{servicio.code}</span>
                  <h3>{servicio.name}</h3>
                  <p>{servicio.description}</p>
                  <div className="service-details">
                    <span>{servicio.species}</span>
                    <span>⏱️ {servicio.duration}</span>
                    <strong>{servicio.price}</strong>
                  </div>
                  <p className="service-observation">{servicio.observation}</p>
                  <a
                    href={urlAgendar(servicio)}
                    className="btn-agendar"
                    target="_blank"
                    rel="noopener"
                  >
                    Agendar
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
