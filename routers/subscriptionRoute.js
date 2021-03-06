const express = require("express");
const authController = require("./../controllers/authController");
const subscriptionController = require("../controllers/subscriptionController");
const subscriptionModel = require("../models/subscriptionModel");

const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    subscriptionController.getAllSubscriptions
  )
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    subscriptionController.requestSubscription
  );

router
  .route("/renew")
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    subscriptionController.requestSubscription
  );
router
  .route("/abort")
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    subscriptionController.abortSubscription
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin", "vendor"),
    subscriptionController.getSubscription
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    subscriptionController.subsRequestProcessing
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    subscriptionController.subsRequestProcessing
  );

module.exports = router;
