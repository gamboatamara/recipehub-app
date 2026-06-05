import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../hooks/useAuth";
import { recipeService } from "../services/api";

const getAuthorId = (recipe) => recipe?.autorId?._id || recipe?.autorId;

const ProfilePage = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const { data } = await recipeService.list();
        setRecipes(data.recipes || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "No se pudieron cargar tus recetas.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const myRecipes = useMemo(
    () => recipes.filter((recipe) => String(getAuthorId(recipe)) === String(user?.id)),
    [recipes, user]
  );

  return (
    <main className="page">
      <section className="profile-header">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.nombre} /> : <div className="avatar-fallback">{user?.nombre?.[0]}</div>}
        <div>
          <p className="eyebrow">Mi perfil</p>
          <h1>{user?.nombre}</h1>
          <p>{user?.email}</p>
          {user?.bio && <p>{user.bio}</p>}
        </div>
        <Link className="button primary" to="/nueva">
          Crear receta
        </Link>
      </section>

      <section className="section-title">
        <div>
          <h2>Mis recetas</h2>
          <p>{myRecipes.length} recetas publicadas</p>
        </div>
      </section>

      {error && <p className="alert error">{error}</p>}
      {isLoading && <p className="status">Cargando tus recetas...</p>}

      {!isLoading && !myRecipes.length && (
        <section className="empty-state">
          <h2>Aun no has publicado recetas</h2>
          <p>Cuando crees una receta aparecera aqui.</p>
        </section>
      )}

      <section className="recipe-grid">
        {myRecipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </section>
    </main>
  );
};

export default ProfilePage;
