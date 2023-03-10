const mailer = require("../Config/email");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const userOTPVerification = require("../models/Otp");
const formidable = require("formidable");
const ForgetPassword = require("../models/OtpFrorgetPass");
const jwt = require("jsonwebtoken");
const ev = require("../Events/emailHandler");
// testing user
const createUser = async (req, res) => {
  try {
    const message = `welcome ${req.body.name}, please verify your mail ${req.body.email}`;
    // await User.create({
    //   Email: "tochukwu@gmail.com",
    //   LastName: "emeka",
    //   FirstName: "seun",
    //   Password: "eme@96.com",
    // });
    ev.emit("mail", message, req.body.email);

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
    if (err) throw new Error(err);
    const filePath = files["image"].filepath;
    const readStream = fs.createReadStream(filePath);
    const fileUri = `storage/${files["image"].originalFilename}`;
    const pathToStore = path.join(__dirname, `../${fileUri}`);
    const writeStream = fs.createWriteStream(pathToStore);
    const Stream = readStream.pipe(writeStream);

    Stream.on("finish", () => {
      res.send("working");
    });
    Stream.on("error", (err) => {
      console.log(err);
      res.status(500).json({ msg: "file upload error" });
    });
  });
};

//register user and send otp
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body; // can also be User.create(req.body) instead of destructuring

  try {
    const user = await User.create({
      Email: email,
      LastName: lastname,
      FirstName: firstname,
      Password: password,
    });

    const new_Otp = Math.floor(100000 + Math.random() * 900000);
    // create otp collection Email can be used so do away with userID in scheme and also no need for User.findOne
    await userOTPVerification.create({
      userID: user._id,
      userEmail: user.Email,
      otp: new_Otp,
      createdAt: Date.now(),
      expirededAt: Date.now() + 3600000,
    });

    // send otp to mail
    const message = ` welcome to shop4me ${firstname} verify your mail with the otp code ${new_Otp}, otp expires in 1hr `;
    ev.emit("mail", message, req.body.email);
    res.status(201).json({ message: "acc registered " });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "acc already created" });
  }
};

//  otp for email verification
const VerifyEmail = async (req, res) => {
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
    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" }); //expired can b added

    res.status(202).json({
      message: "welcome to eatwell ",
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
    const new_Otp = Math.floor(100000 + Math.random() * 900000); //create new_Otp
    const userFound = await ForgetPassword.findOne({ userEmail: email }); // find if otp has been generated earlier for the above email

    if (!userFound) {
      // if otp hasnt been generated, create a new document for the user
      await ForgetPassword.create({
        userEmail: email,
        otp: new_Otp,
        createdAt: Date.now(),
        expirededAt: Date.now() + 3600000,
      });

      //send email to first time password change
      const message = `  input the otp code ${new_Otp} to change password, otp expires in 1hr `;

      // mail function
      ev.emit("mail", message, email);
      res.status(200).json({ msg: `an otp has been sent to ${email} ` });
      return;
    }

    //if user has been created lets update the existing user's otp

    await ForgetPassword.findOneAndUpdate(
      { userEmail: email },
      { otp: new_Otp },
      { new: true },
    );
    const message = `  input the otp code ${new_Otp} to change password, otp expires in 1hr `;
    //mail function
    ev.emit("mail", message, email);
    res.status(200).json({ msg: `an otp has been sent to ${email} ` });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "something unexpected happened,please contact admin" }); //or pops up when there is a database connection  err or schema or failed to require a used module
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
    ).select("-Password");

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
  VerifyEmail,
  UploadProfileImage,
  forgetPass,
  verifyPassOtpandChangePass,
};
