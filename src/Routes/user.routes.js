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
router.get("/create", createUser);
router.post("/search", searchUser);
router.post("/regUsers", registerUser);
router.post("/verifyotp", VerifyOtp);
router.post("/uploadfile", UploadProfileImage);
router.post("/forgetpassword", forgetPass);
router.post("/changePassword", verifyPassOtpandChangePass);
module.exports = router;
