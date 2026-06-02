const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "The user name is required"],
      trim: true,
      minlength: [2, "The user name must have at least 2 characters"],
      maxlength: [80, "The user name cannot exceed 80 characters"]
    },

    email: {
      type: String,
      required: [true, "The email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ]
    },

    password: {
      type: String,
      required: [true, "The password is required"],
      minlength: [6, "The password must have at least 6 characters"],
      select: false
    },

    bio: {
      type: String,
      default: "",
      maxlength: [250, "The bio cannot exceed 250 characters"]
    },

    avatarUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);