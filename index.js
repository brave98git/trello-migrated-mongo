const express = require("express");
const app = express();
const PORT = 3000;
const jwt = require("jsonwebtoken");

const { authMiddleware } = require("./middleware/auth.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/trello")

const { OrganizationModel, UserModel} = require("./models/db.js");
app.use(express.json());


//SignIn and SignUp
//SignUp 
app.post("/signup",async (req, res) => {
  const {username,password} = req.body;

  const userExists = await UserModel.findOne({
    username: username
  });

  if (userExists) {
    res.status(411).json({
      message: "User with this username already exists",
    });
    return;
  }

  const newUser = await UserModel.create({
    username: username,
    password: password
  })
  
  res.json({
    message: "You have signed up successfully",
    id: newUser._id
  });
});
//SignIn
app.post("/signin",async (req, res) => {
  const {username,password} = req.body;

  const userExists = await UserModel.findOne({
    username : username,
    password : password
  })
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
app.post("/createOrganization", authMiddleware, async(req, res) => {
  const userId = req.userId;
  const newOrganization =  await OrganizationModel.create({
    title: req.body.title,
    description: req.body.description,
    admin: userId,
    members: []
  })
  res.json({
    message: "Org created",
    id: newOrganization._id,
    organizationName: newOrganization.title
  });
});



//Add Members To Organization
app.post("/add-member-to-organization", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const memberUsername = req.body.memberUsername;

  const organization = await OrganizationModel.findOne({
    _id: organizationId
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
    username: memberUsername
  })

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
      members: memberUser._id
    }
  }
);

  res.json({
    message: "New member added!",
  });
});


//Get Organizations
app.get("/organization", authMiddleware, async (req, res) => {

  const userId = req.userId;
  const organizationId = req.query.organizationId;

  const organization = await OrganizationModel.findOne({
    _id: organizationId
  })

  if (!organization) {
    return res.status(411).json({
      message: "Either this org doesnt exist or you are not admin"
    });
  }

  const members = await UserModel.find({
    _id: organization.members
  })

  res.json({
    organization:{
      title: organization.title,
      desc: organization.description,
      members: members.map(m => ({
        username: m.username,
        id: m._id
      }))
    }
  });
});


//Delete
app.delete("/delete-member-from-organization",authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const memberUsername = req.body.memberUsername;

  const organization = await OrganizationModel.findOne({
    _id: organizationId
  })

  if (!organization || organization.admin.toString() !== userId) {
    res.status(411).json({
      message:
        "Either this org doesnt exist or you are not an admin of this org",
    });
    return;
  }

  const memberUser = await UserModel.findOne({
    username: memberUsername
  })

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
      members: memberUser._id
    }
  })

  res.json({
    message: "member deleted!",
  });
});

app.delete("/delete-organization",authMiddleware,async (req, res) => {
  const userId = req.userId;

  const organizationId = req.body.organizationId;

  const deleteOrganization = await OrganizationModel.findOneAndDelete({
    _id: organizationId,
    admin: userId
  })

  if (!deleteOrganization) {
    return res.status(403).json({
      message:
        "Organization not found or you are not admin",
    });
  }

  res.json({
    message: "Organization deleted successfully"
  });
});

app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});
