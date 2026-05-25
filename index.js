const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require("jsonwebtoken");

const { authMiddleware } = require("./middleware/auth.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/trello");

const {
  OrganizationModel,
  UserModel,
  BoardModel,
  IssueModel,
} = require("./models/db.js");

app.use(express.json());

//SignIn and SignUp
//SignUp
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await UserModel.findOne({
    username: username,
  });

  if (userExists) {
    res.status(411).json({
      message: "User with this username already exists",
    });
    return;
  }

  const newUser = await UserModel.create({
    username: username,
    password: password,
  });

  res.json({
    message: "You have signed up successfully",
    id: newUser._id,
  });
});
//SignIn
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await UserModel.findOne({
    username: username,
    password: password,
  });
  if (!userExists) {
    return res.status(403).json({
      message: "Incorrect credentials",
    });
  }

  const token = jwt.sign(
    {
      userId: userExists._id,
    },
    "trello",
  );

  res.json({
    token,
  });
});

//Create Organization
app.post("/createOrganization", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const newOrganization = await OrganizationModel.create({
    title: req.body.title,
    description: req.body.description,
    admin: userId,
    members: [],
  });
  res.json({
    message: "Org created",
    id: newOrganization._id,
    organizationName: newOrganization.title,
  });
});
//Get Organizations
app.get("/organization", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.query.organizationId;

  const organization = await OrganizationModel.findOne({
    _id: organizationId,
  });

  if (!organization) {
    return res.status(411).json({
      message: "Either this org doesnt exist or you are not admin",
    });
  }

  const members = await UserModel.find({
    _id: organization.members,
  });

  res.json({
    organization: {
      title: organization.title,
      desc: organization.description,
      members: members.map((m) => ({
        username: m.username,
        id: m._id,
      })),
    },
  });
});

//Add Members To Organization
app.post("/add-member-to-organization", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const memberUsername = req.body.memberUsername;

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

  // const memberUser = users.find((u) => u.username === memberUsername);
  const memberUser = await UserModel.findOne({
    username: memberUsername,
  });

  if (!memberUser) {
    res.status(411).json({
      message: "No user with this username exists in our db",
    });
    return;
  }

  // organization.members.push(memberUser.id);
  await OrganizationModel.updateOne(
    { _id: organizationId },
    {
      $push: {
        members: memberUser._id,
      },
    },
  );

  res.json({
    message: "New member added!",
  });
});

//Add board
app.post("/board", authMiddleware, async (req, res) => {
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
});
app.get("/boards", authMiddleware, async (req, res) => {
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
});

app.post("/issue", authMiddleware, async (req, res) => {
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
});

// Get issues
app.get("/issues", authMiddleware, async (req, res) => {
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
});

// Update issue
app.put("/issues", authMiddleware, async (req, res) => {
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
});

//Delete
app.delete(
  "/delete-member-from-organization",
  authMiddleware,
  async (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUsername = req.body.memberUsername;

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

    const memberUser = await UserModel.findOne({
      username: memberUsername,
    });

    if (!memberUser) {
      res.status(411).json({
        message: "No user with this username exists in our db",
      });
      return;
    }

    await OrganizationModel.updateOne(
      { _id: organizationId },
      {
        $pull: {
          members: memberUser._id,
        },
      },
    );

    res.json({
      message: "member deleted!",
    });
  },
);

app.delete("/delete-organization", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const organizationId = req.body.organizationId;

  const deleteOrganization = await OrganizationModel.findOneAndDelete({
    _id: organizationId,
    admin: userId,
  });

  if (!deleteOrganization) {
    return res.status(403).json({
      message: "Organization not found or you are not admin",
    });
  }

  res.json({
    message: "Organization deleted successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});
