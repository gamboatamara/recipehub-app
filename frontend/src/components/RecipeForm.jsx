import { useMemo, useState } from "react";

const CATEGORIES = ["Desayuno", "Almuerzo", "Cena", "Postre", "Merienda", "Entrada", "Bebida"];
const DIFFICULTIES = ["Fácil", "Media", "Difícil"];

const emptyIngredient = { nombre: "", cantidad: 1, unidad: "" };

const buildInitialState = (recipe) => ({
  titulo: recipe?.titulo || "",
  descripcion: recipe?.descripcion || "",
  categoria: recipe?.categoria || "Almuerzo",
  tiempoMin: recipe?.tiempoMin || 30,
  porciones: recipe?.porciones || 2,
  dificultad: recipe?.dificultad || "Fácil",
  ingredientes: recipe?.ingredientes?.length ? recipe.ingredientes : [emptyIngredient],
  pasos: recipe?.pasos?.length ? recipe.pasos : [""],
  tags: recipe?.tags?.join(", ") || "",
  imagenUrl: recipe?.imagenUrl || ""
});

const RecipeForm = ({ initialRecipe, isSubmitting, onSubmit, submitLabel }) => {
  const [form, setForm] = useState(() => buildInitialState(initialRecipe));
  const [error, setError] = useState("");

  const canRemoveIngredient = useMemo(() => form.ingredientes.length > 1, [form.ingredientes]);
  const canRemoveStep = useMemo(() => form.pasos.length > 1, [form.pasos]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateIngredient = (index, field, value) => {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredientes: [...current.ingredientes, emptyIngredient]
    }));
  };

  const removeIngredient = (index) => {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.filter((_, ingredientIndex) => ingredientIndex !== index)
    }));
  };

  const updateStep = (index, value) => {
    setForm((current) => ({
      ...current,
      pasos: current.pasos.map((step, stepIndex) => (stepIndex === index ? value : step))
    }));
  };

  const addStep = () => {
    setForm((current) => ({
      ...current,
      pasos: [...current.pasos, ""]
    }));
  };

  const removeStep = (index) => {
    setForm((current) => ({
      ...current,
      pasos: current.pasos.filter((_, stepIndex) => stepIndex !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      tiempoMin: Number(form.tiempoMin),
      porciones: Number(form.porciones),
      ingredientes: form.ingredientes
        .map((ingredient) => ({
          nombre: ingredient.nombre.trim(),
          cantidad: Number(ingredient.cantidad),
          unidad: ingredient.unidad.trim()
        }))
        .filter((ingredient) => ingredient.nombre && ingredient.unidad),
      pasos: form.pasos.map((step) => step.trim()).filter(Boolean),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    if (!payload.ingredientes.length || !payload.pasos.length) {
      setError("Agrega al menos un ingrediente y un paso.");
      return;
    }

    try {
      await onSubmit(payload);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo guardar la receta.");
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {error && <p className="alert error">{error}</p>}

      <label>
        Titulo
        <input
          required
          minLength={3}
          value={form.titulo}
          onChange={(event) => updateField("titulo", event.target.value)}
        />
      </label>

      <label>
        Descripcion
        <textarea
          required
          rows={4}
          value={form.descripcion}
          onChange={(event) => updateField("descripcion", event.target.value)}
        />
      </label>

      <div className="form-row">
        <label>
          Categoria
          <select value={form.categoria} onChange={(event) => updateField("categoria", event.target.value)}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Dificultad
          <select value={form.dificultad} onChange={(event) => updateField("dificultad", event.target.value)}>
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Tiempo en minutos
          <input
            required
            min={1}
            type="number"
            value={form.tiempoMin}
            onChange={(event) => updateField("tiempoMin", event.target.value)}
          />
        </label>

        <label>
          Porciones
          <input
            required
            min={1}
            type="number"
            value={form.porciones}
            onChange={(event) => updateField("porciones", event.target.value)}
          />
        </label>
      </div>

      <label>
        URL de imagen
        <input
          type="url"
          value={form.imagenUrl}
          onChange={(event) => updateField("imagenUrl", event.target.value)}
        />
      </label>

      <label>
        Tags separados por coma
        <input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
      </label>

      <section className="form-section">
        <div className="section-title">
          <h2>Ingredientes</h2>
          <button className="button ghost" type="button" onClick={addIngredient}>
            Agregar
          </button>
        </div>

        {form.ingredientes.map((ingredient, index) => (
          <div className="ingredient-row" key={index}>
            <input
              required
              placeholder="Nombre"
              value={ingredient.nombre}
              onChange={(event) => updateIngredient(index, "nombre", event.target.value)}
            />
            <input
              required
              min={0}
              placeholder="Cantidad"
              type="number"
              value={ingredient.cantidad}
              onChange={(event) => updateIngredient(index, "cantidad", event.target.value)}
            />
            <input
              required
              placeholder="Unidad"
              value={ingredient.unidad}
              onChange={(event) => updateIngredient(index, "unidad", event.target.value)}
            />
            <button
              className="button danger"
              disabled={!canRemoveIngredient}
              type="button"
              onClick={() => removeIngredient(index)}
            >
              Quitar
            </button>
          </div>
        ))}
      </section>

      <section className="form-section">
        <div className="section-title">
          <h2>Pasos</h2>
          <button className="button ghost" type="button" onClick={addStep}>
            Agregar
          </button>
        </div>

        {form.pasos.map((step, index) => (
          <div className="step-row" key={index}>
            <textarea
              required
              rows={2}
              placeholder={`Paso ${index + 1}`}
              value={step}
              onChange={(event) => updateStep(index, event.target.value)}
            />
            <button
              className="button danger"
              disabled={!canRemoveStep}
              type="button"
              onClick={() => removeStep(index)}
            >
              Quitar
            </button>
          </div>
        ))}
      </section>

      <button className="button primary submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
};

export default RecipeForm;
