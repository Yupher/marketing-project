const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/usersControler");

const router = express.Router({ mergeParams: true });
//router.use(authController.protect);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getUser
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
