import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RecipeForm from "../components/RecipeForm";
import { recipeService } from "../services/api";

const NewRecipePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const { data } = await recipeService.create(payload);
      navigate(`/recetas/${data.recipe._id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page narrow">
      <div className="page-heading">
        <p className="eyebrow">Nueva receta</p>
        <h1>Crear receta</h1>
      </div>
      <RecipeForm isSubmitting={isSubmitting} submitLabel="Crear receta" onSubmit={handleSubmit} />
    </main>
  );
};

export default NewRecipePage;
