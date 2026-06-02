import { useEffect, useMemo, useState } from "react";

import RecipeCard from "../components/RecipeCard";
import { recipeService } from "../services/api";

const CATEGORIES = ["", "Desayuno", "Almuerzo", "Cena", "Postre", "Merienda", "Entrada", "Bebida"];
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

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Recetas compartidas por la comunidad</p>
          <h1>Encuentra tu proxima receta favorita</h1>
          <p>
            Busca por titulo o tag, filtra por categoria y dificultad, y guarda nuevas recetas con
            ingredientes y pasos ordenados.
          </p>
        </div>
      </section>

      <section className="toolbar" aria-label="Filtros de recetas">
        <label>
          Buscar
          <input
            placeholder="Titulo o tag"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
        </label>

        <label>
          Categoria
          <select value={filters.categoria} onChange={(event) => updateFilter("categoria", event.target.value)}>
            {CATEGORIES.map((category) => (
              <option key={category || "all"} value={category}>
                {category || "Todas"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Dificultad
          <select value={filters.dificultad} onChange={(event) => updateFilter("dificultad", event.target.value)}>
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty || "all"} value={difficulty}>
                {difficulty || "Todas"}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <p className="alert error">{error}</p>}
      {isLoading && <p className="status">Cargando recetas...</p>}

      {!isLoading && !visibleRecipes.length && (
        <section className="empty-state">
          <h2>No hay recetas para estos filtros</h2>
          <p>Prueba con otra busqueda o cambia la categoria.</p>
        </section>
      )}

      <section className="recipe-grid">
        {visibleRecipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </section>
    </main>
  );
};

export default HomePage;
