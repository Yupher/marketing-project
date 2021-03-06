const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

//users auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

//vendor auth routes
router.post("/vendor/signup", authController.vendorSignup);
router.post("/vendor/login", authController.vendorLogin);
router.get("/vendor/logout", authController.logout);

module.exports = router;
