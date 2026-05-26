const { UserModel } = require("../models/user.model");
const { OrganizationModel } = require("../models/organization.model");

async function createOrganization(req, res) {
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
}

async function getOrganization(req, res) {
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
}

async function addMemberToOrganization(req, res) {
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
      $push: {
        members: memberUser._id,
      },
    }
  );

  res.json({
    message: "New member added!",
  });
}

async function deleteMemberFromOrganization(req, res) {
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
    }
  );

  res.json({
    message: "member deleted!",
  });
}

async function deleteOrganization(req, res) {
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
}

module.exports = {
  createOrganization,
  getOrganization,
  addMemberToOrganization,
  deleteMemberFromOrganization,
  deleteOrganization,
};