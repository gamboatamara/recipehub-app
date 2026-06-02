import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    bio: "",
    avatarUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/perfil" replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/perfil", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Unete a RecipeHub</p>
        <h1>Registro</h1>
        {error && <p className="alert error">{error}</p>}

        <label>
          Nombre
          <input required value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
        </label>

        <label>
          Bio
          <textarea rows={3} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} />
        </label>

        <label>
          Avatar URL
          <input type="url" value={form.avatarUrl} onChange={(event) => updateField("avatarUrl", event.target.value)} />
        </label>

        <button className="button primary submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>
        <p>
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </form>
    </main>
  );
};

export default RegisterPage;
