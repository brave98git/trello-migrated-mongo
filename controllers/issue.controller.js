const { OrganizationModel } = require("../models/organization.model");
const { BoardModel } = require("../models/board.model");
const { IssueModel } = require("../models/issue.model");

async function createIssue(req, res) {
  const userId = req.userId;
  const title = req.body.title;
  const description = req.body.description;
  const boardId = req.body.boardId;
  const assignedTo = req.body.assignedTo;

  const board = await BoardModel.findOne({
    _id: boardId,
  });

  if (!board) {
    res.status(411).json({
      message: "Board does not exist",
    });
    return;
  }

  const organization = await OrganizationModel.findOne({
    _id: board.organization,
  });

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  const newIssue = await IssueModel.create({
    title: title,
    description: description,
    board: boardId,
    assignedTo: assignedTo,
    createdBy: userId,
  });

  res.json({
    message: "Issue created",
    id: newIssue._id,
    title: newIssue.title,
    status: newIssue.status,
  });
}

async function getIssues(req, res) {
  const userId = req.userId;
  const boardId = req.query.boardId;

  const board = await BoardModel.findOne({
    _id: boardId,
  });

  if (!board) {
    res.status(411).json({
      message: "Board does not exist",
    });
    return;
  }

  const organization = await OrganizationModel.findOne({
    _id: board.organization,
  });

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  const issues = await IssueModel.find({
    board: boardId,
  });

  res.json({
    issues: issues.map((issue) => ({
      id: issue._id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      assignedTo: issue.assignedTo,
      createdBy: issue.createdBy,
    })),
  });
}

async function updateIssue(req, res) {
  const userId = req.userId;
  const issueId = req.body.issueId;
  const title = req.body.title;
  const description = req.body.description;
  const status = req.body.status;
  const assignedTo = req.body.assignedTo;

  const issue = await IssueModel.findOne({
    _id: issueId,
  });

  if (!issue) {
    res.status(411).json({
      message: "Issue does not exist",
    });
    return;
  }

  const board = await BoardModel.findOne({
    _id: issue.board,
  });

  if (!board) {
    res.status(411).json({
      message: "Board does not exist",
    });
    return;
  }

  const organization = await OrganizationModel.findOne({
    _id: board.organization,
  });

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  await IssueModel.updateOne(
    {
      _id: issueId,
    },
    {
      title: title,
      description: description,
      status: status,
      assignedTo: assignedTo,
    }
  );

  res.json({
    message: "Issue updated",
  });
}

module.exports = {
  createIssue,
  getIssues,
  updateIssue,
};