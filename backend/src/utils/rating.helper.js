const mongoose = require("mongoose");

const Comment = require("../models/Comment");

const DEFAULT_RATING_DATA = {
  averageRating: 0,
  ratingsCount: 0
};

const getAverageRatingsByRecipeIds = async (recipeIds) => {
  const normalizedIds = recipeIds
    .map((recipeId) => recipeId.toString())
    .filter((recipeId, index, array) => array.indexOf(recipeId) === index)
    .filter((recipeId) => mongoose.Types.ObjectId.isValid(recipeId))
    .map((recipeId) => new mongoose.Types.ObjectId(recipeId));

  if (normalizedIds.length === 0) {
    return new Map();
  }

  const results = await Comment.aggregate([
    {
      $match: {
        recetaId: { $in: normalizedIds }
      }
    },
    {
      $group: {
        _id: "$recetaId",
        averageRating: { $avg: "$calificacion" },
        ratingsCount: { $sum: 1 }
      }
    }
  ]);

  return new Map(
    results.map((item) => [
      item._id.toString(),
      {
        averageRating: Number(item.averageRating.toFixed(1)),
        ratingsCount: item.ratingsCount
      }
    ])
  );
};

const getAverageRatingByRecipeId = async (recipeId) => {
  const ratingsMap = await getAverageRatingsByRecipeIds([recipeId]);
  return ratingsMap.get(recipeId.toString()) || DEFAULT_RATING_DATA;
};

const attachAverageRatingToRecipe = (recipe, ratingData = DEFAULT_RATING_DATA) => {
  const recipeObject = typeof recipe.toObject === "function"
    ? recipe.toObject()
    : recipe;

  return {
    ...recipeObject,
    averageRating: ratingData.averageRating,
    ratingsCount: ratingData.ratingsCount
  };
};

module.exports = {
  attachAverageRatingToRecipe,
  getAverageRatingByRecipeId,
  getAverageRatingsByRecipeIds
};
