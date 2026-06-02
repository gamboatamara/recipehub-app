const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  recetaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: [true, "La receta es requerida"]
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es requerido"]
  },
  texto: {
    type: String,
    required: [true, "El texto del comentario es requerido"],
    trim: true,
    maxlength: [500, "El comentario no puede exceder 500 caracteres"]
  },
  calificacion: {
    type: Number,
    required: [true, "La calificacion es requerida"],
    min: [1, "La calificacion minima es 1"],
    max: [5, "La calificacion maxima es 5"]
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

commentSchema.index({ recetaId: 1, createdAt: -1 });
commentSchema.index({ usuarioId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
