const { Router } = require("express");
const {
  createUser,
  searchUser,
  registerUser,
  VerifyOtp,
  UploadProfileImage,
  forgetPass,
  verifyPassOtpandChangePass,
} = require("../controller/userController");

const router = Router();
router.post("/create", createUser);
router.post("/search", searchUser);
router.post("/regUsers", registerUser);
router.post("/verifyEmail", VerifyOtp);
router.post("/uploadfile", UploadProfileImage);
router.post("/forgetpassword", forgetPass);
router.post("/changePassword", verifyPassOtpandChangePass);
module.exports = router;
