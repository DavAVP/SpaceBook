import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import NotificationToggle from '../components/notificaciones';
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: authListener } = AuthService.supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => authListener?.subscription?.unsubscribe();
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
          nombre: profile.nombre || data.session.user.email?.split("@")[0],
          email: data.session.user.email || "",
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
    navigate("/login");
  };

  const navegacionInicioAdmin = () => {
    if (user?.is_admin) navigate("/admin");
    else navigate("/home");
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">

        <div className="navbar-logo" onClick={navegacionInicioAdmin}>
          <h2>ReservaSpace</h2>
        </div>

        <div className="navbar-search">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24">
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

        {user ? (
          <div className="navbar-user">

            <div className={`user-badge ${user.is_admin ? 'admin' : 'cliente'}`}>
              {user.is_admin ? "Admin" : "Cliente"}
            </div>

            <div className="user-menu-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {user.nombre?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.nombre}</span>
            </div>

            {showUserMenu && (
              <div className="user-dropdown">

                <div className="dropdown-header">
                  <p className="dropdown-name">{user.nombre}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>

                <div className="dropdown-divider"></div>

                {user.is_admin ? (
                  <>
                    <button className="dropdown-item" onClick={() => navigate("/admin")}>
                      Panel de Admin
                    </button>

                    <button className="dropdown-item" onClick={() => navigate("/admin/penalizaciones")}>
                      Confirmaciones Pendientes
                    </button>

                    <div className="dropdown-divider"></div>

                    <NotificationToggle userId={user.id} is_admin={user.is_admin} />
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => navigate("/mis-reservas")}>
                      Mis Reservas
                    </button>

                    <button className="dropdown-item" onClick={() => navigate("/home")}>
                      Ver Espacios
                    </button>

                    <div className="dropdown-divider"></div>

                    <NotificationToggle userId={user.id} is_admin={user.is_admin} />
                  </>
                )}

                <div className="dropdown-divider"></div>

                <button className="dropdown-item logout" onClick={handleLogout}>
                  Cerrar Sesión
                </button>

              </div>
            )}
          </div>
        ) : (
          <div className="navbar-actions">
            <button className="btn-login" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </button>
            <button className="btn-register" onClick={() => navigate("/register")}>
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
