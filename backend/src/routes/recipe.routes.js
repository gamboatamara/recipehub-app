const express = require("express");

const {
  listRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require("../controllers/recipe.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", listRecipes);
router.post("/", authMiddleware, createRecipe);
router.get("/:id", getRecipeById);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;
