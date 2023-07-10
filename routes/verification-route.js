const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const VerificationToken = require("../models/verificationToken-model");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");

//verification route
router.get("/verify/:token/:authenticationToken", async (req, res) => {
  const { token, authenticationToken } = req.params;
  const encryptedPayload = decodeURIComponent(authenticationToken);
  const decryptedBytes = cryptoJS.AES.decrypt(
    encryptedPayload,
    process.env.SECRET
  );
  const decryptedPayloadString = decryptedBytes.toString(cryptoJS.enc.Utf8);
  const { email, password } = JSON.parse(decryptedPayloadString);

  try {
    const verifyToken = await VerificationToken.findOne({ token });
    if (verifyToken) {
      const users = await User.find({ email: email });
      const verifiedUser = users.find((user) => user.verified);
      if (verifiedUser) {
        verifiedUser.password = password;
        await verifiedUser.save();
        await User.deleteMany({ email: email, verified: false });
        const token = createToken(verifiedUser._id);
        res.status(200).json({
          name: verifiedUser.name,
          email: verifiedUser.email,
          picture: verifiedUser.picture,
          token,
          verified: verifiedUser.verified,
          message: "Your Account has been Verified",
        });
      } else {
        const userId = verifyToken.userId;
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { verified: true },
          { returnDocument: "after" }
        );
        if (!updatedUser) throw "user not found";
        if (updatedUser.verified) {
          const token = createToken(updatedUser._id);
          res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,
            picture: updatedUser.picture,
            token,
            verified: updatedUser.verified,
            message: "Your Account has been Verified",
          });
          await User.deleteMany({ email: email, verified: false });
        } else {
          throw "Account not verified";
        }
      }
    } else {
      throw "Invalid or Expired Verification Link";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//resend verification route
router.post("/resend-verification", async (req, res) => {
  const { email, userId, auth } = req.body;
  const verifyToken = crypto.randomBytes(32).toString("hex");

  try {
    const verificationToken = await VerificationToken.findOneAndUpdate(
      { userId: userId },
      { token: verifyToken, createdAt: Date.now() },
      { returnDocument: "after", upsert: true }
    );

    if (verificationToken) {
      sendEmail(email, verifyToken, auth);
      res.status(200).json({ message: "verification re-sent" });
    } else {
      throw "verification resending failed";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
