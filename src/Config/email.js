const nodemailer = require("nodemailer");
const path = require("path");
const { pugEngine } = require("nodemailer-pug-engine");
const mailer = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f88656b273673b",
    pass: "9809d3ce22ed3b",
  },
});
mailer.use(
  "compile",
  pugEngine({
    templateDir: path.join(__dirname, "../templates"),
    pretty: true,
  }),
);

module.exports = mailer;
