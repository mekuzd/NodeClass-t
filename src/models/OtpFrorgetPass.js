const { Schema, model } = require("mongoose");

const OtpForgetPass = new Schema({
  userEmail: {
    type: Schema.Types.String,
  },
  otp: {
    type: Schema.Types.String,
    required: true,
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

const ForgetPassword = model("OtpForgetPass", OtpForgetPass);

module.exports = ForgetPassword;
