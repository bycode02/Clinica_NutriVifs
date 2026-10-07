import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { RUTAS_VENDEDOR } from './components/rutas'
import { useApp } from './context/AppContext'
import Agendar from './pages/Agendar'
import Blog from './pages/Blog'
import Carrito from './pages/Carrito'
import Consultas from './pages/Consultas'
import Contactanos from './pages/Contactanos'
import { Inicio } from './pages/Inicio'
import { Login } from './pages/Login'
import Perfil from './pages/Perfil'
import Productos from './pages/Productos'
import { Registro } from './pages/Registro'
import QuienesSomos from './pages/QuienesSomos'

// Login y registro se muestran sin el menú principal, como antes.
const RUTAS_SIN_MENU = ['/login', '/registro']

function App() {
  const { pathname } = useLocation()
  const { session } = useApp()
  const role = session ? session.role || 'Cliente' : 'Invitado'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // El vendedor solo puede estar en el inicio, productos u órdenes.
  if (role === 'Vendedor' && pathname !== '/' && !RUTAS_VENDEDOR.includes(pathname)) {
    return <Navigate to="/productos" replace />
  }

  return (
    <>
      {!RUTAS_SIN_MENU.includes(pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/contactanos" element={<Contactanos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
