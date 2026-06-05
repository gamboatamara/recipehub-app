const Recipe = require("../models/Recipe");
const {
  attachAverageRatingToRecipe,
  getAverageRatingsByRecipeIds
} = require("../utils/rating.helper");
const {
  deleteRecipeImage,
  uploadRecipeImageFromUrl
} = require("../utils/cloudinary.helper");

const deleteCloudinaryImageIfExists = async (publicId) => {
  try {
    await deleteRecipeImage(publicId);
  } catch (error) {
    console.warn("No se pudo eliminar la imagen anterior de Cloudinary:", error.message);
  }
};

const listRecipes = async (req, res) => {
  try {
    const { categoria, dificultad, tags } = req.query;
    const filter = {};

    if (categoria) filter.categoria = categoria;
    if (dificultad) filter.dificultad = dificultad;
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) filter.tags = { $in: tagList };
    }

    const recipes = await Recipe.find(filter)
      .populate("autorId", "nombre email avatarUrl")
      .sort({ createdAt: -1 });

    const ratingsMap = await getAverageRatingsByRecipeIds(
      recipes.map((recipe) => recipe._id)
    );

    const recipesWithRatings = recipes.map((recipe) =>
      attachAverageRatingToRecipe(recipe, ratingsMap.get(recipe._id.toString()))
    );

    return res.status(200).json({ recipes: recipesWithRatings });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las recetas", error: error.message });
  }
};

const createRecipe = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      tiempoMin,
      porciones,
      dificultad,
      ingredientes,
      pasos,
      tags,
      imagenUrl
    } = req.body;

    if (!titulo || !descripcion || !categoria || !tiempoMin || !porciones || !dificultad || !ingredientes || !pasos) {
      return res.status(400).json({ message: "Todos los campos requeridos deben estar presentes" });
    }

    if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos un ingrediente" });
    }

    if (!Array.isArray(pasos) || pasos.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos un paso" });
    }

    const uploadedImage = await uploadRecipeImageFromUrl(imagenUrl);

    const recipe = await Recipe.create({
      titulo,
      descripcion,
      categoria,
      tiempoMin,
      porciones,
      dificultad,
      ingredientes,
      pasos,
      tags: tags || [],
      autorId: req.user._id,
      imagenUrl: uploadedImage.secureUrl,
      imagenPublicId: uploadedImage.publicId
    });

    return res.status(201).json({ message: "Receta creada exitosamente", recipe });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
        ...(error.details ? { error: error.details } : {})
      });
    }
    return res.status(500).json({ message: "Error al crear la receta", error: error.message });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("autorId", "nombre email avatarUrl bio");

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const ratingsMap = await getAverageRatingsByRecipeIds([recipe._id]);
    const recipeWithRating = attachAverageRatingToRecipe(
      recipe,
      ratingsMap.get(recipe._id.toString())
    );

    return res.status(200).json({ recipe: recipeWithRating });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la receta", error: error.message });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    if (recipe.autorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No estás autorizado para editar esta receta" });
    }

    const allowedFields = [
      "titulo", "descripcion", "categoria", "tiempoMin",
      "porciones", "dificultad", "ingredientes", "pasos",
      "tags", "imagenUrl"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.imagenUrl !== undefined) {
      const uploadedImage = await uploadRecipeImageFromUrl(req.body.imagenUrl);

      updates.imagenUrl = uploadedImage.secureUrl;
      updates.imagenPublicId = uploadedImage.publicId;
    }

    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("autorId", "nombre email avatarUrl");

    if (req.body.imagenUrl !== undefined && recipe.imagenPublicId) {
      await deleteCloudinaryImageIfExists(recipe.imagenPublicId);
    }

    return res.status(200).json({ message: "Receta actualizada exitosamente", recipe: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
        ...(error.details ? { error: error.details } : {})
      });
    }
    return res.status(500).json({ message: "Error al actualizar la receta", error: error.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    if (recipe.autorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No estás autorizado para eliminar esta receta" });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    if (recipe.imagenPublicId) {
      await deleteCloudinaryImageIfExists(recipe.imagenPublicId);
    }

    return res.status(200).json({ message: "Receta eliminada exitosamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la receta", error: error.message });
  }
};

module.exports = {
  listRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe
};
