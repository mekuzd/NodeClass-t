const { Schema, model } = require("mongoose");

const userOTPVerificationSchema = new Schema({
  userID: {
    type: Schema.Types.String,
    unique: true,
    required: true,
  },
  userEmail: {
    type: Schema.Types.String,
    unique: true,
  },
  otp: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    required: true,
  },
  expirededAt: {
    type: Schema.Types.Date,
    required: true,
  },
});

const userOTPVerification = model(
  "userOTPVerification",
  userOTPVerificationSchema,
);

module.exports = userOTPVerification;
