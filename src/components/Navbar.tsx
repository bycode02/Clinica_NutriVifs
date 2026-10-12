import { Link, NavLink } from "react-router";
import { useApp } from "../context/AppContext";

const LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/consultas", label: "Consultas" },
  { to: "/productos", label: "Productos" },
  { to: "/blog", label: "Blog" },
  { to: "/contactanos", label: "Contáctanos" },
  { to: "/quienes-somos", label: "Quiénes somos" },
];

export const Navbar = () => {
  const { session, cartQuantity } = useApp();
  const links = LINKS;

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand" to="/">
          Clínica NutriDifs
        </Link>

        <nav aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link className="profile-link" to="/perfil">
          {session ? `Perfil (${session.name})` : "Perfil"}
        </Link>

        <Link
          className="carrito-compras"
          to="/carrito"
          aria-label={`Carrito, ${cartQuantity} productos`}
        >
          Carrito <span className="cart-counter">{cartQuantity}</span>
        </Link>
      </div>
    </header>
  );
};
