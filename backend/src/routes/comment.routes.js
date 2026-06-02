const express = require("express");

const { deleteComment } = require("../controllers/comment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.delete("/:id", authMiddleware, deleteComment);

module.exports = router;
