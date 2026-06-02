import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          RecipeHub
        </Link>

        <nav className="nav-links" aria-label="Navegacion principal">
          <NavLink to="/">Inicio</NavLink>
          {isAuthenticated && <NavLink to="/nueva">Nueva receta</NavLink>}
          {isAuthenticated && <NavLink to="/perfil">Perfil</NavLink>}
        </nav>

        <div className="session-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.nombre}</span>
              <button className="button ghost" type="button" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link className="button ghost" to="/login">
                Login
              </Link>
              <Link className="button primary" to="/register">
                Registro
              </Link>
            </>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default Layout;
