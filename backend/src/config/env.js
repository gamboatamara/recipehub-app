const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPaths = [
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../.env")
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
};

if (!env.mongoUri) {
  throw new Error("MONGO_URI is required in environment variables");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required in environment variables");
}

module.exports = env;
