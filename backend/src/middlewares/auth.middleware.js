const jwt = require("jsonwebtoken");

const User = require("../models/User");
const env = require("../config/env");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists"
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;
