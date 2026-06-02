const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Recipe = require("../models/Recipe");

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI no está definido en las variables de entorno");

    await mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB");

    await Recipe.deleteMany({});
    await User.deleteMany({});
    console.log("Colecciones limpiadas");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await User.create({
      nombre: "Chef Demo",
      email: "chef@recipehub.com",
      password: hashedPassword,
      bio: "Apasionado de la cocina y bloguero de recetas"
    });

    console.log(`Usuario creado: ${user.email} (contraseña: password123)`);

    await Recipe.insertMany([
      {
        titulo: "Pancakes de Avena",
        descripcion: "Deliciosos pancakes esponjosos y saludables perfectos para el desayuno.",
        categoria: "Desayuno",
        tiempoMin: 20,
        porciones: 4,
        dificultad: "Fácil",
        ingredientes: [
          { nombre: "avena", cantidad: 1, unidad: "taza" },
          { nombre: "huevo", cantidad: 2, unidad: "unidades" },
          { nombre: "leche", cantidad: 0.5, unidad: "taza" },
          { nombre: "miel", cantidad: 2, unidad: "cucharadas" },
          { nombre: "polvo de hornear", cantidad: 1, unidad: "cucharadita" }
        ],
        pasos: [
          "Licuar todos los ingredientes hasta obtener una mezcla homogénea.",
          "Dejar reposar la mezcla 5 minutos.",
          "Calentar una sartén antiadherente a fuego medio y engrasar ligeramente.",
          "Verter media taza de mezcla por pancake.",
          "Cocinar 2 minutos por lado hasta que estén dorados.",
          "Servir con frutas frescas o más miel."
        ],
        tags: ["saludable", "rápido", "vegetariano", "sin gluten"],
        autorId: user._id
      },
      {
        titulo: "Pasta Carbonara Clásica",
        descripcion: "La clásica pasta italiana con salsa cremosa de huevo y queso sin crema.",
        categoria: "Cena",
        tiempoMin: 30,
        porciones: 2,
        dificultad: "Media",
        ingredientes: [
          { nombre: "espagueti", cantidad: 200, unidad: "gramos" },
          { nombre: "panceta", cantidad: 100, unidad: "gramos" },
          { nombre: "yemas de huevo", cantidad: 3, unidad: "unidades" },
          { nombre: "queso parmesano rallado", cantidad: 60, unidad: "gramos" },
          { nombre: "pimienta negra molida", cantidad: 1, unidad: "cucharadita" },
          { nombre: "sal", cantidad: 1, unidad: "al gusto" }
        ],
        pasos: [
          "Cocinar el espagueti en agua abundante con sal hasta que esté al dente.",
          "Reservar 1 taza del agua de cocción antes de escurrir.",
          "Dorar la panceta en sartén a fuego medio sin aceite hasta que esté crujiente.",
          "Batir las yemas con el queso rallado y la pimienta en un bol.",
          "Agregar la pasta escurrida a la sartén con la panceta y apagar el fuego.",
          "Verter la mezcla de yemas y mezclar rápido, añadiendo agua de cocción para crear la salsa.",
          "Servir inmediatamente con más queso y pimienta."
        ],
        tags: ["italiana", "clásica", "pasta"],
        autorId: user._id
      },
      {
        titulo: "Brownie de Chocolate Húmedo",
        descripcion: "Brownie denso y húmedo, el postre perfecto para los amantes del chocolate intenso.",
        categoria: "Postre",
        tiempoMin: 45,
        porciones: 8,
        dificultad: "Fácil",
        ingredientes: [
          { nombre: "chocolate negro 70%", cantidad: 200, unidad: "gramos" },
          { nombre: "mantequilla sin sal", cantidad: 150, unidad: "gramos" },
          { nombre: "azúcar", cantidad: 200, unidad: "gramos" },
          { nombre: "huevos", cantidad: 3, unidad: "unidades" },
          { nombre: "harina de trigo", cantidad: 100, unidad: "gramos" },
          { nombre: "esencia de vainilla", cantidad: 1, unidad: "cucharadita" },
          { nombre: "sal", cantidad: 0.25, unidad: "cucharadita" }
        ],
        pasos: [
          "Precalentar el horno a 180°C. Engrasar y enharinar un molde cuadrado de 20cm.",
          "Derretir el chocolate con la mantequilla a baño maría, mezclando hasta que esté liso.",
          "Retirar del calor, incorporar el azúcar y mezclar bien.",
          "Agregar los huevos uno a uno, batiendo tras cada adición.",
          "Añadir la vainilla y la sal.",
          "Tamizar la harina sobre la mezcla e incorporar con movimientos envolventes.",
          "Verter en el molde preparado y hornear 25-30 minutos.",
          "Dejar enfriar completamente antes de cortar."
        ],
        tags: ["chocolate", "postre", "fácil", "horneado"],
        autorId: user._id
      }
    ]);

    console.log("3 recetas de prueba creadas exitosamente");
    console.log("Seed completado");
    process.exit(0);
  } catch (error) {
    console.error("Error en el seed:", error.message);
    process.exit(1);
  }
};

seed();
