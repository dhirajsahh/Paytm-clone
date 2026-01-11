const express = require("express");
require("dotenv").config();
const zod = require("zod");
const { User } = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
module.exports = router;
