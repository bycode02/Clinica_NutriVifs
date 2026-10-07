import { Link } from "react-router";
import { usePage } from "../hooks/usePage";

const VALORES = [
  {
    title: "Misión",
    text: "Brindar atención veterinaria de calidad, con calidez, ética y un enfoque preventivo, para mejorar la vida de cada mascota y la tranquilidad de sus familias.",
  },
  {
    title: "Visión",
    text: "Ser una clínica referente en bienestar animal, reconocida por su dedicación, confianza y cuidado integral en cada etapa de la vida de las mascotas.",
  },
  {
    title: "Valores",
    text: "Amor por los animales, honestidad, responsabilidad, atención personalizada y compromiso con la salud y el bienestar.",
  },
];

const RAZONES = [
  {
    title: "Atención personalizada",
    text: "Cada mascota recibe un trato cercano y adaptado a sus necesidades, hábitos y condición de salud.",
  },
  {
    title: "Equipo comprometido",
    text: "Trabajamos con profesionalismo y sensibilidad para cuidar a cada animal con responsabilidad y dedicación.",
  },
  {
    title: "Bienestar integral",
    text: "Promovemos la prevención y el cuidado completo para que tus mascotas vivan mejor y más felices.",
  },
];

const EQUIPO = [
  {
    avatar: "V",
    title: "Veterinarios",
    text: "Especialistas dedicados a la valoración, diagnóstico y cuidado de la salud de tus mascotas con enfoque profesional y humano.",
  },
  {
    avatar: "A",
    title: "Atención",
    text: "Un equipo amable y atento que acompaña a cada familia con información clara, respeto y buena disposición.",
  },
  {
    avatar: "C",
    title: "Cuidado integral",
    text: "Buscamos crear una experiencia segura y cercana para que tus mascotas reciban la atención que merecen.",
  },
];

export default function QuienesSomos() {
  usePage("Clinica NutriDifs | Quiénes somos");

  return (
    <main>
      <section className="quienes-somos-hero">
        <div className="container quienes-somos-hero-layout">
          <div className="quienes-somos-hero-content">
            <span className="quienes-somos-kicker">Nuestra historia</span>
            <h1>Quiénes somos</h1>
            <p>
              En Clinica NutriDifs cuidamos la salud, el bienestar y la calidad
              de vida de tus mascotas con atención profesional, cercana y
              responsable.
            </p>
          </div>
          <div className="quienes-somos-hero-image">
            <img src="/img/perro-gato.jpg" alt="Perro y gato en Clínica NutriDifs" />
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-layout">
          <div className="about-intro">
            <h2>Compromiso con el bienestar animal</h2>
            <p>
              Somos una clínica veterinaria dedicada a brindar atención integral
              a cada mascota, con un enfoque humano, profesional y cercano.
              Entendemos que cada animal es un miembro más de la familia y por
              eso cuidamos cada detalle con cariño y responsabilidad.
            </p>
            <p>
              En Clinica NutriDifs combinamos experiencia, ética y amor por los
              animales para ofrecer soluciones seguras, eficaces y orientadas al
              bienestar real de cada paciente.
            </p>
          </div>
          <div className="about-visual">
            <img
              src="/img/cuidado.jpg"
              alt="Equipo de Clinica NutriDifs cuidando con cariño a una mascota"
            />
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <h2>Nuestra misión, visión y valores</h2>
          <div className="values-grid">
            {VALORES.map((valor) => (
              <article className="value-card" key={valor.title}>
                <h3>{valor.title}</h3>
                <p>{valor.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>¿Por qué elegirnos?</h2>
          <div className="features-grid">
            {RAZONES.map((razon) => (
              <article className="feature-card" key={razon.title}>
                <h3>{razon.title}</h3>
                <p>{razon.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <h2>Conoce a nuestro equipo</h2>
          <div className="team-grid">
            {EQUIPO.map((miembro) => (
              <article className="team-card" key={miembro.title}>
                <div className="team-avatar">{miembro.avatar}</div>
                <h3>{miembro.title}</h3>
                <p>{miembro.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div>
              <h2>Tu mascota merece una atención con cariño</h2>
              <p>
                En Clinica NutriDifs estamos para cuidar a tu compañero de
                cuatro patas con responsabilidad, confianza y amor.
              </p>
            </div>
            <Link className="cta-button" to="/consultas">
              Agenda tu consulta
            </Link>
          </div>
        </div>
      </section>

      <section className="location-section" aria-labelledby="location-title">
        <div className="container">
          <div className="location-card">
            <div className="location-info">
              <h2 id="location-title">Dónde encontrarnos</h2>
              <p>Visítanos y recibe atención profesional para tu mascota.</p>
            </div>
            <div className="location-map">
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
