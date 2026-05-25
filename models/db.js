const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  password: String,
});

const organizationSchema = mongoose.Schema({
  title: String,
  description: String,
  admin: mongoose.Types.ObjectId,
  members: [mongoose.Types.ObjectId],
});

const boardSchema = mongoose.Schema({
  title: String,
  organization: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
});

const issueSchema = mongoose.Schema({
  title: String,
  description: String,
  board: mongoose.Types.ObjectId,
  assignedTo: mongoose.Types.ObjectId,
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
  },
  createdBy: mongoose.Types.ObjectId,
});

const UserModel = mongoose.model("users", userSchema);
const OrganizationModel = mongoose.model("organization", organizationSchema);
const BoardModel = mongoose.model("boards", boardSchema);
const IssueModel = mongoose.model("issues", issueSchema);

module.exports = {
  UserModel,
  OrganizationModel,
  BoardModel,
  IssueModel,
};
