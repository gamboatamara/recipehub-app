const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const commentRoutes = require("./routes/comment.routes");
const recipeRoutes = require("./routes/recipe.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/comentarios", commentRoutes);
app.use("/api/recetas", recipeRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "RecipeHub API",
    status: "ok",
    message: "API funcionando correctamente"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

module.exports = app;
