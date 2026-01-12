const express = require("express");
require("dotenv").config();
const zod = require("zod");
const { User } = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const JWT_SECRET = process.env.JWT_SECRET;

const userdetails = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  try {
    const isValidInput = userdetails.safeParse(req.body);

    if (!isValidInput.success) {
      return res.send("Invalid input");
    }
    const { username, password, firstName, lastName } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("User already exists");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashPassword,
      firstName,
      lastName,
    });
    await user.save();
    const userId = user._id;
    const token = await jwt.sign({ userId }, JWT_SECRET);
    res.json({
      message: "User created successfully",
      token: token,
    });
  } catch (err) {
    console.log("error occured while signup user", err);
    res.send("Something went wrong");
  }
});
router.post("/signin", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      return res.send("Invalid input");
    }
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.send("Invalid Credentials");
    }
    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!verifyPassword) {
      return res.send("Invalid Credentials");
    }
    const userId = existingUser._id;
    const token = await jwt.sign({ userId }, JWT_SECRET);
    res.cookie("token", token);
    return res.status(200).json({
      message: "User login successfully",
      token: token,
    });
  } catch (err) {
    console.log("error occured while login", err);
    res.send("Something went wrong");
  }
});

const updatebody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});
router.put("/update", authMiddleware, async (req, res) => {
  const response = updatebody.safeParse(req.body);

  if (!response.success) {
    res.status(411).json({
      message: "Error whle updating Information",
    });
  }
  const updateData = {};
  if (req.body.firstName) {
    updateData.firstName = req.body.firstName;
  }
  if (req.body.lastName) {
    updateData.lastName = req.body.lastName;
  }
  if (req.body.password) {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    updateData.password = hashPassword;
  }
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }
  const user = await User.findByIdAndUpdate(req.userId, updateData);
  return res.json({
    message: "updated Successfully",
  });
});
module.exports = router;
