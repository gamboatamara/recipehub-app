const express = require("express");

const {
  listRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require("../controllers/recipe.controller");
const {
  listCommentsByRecipe,
  createComment
} = require("../controllers/comment.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", listRecipes);
router.post("/", authMiddleware, createRecipe);
router.get("/:id/comentarios", listCommentsByRecipe);
router.post("/:id/comentarios", authMiddleware, createComment);
router.get("/:id", getRecipeById);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;
