import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = location.state?.from?.pathname || "/perfil";

  if (isAuthenticated) {
    return <Navigate to="/perfil" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo iniciar sesion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Bienvenido de nuevo</p>
        <h1>Login</h1>
        {error && <p className="alert error">{error}</p>}

        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>

        <button className="button primary submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
        <p>
          No tienes cuenta? <Link to="/register">Registrate</Link>
        </p>
      </form>
    </main>
  );
};

export default LoginPage;
