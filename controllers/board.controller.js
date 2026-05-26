const { OrganizationModel } = require("../models/organization.model");
const { BoardModel } = require("../models/board.model");

async function createBoard(req, res) {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const title = req.body.title;

  const organization = await OrganizationModel.findOne({
    _id: organizationId,
  });

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  const newBoard = await BoardModel.create({
    title: title,
    organization: organizationId,
    createdBy: userId,
  });

  res.json({
    message: "Board created",
    id: newBoard._id,
    title: newBoard.title,
  });
}

async function getBoards(req, res) {
  const userId = req.userId;
  const organizationId = req.query.organizationId;

  const organization = await OrganizationModel.findOne({
    _id: organizationId,
  });

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  const boards = await BoardModel.find({
    organization: organizationId,
  });

  res.json({
    boards: boards.map((board) => ({
      id: board._id,
      title: board.title,
      createdBy: board.createdBy,
    })),
  });
}

module.exports = {
  createBoard,
  getBoards,
};