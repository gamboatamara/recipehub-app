import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import RecipeForm from "../components/RecipeForm";
import { recipeService } from "../services/api";

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const { data } = await recipeService.getById(id);
        setRecipe(data.recipe);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "No se pudo cargar la receta.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const { data } = await recipeService.update(id, payload);
      navigate(`/recetas/${data.recipe._id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="page narrow">
        <p className="status">Cargando receta...</p>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="page narrow">
        <p className="alert error">{error || "Receta no encontrada."}</p>
        <Link className="button ghost" to="/">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <div className="page-heading">
        <p className="eyebrow">Editar receta</p>
        <h1>{recipe.titulo}</h1>
      </div>
      <RecipeForm
        initialRecipe={recipe}
        isSubmitting={isSubmitting}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default EditRecipePage;
