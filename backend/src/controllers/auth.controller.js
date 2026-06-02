const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const env = require("../config/env");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const buildUserResponse = (user) => {
  return {
    id: user._id,
    nombre: user.nombre,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
};

const register = async (req, res) => {
  try {
    const { nombre, email, password, bio, avatarUrl } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      email: normalizedEmail,
      password: hashedPassword,
      bio: bio || "",
      avatarUrl: avatarUrl || ""
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({
      user: buildUserResponse(req.user)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting authenticated user",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  me
};
