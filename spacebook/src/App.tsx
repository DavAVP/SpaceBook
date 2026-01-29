import {Routes, Route, Navigate, useLocation} from 'react-router-dom'
import Login from './pages/login'
import Home from './pages/clients/home'
import Register from './pages/register'
import PanelAdmin from './pages/admin/panelAdmin'
import SubirEspacios from './pages/admin/subirEspacios'
import { useUser } from './context/usuario.context'
import EditarEspacios from './pages/admin/editarEspacios'
import Reservar from './pages/clients/reservar'
import Navbar from './components/navbar'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react'
import MisReservas from './pages/clients/components-clients/MisReservar'
import Penalizacion from './pages/admin/components-admin/penalizacion'
import { Suscripcion } from './utils/push'
import HomeInvitado from './pages/homeInvitado'

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" />;
  if (requireAdmin && !user.is_admin) return <Navigate to="/home" />;

  return children;
};

const App: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();

  const rutassinNavbar = ['/login', '/register'];
  const mostrarNavbar = !rutassinNavbar.includes(location.pathname);
  
  useEffect(() => {
    if (user) {
      Suscripcion({
        id: user.id,
        is_admin: !!user.is_admin,
      })
        .catch(err => console.error('Error al suscribirse:', err));
    }
  }, [user]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'PUSH_NOTIFICATION') return;
      const { title, message } = event.data.payload || {};
      toast.info(message || title || 'Tienes una nueva notificación');
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);



  return (
    <>
    <ToastContainer position="bottom-right" autoClose={4000} newestOnTop theme="colored" />
      {mostrarNavbar && <Navbar />}

      <Routes>
        <Route path='/' element={<HomeInvitado />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/reservar/:id' element={
          <ProtectedRoute>
            <Reservar/>
          </ProtectedRoute>
        } />

        <Route path='/mis-reservas' element={
          <ProtectedRoute>
            <MisReservas/>
          </ProtectedRoute>
        } />

        <Route path='/home' element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        } />

        <Route path='/admin' element={
          <ProtectedRoute requireAdmin={true}>
            <PanelAdmin/>
          </ProtectedRoute>
        } />

        <Route path='/admin/subir-espacios' element={
          <ProtectedRoute requireAdmin={true}>
            <SubirEspacios/>
          </ProtectedRoute>
        } />

        <Route path='/admin/editar-espacios/:id' element={
          <ProtectedRoute requireAdmin={true}>
            <EditarEspacios/>
          </ProtectedRoute>
        } />

        <Route 
          path="/admin/penalizaciones"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Penalizacion />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
