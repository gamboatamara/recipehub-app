import { useEffect, useMemo, useState } from "react";

import RecipeCard from "../components/RecipeCard";
import { recipeService } from "../services/api";

const CATEGORY_TILES = [
  {
    label: "Desayuno",
    image: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Almuerzo",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Cena",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Postre",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Merienda",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Entrada",
    image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=320&q=80"
  },
  {
    label: "Bebida",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=320&q=80"
  }
];

const DIFFICULTIES = ["", "Fácil", "Media", "Difícil"];

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({ search: "", categoria: "", dificultad: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = {};
        if (filters.categoria) params.categoria = filters.categoria;
        if (filters.dificultad) params.dificultad = filters.dificultad;

        const { data } = await recipeService.list(params);
        setRecipes(data.recipes || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "No se pudieron cargar las recetas.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [filters.categoria, filters.dificultad]);

  const visibleRecipes = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    if (!term) return recipes;

    return recipes.filter((recipe) => {
      const titleMatches = recipe.titulo?.toLowerCase().includes(term);
      const tagMatches = (recipe.tags || []).some((tag) => tag.toLowerCase().includes(term));
      return titleMatches || tagMatches;
    });
  }, [recipes, filters.search]);

  const topRecipes = useMemo(
    () =>
      [...visibleRecipes]
        .filter((recipe) => Number(recipe.ratingsCount || 0) > 0)
        .sort((first, second) => Number(second.averageRating || 0) - Number(first.averageRating || 0))
        .slice(0, 10),
    [visibleRecipes]
  );

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Recetas compartidas por la comunidad</p>
          <h1>¿Que quieres cocinar hoy?</h1>
          <p>Explora ideas por categoria, dificultad o palabra clave y guarda tus propias recetas.</p>

          <div className="hero-search" role="search">
            <input
              aria-label="Buscar receta por titulo o tag"
              placeholder="Busca una receta, ingrediente o palabra clave..."
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <button className="button primary" type="button">
              Buscar
            </button>
          </div>
        </div>

        <aside className="hero-feature-card">
          <span>Tip del dia</span>
          <h2>Mejores decisiones al comer</h2>
          <p>Organiza tus recetas con ingredientes claros, pasos simples y categorias faciles de filtrar.</p>
        </aside>
      </section>

      <section className="category-strip" aria-label="Categorias de recetas">
        <div className="home-section-title">
          <p className="eyebrow">¿Que quieres cocinar?</p>
          <button
            className={`category-clear ${!filters.categoria ? "active" : ""}`}
            type="button"
            onClick={() => updateFilter("categoria", "")}
          >
            Ver todas
          </button>
        </div>

        <div className="category-rail">
          {CATEGORY_TILES.map((category) => (
            <button
              className={`category-tile ${filters.categoria === category.label ? "active" : ""}`}
              key={category.label}
              type="button"
              onClick={() => updateFilter("categoria", category.label)}
            >
              <img src={category.image} alt={category.label} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="difficulty-filter" aria-label="Filtro por dificultad">
        {DIFFICULTIES.map((difficulty) => (
          <button
            className={filters.dificultad === difficulty ? "active" : ""}
            key={difficulty || "all"}
            type="button"
            onClick={() => updateFilter("dificultad", difficulty)}
          >
            {difficulty || "Todas las dificultades"}
          </button>
        ))}
      </section>

      {error && <p className="alert error">{error}</p>}
      {isLoading && <p className="status">Cargando recetas...</p>}

      {!isLoading && !visibleRecipes.length && (
        <section className="empty-state">
          <h2>No hay recetas para estos filtros</h2>
          <p>Prueba con otra busqueda o cambia la categoria.</p>
        </section>
      )}

      {!!topRecipes.length && (
        <section className="featured-section">
          <div className="home-section-title">
            <div>
              <p className="eyebrow">Top recetas</p>
              <h2>Las mejor valoradas</h2>
            </div>
            <span>{topRecipes.length} recetas</span>
          </div>

          <div className="featured-rail">
            {topRecipes.map((recipe) => (
              <RecipeCard key={`top-${recipe._id}`} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      <section className="home-section-title">
        <div>
          <p className="eyebrow">Explorar</p>
          <h2>Todas las recetas</h2>
        </div>
        <span>{visibleRecipes.length} resultados</span>
      </section>

      <section className="recipe-grid">
        {visibleRecipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </section>
    </main>
  );
};

export default HomePage;
