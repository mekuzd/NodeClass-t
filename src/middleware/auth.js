const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

async function auth(req, res, next) {
  try {
    const token = String(req.headers.authorization).split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "unauthorised" });
    }

    const publicKey = fs.readFileSync(path.join(__dirname, "../public.pem"));
    const decoded = jwt.verify(token, publicKey, { algorithms: "RS256" });
    const user = await User.findOne({ _id: decoded.id }).select("-Password"); ///this can eliminate sending the password

    if (!user) {
      return res.status(401).json({ msg: "unauthorised " });
    }
    req["user"] = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "unauthorised " });
  }
}
module.exports = auth;
