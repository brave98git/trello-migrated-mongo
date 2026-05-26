const mongoose = require("./dbConnection");
const organizationSchema = mongoose.Schema({
  title: String,
  description: String,
  admin: mongoose.Types.ObjectId,
  members: [mongoose.Types.ObjectId],
});
const OrganizationModel = mongoose.model("organization", organizationSchema);
module.exports = {
  OrganizationModel,
};
