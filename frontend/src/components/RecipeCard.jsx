import { Link } from "react-router-dom";

import RecipeImage from "./RecipeImage";

const RecipeCard = ({ recipe }) => {
  const rating = recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "Sin rating";
  const authorName = recipe.autorId?.nombre || "Autor";

  return (
    <Link className="recipe-card" to={`/recetas/${recipe._id}`}>
      <RecipeImage imageUrl={recipe.imagenUrl} label={recipe.categoria} title={recipe.titulo} />

      <div className="card-body">
        <div className="meta-row">
          <span>{recipe.categoria}</span>
          <span>{recipe.dificultad}</span>
        </div>
        <h2>{recipe.titulo}</h2>
        <p>{recipe.descripcion}</p>
        <div className="tags">
          {(recipe.tags || []).slice(0, 4).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <div className="card-footer">
          <span>{authorName}</span>
          <span>{rating}</span>
        </div>
        <span className="button full recipe-card-action">
          Ver receta
        </span>
      </div>
    </Link>
  );
};

export default RecipeCard;
