const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const reqAuthorization = require("../middleware/reqAuthorization");
const crypto = require("crypto");
const VerificationToken = require("../models/verificationToken-model");
const handleSignUpErrors = require("../utils/handleSignUpErrors");
const sendEmail = require("../utils/sendEmail");

//sign-up end point
router.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  const verifyToken = crypto.randomBytes(32).toString("hex");

  try {
    const newUser = new User({
      name,
      email,
      password,
    });

    const user = await newUser.save();
    if (user) {
      res.status(201).json({ message: "Account Created" });

      const token = new VerificationToken({
        userId: user._id,
        token: verifyToken,
      });
      const savedToken = await token.save();
      if (savedToken) {
        sendEmail(user.email, verifyToken);
      } else {
        throw "Verify token not saved";
      }
    } else {
      throw "Account Sign-up failed";
    }
  } catch (err) {
    const error = handleSignUpErrors(err);
    res.status(400).json({ error });
  }
});

//login end point
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) throw { email: "Email required " };
    if (!password) throw { password: "Password required " };
    const user = await User.findOne({ email: email });
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        if (user.verified) {
          const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: "3d",
          });
          res.status(200).json({
            name: user.name,
            email: user.email,
            verified: user.verified,
            token,
          });
        } else {
          res.status(200).json({
            name: user.name,
            email: user.email,
            id: user._id,
            verified: user.verified,
            message: "Verify your account",
          });
        }
      } else {
        throw "Invalid email or password";
      }
    } else {
      throw "Invalid email or password";
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

//Delete user end point
router.delete("/", reqAuthorization, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error, message: "internal server error" });
  }
});

module.exports = router;
