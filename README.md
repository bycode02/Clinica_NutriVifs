# Clínica NutriDifs (React)

Sitio de la clínica veterinaria migrado a **React + TypeScript + Vite**, con
rutas de **React Router**.

## Cómo ejecutarlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Luego abre http://localhost:5173.

| Comando           | Qué hace                                   |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo con recarga en vivo |
| `npm run build`   | Revisa tipos y genera la versión final en `dist/` |
| `npm run preview` | Sirve la versión de `dist/`                |
| `npm run lint`    | Revisa el código con ESLint                |

## Estructura

```
public/img/            Imágenes del sitio (se usan como /img/archivo.jpg)
src/
  main.tsx             Punto de entrada (router + estado global)
  App.tsx              Rutas y layout (menú, pie de página)
  components/          Navbar, Footer, ProductCard, ProductDetail, CampoError
  context/             Estado global: carrito, sesión, perfiles y catálogo
  data/                Productos, servicios, regiones/comunas y equipo
  hooks/usePage.ts     Título de la pestaña y clase del <body> por página
  pages/               Una página por ruta (Inicio, Productos, Carrito, ...)
  utils/               Validaciones, formato de moneda y localStorage
  styles/app.css       Estilos del sitio
version-anterior/      Sitio original en HTML/CSS/JS (solo como referencia)
```

## Rutas

| Ruta             | Página                                   |
| ---------------- | ---------------------------------------- |
| `/`              | Inicio                                   |
| `/consultas`     | Servicios veterinarios                   |
| `/agendar`       | Formulario para agendar (`?consulta=...`) |
| `/productos`     | Catálogo con filtros, stock y detalle    |
| `/carrito`       | Carrito y pago                           |
| `/blog`          | Blog                                     |
| `/contactanos`   | Formulario de contacto y mapa            |
| `/quienes-somos` | Quiénes somos                            |
| `/login`         | Iniciar sesión                           |
| `/registro`      | Crear cuenta                             |
| `/perfil`        | Datos del usuario y cerrar sesión        |

Los datos (carrito, cuentas, sesión, stock y equipo) se guardan en
`localStorage` con las mismas claves que usaba el sitio anterior.
