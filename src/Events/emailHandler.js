const mailer = require("../Config/email");
const fs = require("fs");
const path = require("path");
const events = require("events");

const ev = new events.EventEmitter();
ev.on("mail", () => {
  const html = fs.readFileSync(
    path.join(__dirname, "../templates/register.html"),
  );
  mailer.sendMail({
    subject: "shop4me reg",
    from: "info@shop4me.com",
    to: "emekaseun.es@gmail.com",
    html: html,
  });
});
module.exports = ev;
