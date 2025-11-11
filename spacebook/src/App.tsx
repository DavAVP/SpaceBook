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


interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useUser();

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return <div>Cargando...</div>;
  }

  console.log('ProtectedRoute: User:', user);
  console.log('ProtectedRoute: RequireAdmin:', requireAdmin);

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/" />;
  }

  if (requireAdmin && !user.is_admin) {
    console.log('ProtectedRoute: User is not admin, redirecting to home');
    return <Navigate to="/home" />;
  }

  return children;
};

const App: React.FC = () => {
  const location = useLocation();
  const rutassinNavbar = ['/', '/register'];
  const mostrarNavbar = !rutassinNavbar.includes(location.pathname);
  return (
    <>
    {mostrarNavbar && <Navbar />}
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/reservar/:id' element={
        <ProtectedRoute>
          <Reservar/>
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
      }/>
    </Routes>
    </>
  )
}

export default App;