import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    checkUser();
    
    // Escuchar cambios de autenticación
    const { data: authListener } = AuthService.supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data } = await AuthService.supabase.auth.getSession();
    
    if (data.session) {
      const userId = data.session.user.id;
      const { data: profile } = await AuthService.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        setUser({
          id: userId,
          nombre: profile.nombre || data.session.user.email?.split('@')[0] || 'Usuario',
          email: data.session.user.email || '',
          is_admin: profile.is_admin || false
        });
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await AuthService.supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <h2>ReservaSpace</h2>
        </div>

        {/* Buscador */}
        <div className="navbar-search">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar espacios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            className="search-input"
          />
        </div>

        {/* Usuario y menú */}
        {user ? (
          <div className="navbar-user">
            {/* Badge de rol */}
            <div className={`user-badge ${user.is_admin ? 'admin' : 'cliente'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {user.is_admin ? (
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                ) : (
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                )}
              </svg>
              <span>{user.is_admin ? 'Admin' : 'Cliente'}</span>
            </div>

            {/* Menú de usuario */}
            <div 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user.nombre || 'Usuario'}</span>
            </div>

            {/* Dropdown del menú */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.nombre}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                
                <div className="dropdown-divider"></div>

                {/* Opciones según el rol */}
                {user.is_admin ? (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      Panel de Admin
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/admin/penalizaciones');
                        setShowUserMenu(false);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      Confirmaciones Pendientes
                    </button>
                  </>
                ) : (
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/mis-reservas');
                      setShowUserMenu(false);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Mis Reservas
                  </button>
                )}

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="navbar-actions">
            <button 
              className="btn-login"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className="btn-register"
              onClick={() => navigate('/registro')}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;