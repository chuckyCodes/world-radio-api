const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

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
      unique: true,
      validate: [isEmail, "Enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minLength: [8, "Minimum of 8 characters"],
    },
    picture: { type: String },
    verified: { type: Boolean, default: false },
    favorites: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const saltRound = 10;
  bcrypt.hash(this.password, saltRound).then((hash) => {
    this.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);
module.exports = User;
