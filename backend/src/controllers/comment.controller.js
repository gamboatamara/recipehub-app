const mongoose = require("mongoose");

const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");
const {
  getAverageRatingByRecipeId
} = require("../utils/rating.helper");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCommentBody = (body) => {
  const { texto, calificacion } = body;

  if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
    return "El texto del comentario es requerido";
  }

  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return "La calificacion debe ser un numero entero entre 1 y 5";
  }

  return null;
};

const listCommentsByRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const recipe = await Recipe.findById(id).select("_id");

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const comments = await Comment.find({ recetaId: id })
      .populate("usuarioId", "nombre email avatarUrl")
      .sort({ createdAt: -1 });

    const ratingData = await getAverageRatingByRecipeId(id);

    return res.status(200).json({
      comments,
      averageRating: ratingData.averageRating,
      ratingsCount: ratingData.ratingsCount
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los comentarios",
      error: error.message
    });
  }
};

const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const validationMessage = validateCommentBody(req.body);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const recipe = await Recipe.findById(id).select("_id");

    if (!recipe) {
      return res.status(404).json({ message: "Receta no encontrada" });
    }

    const comment = await Comment.create({
      recetaId: id,
      usuarioId: req.user._id,
      texto: req.body.texto.trim(),
      calificacion: req.body.calificacion,
      createdAt: new Date()
    });

    await comment.populate("usuarioId", "nombre email avatarUrl");

    return res.status(201).json({
      message: "Comentario creado exitosamente",
      comment
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Error al crear el comentario",
      error: error.message
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comment.usuarioId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "No estas autorizado para eliminar este comentario"
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Comentario eliminado exitosamente"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el comentario",
      error: error.message
    });
  }
};

module.exports = {
  listCommentsByRecipe,
  createComment,
  deleteComment
};
