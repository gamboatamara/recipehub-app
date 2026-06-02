import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { commentService, recipeService } from "../services/api";

const getOwnerId = (entity) => entity?.autorId?._id || entity?.autorId || entity?.usuarioId?._id || entity?.usuarioId;

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ texto: "", calificacion: 5 });
  const [ratingInfo, setRatingInfo] = useState({ averageRating: null, ratingsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");

  const isOwner = useMemo(() => {
    if (!recipe || !user) return false;
    return String(getOwnerId(recipe)) === String(user.id);
  }, [recipe, user]);

  const loadComments = useCallback(async () => {
    const { data } = await commentService.listByRecipe(id);
    setComments(data.comments || []);
    setRatingInfo({
      averageRating: data.averageRating,
      ratingsCount: data.ratingsCount || 0
    });
  }, [id]);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [recipeResponse] = await Promise.all([recipeService.getById(id), loadComments()]);
        setRecipe(recipeResponse.data.recipe);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "No se pudo cargar la receta.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [id, loadComments]);

  const handleDeleteRecipe = async () => {
    const confirmed = window.confirm("Quieres eliminar esta receta?");
    if (!confirmed) return;

    try {
      await recipeService.remove(id);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo eliminar la receta.");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setCommentError("");
    setIsSubmittingComment(true);

    try {
      await commentService.create(id, {
        texto: commentForm.texto,
        calificacion: Number(commentForm.calificacion)
      });
      setCommentForm({ texto: "", calificacion: 5 });
      await loadComments();
    } catch (requestError) {
      setCommentError(requestError.response?.data?.message || "No se pudo publicar el comentario.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.remove(commentId);
      await loadComments();
    } catch (requestError) {
      setCommentError(requestError.response?.data?.message || "No se pudo eliminar el comentario.");
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
    <main className="page detail-page">
      <section className="detail-header">
        <div>
          <p className="eyebrow">{recipe.categoria}</p>
          <h1>{recipe.titulo}</h1>
          <p>{recipe.descripcion}</p>
          <div className="stats-row">
            <span>{recipe.tiempoMin} min</span>
            <span>{recipe.porciones} porciones</span>
            <span>{recipe.dificultad}</span>
            <span>
              {ratingInfo.averageRating ? Number(ratingInfo.averageRating).toFixed(1) : "Sin rating"} (
              {ratingInfo.ratingsCount})
            </span>
          </div>
          <div className="tags">
            {(recipe.tags || []).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          {isOwner && (
            <div className="actions-row">
              <Link className="button primary" to={`/editar/${recipe._id}`}>
                Editar
              </Link>
              <button className="button danger" type="button" onClick={handleDeleteRecipe}>
                Eliminar
              </button>
            </div>
          )}
        </div>

        {recipe.imagenUrl ? (
          <img src={recipe.imagenUrl} alt={recipe.titulo} />
        ) : (
          <div className="detail-placeholder">{recipe.categoria}</div>
        )}
      </section>

      <section className="content-columns">
        <article>
          <h2>Ingredientes</h2>
          <ul className="ingredient-list">
            {recipe.ingredientes.map((ingredient, index) => (
              <li key={`${ingredient.nombre}-${index}`}>
                <span>{ingredient.nombre}</span>
                <strong>
                  {ingredient.cantidad} {ingredient.unidad}
                </strong>
              </li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Pasos</h2>
          <ol className="step-list">
            {recipe.pasos.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="comments-section">
        <div className="section-title">
          <h2>Comentarios</h2>
          <span>{comments.length} publicados</span>
        </div>

        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            {commentError && <p className="alert error">{commentError}</p>}
            <label>
              Comentario
              <textarea
                required
                rows={3}
                value={commentForm.texto}
                onChange={(event) => setCommentForm((current) => ({ ...current, texto: event.target.value }))}
              />
            </label>
            <label>
              Calificacion
              <select
                value={commentForm.calificacion}
                onChange={(event) => setCommentForm((current) => ({ ...current, calificacion: event.target.value }))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary" disabled={isSubmittingComment} type="submit">
              {isSubmittingComment ? "Publicando..." : "Publicar comentario"}
            </button>
          </form>
        ) : (
          <p className="status">
            <Link to="/login">Inicia sesion</Link> para comentar y calificar esta receta.
          </p>
        )}

        <div className="comment-list">
          {comments.map((comment) => {
            const canDelete = user && String(getOwnerId(comment)) === String(user.id);
            return (
              <article className="comment-card" key={comment._id}>
                <div>
                  <strong>{comment.usuarioId?.nombre || "Usuario"}</strong>
                  <span>{comment.calificacion}/5</span>
                </div>
                <p>{comment.texto}</p>
                {canDelete && (
                  <button className="link-button" type="button" onClick={() => handleDeleteComment(comment._id)}>
                    Eliminar comentario
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default RecipeDetailPage;
