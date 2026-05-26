const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { createBoard, getBoards } = require("../controllers/board.controller");

const boardRouter = express.Router();

boardRouter.post("/board", authMiddleware, createBoard);
boardRouter.get("/boards", authMiddleware, getBoards);

module.exports = {
  boardRouter,
};