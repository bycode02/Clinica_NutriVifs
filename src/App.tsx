import { Route, Routes } from 'react-router'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
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

function App() {
  return (
    <>
      <Navbar />
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
      </Routes>
      <Footer />
    </>
  )
}

export default App
