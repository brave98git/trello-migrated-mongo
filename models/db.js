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

const UserModel = mongoose.model("users", userSchema);
const OrganizationModel = mongoose.model("organization", organizationSchema);

module.exports = {
  UserModel,
  OrganizationModel,
};
