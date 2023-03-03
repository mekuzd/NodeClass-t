const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f88656b273673b",
    pass: "9809d3ce22ed3b",
  },
});
module.exports = mailer;
