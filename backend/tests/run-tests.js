const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/recipehub-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const app = require("../src/app");
const User = require("../src/models/User");

const originalFindById = User.findById;

const startServer = async () => {
  const server = app.listen(0);

  await new Promise((resolve) => {
    server.once("listening", resolve);
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  return { server, baseUrl };
};

const stopServer = async (server) => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const runTest = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    return false;
  }
};

const run = async () => {
  let server;
  let baseUrl = "";
  let passed = 0;

  try {
    const serverData = await startServer();
    server = serverData.server;
    baseUrl = serverData.baseUrl;

    const tests = [
      {
        name: "GET /api/health responde status 200 y status ok",
        fn: async () => {
          const response = await fetch(`${baseUrl}/api/health`);
          const body = await response.json();

          assert.equal(response.status, 200);
          assert.equal(body.status, "ok");
          assert.ok(body.timestamp);
        }
      },
      {
        name: "POST /api/recetas/:id/comentarios sin token responde 401",
        fn: async () => {
          const response = await fetch(
            `${baseUrl}/api/recetas/507f1f77bcf86cd799439011/comentarios`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                texto: "Comentario de prueba",
                calificacion: 5
              })
            }
          );

          const body = await response.json();

          assert.equal(response.status, 401);
          assert.equal(body.message, "Authentication token is required");
        }
      },
      {
        name: "POST /api/recetas/:id/comentarios con calificacion invalida responde 400",
        fn: async () => {
          User.findById = async () => ({
            _id: "507f1f77bcf86cd799439012",
            nombre: "Usuario Test",
            email: "test@example.com"
          });

          const token = jwt.sign(
            { id: "507f1f77bcf86cd799439012" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          const response = await fetch(
            `${baseUrl}/api/recetas/507f1f77bcf86cd799439011/comentarios`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                texto: "Comentario invalido",
                calificacion: 8
              })
            }
          );

          const body = await response.json();

          assert.equal(response.status, 400);
          assert.equal(body.message, "La calificacion debe ser un numero entero entre 1 y 5");

          User.findById = originalFindById;
        }
      }
    ];

    for (const currentTest of tests) {
      const success = await runTest(currentTest.name, currentTest.fn);

      if (success) {
        passed += 1;
      }
    }
  } finally {
    User.findById = originalFindById;
    await stopServer(server);
  }

  console.log(`${passed}/3 tests passed`);

  if (passed !== 3) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error("Error running tests");
  console.error(error);
  process.exit(1);
});
