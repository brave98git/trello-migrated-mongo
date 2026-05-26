const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  createIssue,
  getIssues,
  updateIssue,
} = require("../controllers/issue.controller");

const issueRouter = express.Router();

issueRouter.post("/issue", authMiddleware, createIssue);
issueRouter.get("/issues", authMiddleware, getIssues);
issueRouter.put("/issues", authMiddleware, updateIssue);

module.exports = {
  issueRouter,
};