import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { DESTACADOS, imagenProducto } from "../data/productos";
import { usePage } from "../hooks/usePage";
import { formatCurrency, getInitials } from "../utils/format";

const BENEFICIOS = [
  { icon: "🐾", title: "Atención profesional", text: "Cuidamos a tu mascota" },
  { icon: "🛡️", title: "Equipamiento moderno", text: "Atención segura y confiable" },
  { icon: "💚", title: "Amor y respeto", text: "Por todos los animales" },
  { icon: "⏰", title: "Atención responsable", text: "Pensando siempre en ellos" },
];

const ATENCION_DOMICILIO = [
  "Consulta veterinaria a domicilio",
  "Toma de muestras",
  "Aplicación de medicamentos",
  "Atención personalizada para tu mascota",
];

export const Inicio = () => {
  usePage("Clinica NutriDifs | Inicio");
  const { team, products } = useApp();
  const destacados = DESTACADOS.map((id) =>
    products.find((product) => product.id === id),
  ).filter((product) => product !== undefined);

  return (
    <main>
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-subtitle">CLÍNICA VETERINARIA</span>
            <h1 id="hero-title">¡Cuidamos a los que más quieres!</h1>
            <p>
              Salud, bienestar y amor para tu mascota. En Clínica NutriDifs
              entregamos atención veterinaria cercana, responsable y dedicada.
            </p>
            <div className="hero-buttons">
              <Link
                to="/consultas"
                className="btn-primary"
                aria-label="Abrir página para agendar una consulta"
              >
                Agenda tu hora
              </Link>
              <Link to="/quienes-somos" className="btn-secondary">
                Conoce nuestros servicios
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="/img/perro-gato.jpg"
              alt="Perro y gato atendidos en Clínica NutriDifs"
            />
          </div>
        </div>
      </section>

      <section className="quick-benefits">
        <div className="container benefits-grid">
          {BENEFICIOS.map((beneficio) => (
            <div className="benefit" key={beneficio.title}>
              <span className="benefit-icon" aria-hidden="true">
                {beneficio.icon}
              </span>
              <div>
                <strong>{beneficio.title}</strong>
                <p>{beneficio.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-users" aria-labelledby="home-users-title">
        <div className="container">
          <div className="home-users-heading">
            <span>EL EQUIPO</span>
            <h2 id="home-users-title">
              Personas que hacen posible nuestra atención
            </h2>
            <p>Conoce a los integrantes activos de Clínica NutriDifs.</p>
          </div>

          <div className="home-users-grid">
            {team.map((user) => (
              <article className="team-card" key={user.email}>
                <div className="avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </div>
                <h3>{user.name}</h3>
                <p className="role">{user.role || "Equipo clínico"}</p>
                <p className="email">{user.email}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-care">
        <div className="container home-care-content">
          <div className="home-care-image">
            <img
              src="/img/procedimiento.jpg"
              alt="Veterinario realizando atención a domicilio"
            />
          </div>

          <div className="home-care-text">
            <span className="home-care-label">ATENCIÓN A DOMICILIO</span>
            <h2>La atención que tu mascota necesita, sin salir de casa</h2>
            <p>
              Sabemos que trasladar a tu mascota puede ser estresante. Por eso,
              llevamos nuestros servicios veterinarios hasta tu hogar,
              entregando una atención cómoda, segura y personalizada.
            </p>
            <ul className="custom-list">
              {ATENCION_DOMICILIO.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/contactanos" className="btn-primary">
              Solicitar atención
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="products-heading">
            <div>
              <span>TIENDA VETERINARIA</span>
              <h2>Productos destacados</h2>
            </div>
            <Link to="/productos">Ver todos los productos &rarr;</Link>
          </div>

          <div className="featured-products-grid">
            {destacados.map((product) => (
              <article className="featured-product-card" key={product.id}>
                <img
                  src={imagenProducto(product.image)}
                  alt={product.name}
                  className="product-image"
                />
                <div className="featured-product-info">
                  <span>{product.category.toUpperCase()}</span>
                  <h3>{product.name}</h3>
                  <strong className="product-price">
                    {formatCurrency(product.price)}
                  </strong>
                  <Link to="/productos">Ver producto</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
