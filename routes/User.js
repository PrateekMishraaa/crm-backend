import express from "express";
import dotenv from "dotenv"
dotenv.config()
const SecretKey = process.env.JWTSECRET
const router = express.Router();
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken"
router.post("/signup", async (req, res) => {
  const { firstName,lastName, mobile, email, password } = req.body;

  if ( !firstName || !lastName || !mobile || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account already exists with this email" });
    }

    const newUser = await User.create({
        firstName,
        lastName,
        mobile,
      email: email.toLowerCase(),
      password,
    });

    return res.status(201).json({
      message: "Account has been created",
      user: { email: newUser.email,firstName:newUser.firstName, lastName:newUser.lastName, mobile:newUser.mobile, password:newUser.password, createdAt: newUser.createdAt },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are present
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = JWT.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      SecretKey,
      { expiresIn: "7d" }
    );

    // Respond with token and user info
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        mobile: existingUser.mobile,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
