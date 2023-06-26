const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const VerificationToken = require("../models/verificationToken-model");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//verification route
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const verifyToken = await VerificationToken.findOne({ token });
    if (verifyToken) {
      const userId = verifyToken.userId;
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { verified: true },
        { returnDocument: "after" }
      );
      if (!user) throw "user not found";
      if (user.verified) {
        res
          .status(200)
          .json({ verified: user.verified, message: "Email verified" });
      } else {
        throw "Email not verified";
      }
    } else {
      throw "Invalid or Expired link";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//resend verification route
router.post("/resend-verification", async (req, res) => {
  const { email, userId } = req.body;
  const verifyToken = crypto.randomBytes(32).toString("hex");

  try {
    const verificationToken = await VerificationToken.findOneAndUpdate(
      { userId: userId },
      { token: verifyToken, createdAt: Date.now() },
      { returnDocument: "after", upsert: true }
    );

    if (verificationToken) {
      sendEmail(email, verifyToken);
      res.status(200).json({ message: "verification re-sent" });
    } else {
      throw "verification resending failed";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
