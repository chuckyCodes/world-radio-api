const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const reqAuthorization = require("../middleware/reqAuthorization");
const crypto = require("crypto");
const VerificationToken = require("../models/verificationToken-model");
const handleSignUpErrors = require("../utils/handleSignUpErrors");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const hashPassword = require("../utils/hashPassword");
const cryptoJS = require("crypto-js");

//sign-up end point
router.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const payload = { email: email, password: hashedPassword };
  const stringifiedPayload = JSON.stringify(payload);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const encryptedPayload = cryptoJS.AES.encrypt(
    stringifiedPayload,
    process.env.SECRET
  ).toString();
  const authenticationToken = encodeURIComponent(encryptedPayload);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      authToken: authenticationToken,
    });

    const verifiedUser = await User.findOne({ email, verified: true });
    if (verifiedUser) {
      throw "exist";
    } else {
      const user = await newUser.save();
      if (user) {
        res.status(201).json({ message: "Account Created" });

        const token = new VerificationToken({
          userId: user._id,
          token: verifyToken,
        });
        const savedToken = await token.save();
        if (savedToken) {
          sendEmail(user.email, verifyToken, authenticationToken);
        } else {
          throw "Verify token not saved";
        }
      } else {
        throw "Account Sign-up failed";
      }
    }
  } catch (err) {
    const error = handleSignUpErrors(err);
    res.status(400).json({ error });
  }
});

//login with Email end point
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) throw { email: "Email required " };
    if (!password) throw { password: "Password required " };
    const users = await User.find({ email: email });

    if (users.length > 0) {
      const filteredUsers = await Promise.all(
        users.map(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return user;
          } else {
            return null;
          }
        })
      );
      const user = filteredUsers.find((user) => user);

      if (user) {
        if (user.verified) {
          const token = createToken(user._id);
          res.status(200).json({
            name: user.name,
            email: user.email,
            picture: user.picture,
            verified: user.verified,
            token,
          });
        } else {
          res.status(200).json({
            name: user.name,
            email: user.email,
            id: user._id,
            auth: user.authToken,
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
