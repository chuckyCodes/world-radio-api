const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: [isEmail, "Enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minLength: [8, "Minimum of 8 characters"],
    },
    picture: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    favorites: [Schema.Types.Mixed],
  },
  { timestamps: true, strict: false }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
