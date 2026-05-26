const mongoose = require("./dbConnection");
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
const IssueModel = mongoose.model("issues", issueSchema);
module.exports = {
  IssueModel,
};
