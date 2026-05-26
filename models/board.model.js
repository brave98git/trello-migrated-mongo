const mongoose = require("./dbConnection");
const boardSchema = mongoose.Schema({
  title: String,
  organization: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
});
const BoardModel = mongoose.model("boards", boardSchema);
module.exports = {
  BoardModel,
};
