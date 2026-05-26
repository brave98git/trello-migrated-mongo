const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  createOrganization,
  getOrganization,
  addMemberToOrganization,
  deleteMemberFromOrganization,
  deleteOrganization,
} = require("../controllers/organization.controller");

const organizationRouter = express.Router();

organizationRouter.post(
  "/createOrganization",
  authMiddleware,
  createOrganization,
);

organizationRouter.get("/organization", authMiddleware, getOrganization);

organizationRouter.post(
  "/add-member-to-organization",
  authMiddleware,
  addMemberToOrganization,
);

organizationRouter.delete(
  "/delete-member-from-organization",
  authMiddleware,
  deleteMemberFromOrganization,
);

organizationRouter.delete(
  "/delete-organization",
  authMiddleware,
  deleteOrganization,
);

module.exports = {
  organizationRouter,
};
