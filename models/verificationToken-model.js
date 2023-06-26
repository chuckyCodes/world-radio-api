const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verificationTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 600 },
  },
});

const VerificationToken = mongoose.model(
  "Verification-Token",
  verificationTokenSchema
);

module.exports = VerificationToken;
