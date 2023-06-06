const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const reqAuthorization = require("../middleware/reqAuthorization");

const handleError = (error) => {
  let err = {};
  if (error.name === "ValidationError") {
    if (error.errors.email) {
      err["email"] = error.errors.email.message;
    }

    if (error.errors.name) {
      err["name"] = error.errors.name.message;
    }

    if (error.errors.password) {
      err["password"] = error.errors.password.message;
    }
    return err;
  }

  if (error.code === 11000) {
    if (error.keyValue.email)
      err["email"] = "Account with this email already exist";
    return err;
  }
  return error;
};

//sign-up end point
router.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = new User({
      name,
      email,
      password,
    });

    const user = await newUser.save();
    if (user) {
      res.status(201).json({ message: "Account Created" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (err) {
    const error = handleError(err);
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
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
          expiresIn: "3d",
        });
        res.status(200).json({ name: user.name, email: user.email, token });
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
