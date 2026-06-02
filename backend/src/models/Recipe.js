const mongoose = require("mongoose");

const ingredienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del ingrediente es requerido"],
      trim: true
    },
    cantidad: {
      type: Number,
      required: [true, "La cantidad del ingrediente es requerida"],
      min: [0, "La cantidad no puede ser negativa"]
    },
    unidad: {
      type: String,
      required: [true, "La unidad del ingrediente es requerida"],
      trim: true
    }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [120, "El título no puede exceder 120 caracteres"]
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"]
    },
    categoria: {
      type: String,
      required: [true, "La categoría es requerida"],
      enum: {
        values: ["Desayuno", "Almuerzo", "Cena", "Postre", "Merienda", "Entrada", "Bebida"],
        message: "Categoría no válida"
      }
    },
    tiempoMin: {
      type: Number,
      required: [true, "El tiempo de preparación es requerido"],
      min: [1, "El tiempo debe ser al menos 1 minuto"]
    },
    porciones: {
      type: Number,
      required: [true, "Las porciones son requeridas"],
      min: [1, "Las porciones deben ser al menos 1"]
    },
    dificultad: {
      type: String,
      required: [true, "La dificultad es requerida"],
      enum: {
        values: ["Fácil", "Media", "Difícil"],
        message: "Dificultad no válida. Use: Fácil, Media o Difícil"
      }
    },
    ingredientes: {
      type: [ingredienteSchema],
      required: [true, "Los ingredientes son requeridos"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Debe incluir al menos un ingrediente"
      }
    },
    pasos: {
      type: [String],
      required: [true, "Los pasos son requeridos"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Debe incluir al menos un paso"
      }
    },
    tags: {
      type: [String],
      default: []
    },
    autorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El autor es requerido"]
    },
    imagenUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

recipeSchema.index({ categoria: 1 });
recipeSchema.index({ dificultad: 1 });
recipeSchema.index({ tags: 1 });

module.exports = mongoose.model("Recipe", recipeSchema);
