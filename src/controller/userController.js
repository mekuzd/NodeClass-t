const mailer = require("../Config/email");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const userOTPVerification = require("../models/Otp");
const formidable = require("formidable");
const ForgetPassword = require("../models/OtpFrorgetPass");
const jwt = require("jsonwebtoken");
const createUser = async (req, res) => {
  try {
    await User.create({
      Email: "tochukwu@gmail.com",
      LastName: "emeka",
      FirstName: "seun",
      Password: "eme@96.com",
    });
    const html = fs.readFileSync(
      path.join(__dirname, "../templates/register.html"),
    );
    await mailer.sendMail({
      subject: "shop4me reg",
      from: "info@shop4me.com",
      to: "Mekuzdes@gmail.com",
      html: html,
    });

    res.status(201).json({ message: "acc created" });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "acc already created" });
  }
};

//use this method when you also would receive files formdata sends the files to the backend.
const UploadProfileImage = async (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    const { name } = fields;
    console.log(files);
    if (err) throw new Error(err);
    const readData = await fs.readFileSync(files["image"].filepath);

    const pathToStore = path.join(
      __dirname,
      `../storage/${files["image"].originalFilename}`,
    );
    await fs.writeFileSync(pathToStore, readData);
    res.end("working");
  });
};

//register user and send otp
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body; // can also be User.create(req.body) instead of destructuring

  try {
    await User.create({
      Email: email,
      LastName: lastname,
      FirstName: firstname,
      Password: password,
    });

    const user = await User.findOne({ Email: email });
    // create otp collection Email can be used so do away with userID in scheme and also no need for User.findOne
    await userOTPVerification.create({
      userID: user._id,
      userEmail: user.Email,
      otp: Math.floor(100000 + Math.random() * 900000),
      createdAt: Date.now(),
      expirededAt: Date.now() + 3600000,
    });

    // find otp and send to mail
    let otpCollection = await userOTPVerification.findOne({ userEmail: email });
    const { otp } = otpCollection;
    await mailer.sendMail({
      subject: "shop4me reg",
      from: "info@shop4me.com",
      to: email,
      html: `<h1> welcome to shop4me ${firstname} verify your mail with the otp code ${otp}, otp expires in 1hr</h1>`,
    });
    res.status(201).json({ message: "acc registered " });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "acc already created" });
  }
};

//  otp for email verification
const VerifyOtp = async (req, res) => {
  try {
    const { user_otp } = req.body;
    const userOtpfound = await userOTPVerification.findOne({ otp: user_otp });
    if (!userOtpfound) {
      res.status(403).json({ msg: "incorrct otp code" });
      return;
    }
    const { userID } = userOtpfound;
    const userEmailVerified = await User.findByIdAndUpdate(
      { _id: userID },
      { VerifiedEmail: true },
      { new: true },
    );
    res
      .status(202)
      .json({ msg: "email has been verified successfully", userEmailVerified });
  } catch (error) {
    res
      .status(500)
      .json({ message: "something unexpected happened,please contact admin" });
  }
};

//user login
const searchUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ Email: email });
    if (!user) {
      res.status(401).json({ message: "one or more invalid credentials" });
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) {
      res.status(401).json({ message: "one or more invalid credentials" });
      return;
    }

    let userDetails = {
      name: user.FirstName,
      email: user.Email,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      _id: user._id,
    };

    const privateKey = fs.readFileSync(path.join(__dirname, "../private.pem"));
    const payload = {
      email: user.Email,
      id: user._id,
    };
    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
    const { FirstName } = user;
    res.status(202).json({
      message: `welcome to eatwell ${FirstName}`,
      user: userDetails,
      token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "something unexpected happened,please contact admin" }); //or pops up when there is adatabase connection  err or schema or failed to require a used module
  }
};

//forget Password
const forgetPass = async (req, res) => {
  const { email } = req.body;

  try {
    const regUser = await User.findOne({ Email: email });
    if (!regUser) {
      res
        .status(403)
        .json({ msg: `${email} is not a registered Email address` });
      return;
    }
    // create new collection for ForgetPassotp in data base
    await ForgetPassword.create({
      userEmail: email,
      otp: Math.floor(100000 + Math.random() * 900000),
      createdAt: Date.now(),
      expirededAt: Date.now() + 3600000,
    });

    const userFound = await ForgetPassword.findOne({ userEmail: email });
    const { otp } = userFound; // send otp to user email
    await mailer.sendMail({
      subject: "shop4me reg",
      from: "info@shop4me.com",
      to: email,
      html: `<h1>  input the otp code ${otp} to change password, otp expires in 1hr</h1>`,
    });
    res.status(200).json({ msg: `an otp has been sent to ${email} ` });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "something unexpected happened,please contact admin" }); //or pops up when there is adatabase connection  err or schema or failed to require a used module
  }
};

//verify password and change password
const verifyPassOtpandChangePass = async (req, res) => {
  try {
    const { user_otp, confirmPassword } = req.body;
    const newPassword = await bcrypt.hash(confirmPassword, 10);

    const otp_correct = await ForgetPassword.findOne({ otp: user_otp });
    if (!otp_correct) {
      res.status(403).json({ msg: "incorrect Otp" });
      return;
    }
    const { userEmail } = otp_correct;

    const user = await User.findOneAndUpdate(
      { Email: userEmail },
      { Password: newPassword },
      { new: true },
    );

    res.status(200).json({ msg: "password changed", user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "something unexpected happened,please contact admin" });
  }
};

module.exports = {
  createUser,
  searchUser,
  registerUser,
  VerifyOtp,
  UploadProfileImage,
  forgetPass,
  verifyPassOtpandChangePass,
};
