import { Link } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const rating = recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "Sin rating";
  const authorName = recipe.autorId?.nombre || "Autor";

  return (
    <article className="recipe-card">
      {recipe.imagenUrl ? (
        <img src={recipe.imagenUrl} alt={recipe.titulo} />
      ) : (
        <div className="image-placeholder">{recipe.categoria}</div>
      )}

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
        <Link className="button full" to={`/recetas/${recipe._id}`}>
          Ver receta
        </Link>
      </div>
    </article>
  );
};

export default RecipeCard;
