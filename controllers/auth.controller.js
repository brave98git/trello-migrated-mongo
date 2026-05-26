const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");

async function signup(req, res) {
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
}

async function signin(req, res) {
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
    "trello"
  );

  res.json({
    token,
  });
}

module.exports = {
  signup,
  signin,
};