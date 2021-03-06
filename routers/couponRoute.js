const express = require("express");
const couponController = require("../controllers/couponController");
const authController = require("../controllers/authController");
const couponModel = require("../models/couponModel");

const router = express.Router();
router.use(authController.protect);

router
  .route("/")
  // just for developers this must be deleted when deploying
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    couponController.getAllCoupon
  )
  .post(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.checkVendorSub,
    couponController.couponInfoValidation,
    couponController.createCoupon
  );

router
  .route("/me")
  .get(
    authController.protect,
    authController.restrictTo("vendor"),
    couponController.getVendorCoupon
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(couponModel),
    couponController.getCoupon
  )
  .post(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.checkVendorSub,
    couponController.couponInfoValidation,
    couponController.createCoupon
  )
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(couponModel),
    authController.checkVendorSub,
    couponController.couponInfoValidation,
    couponController.updateCoupon
  )
  .delete(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(couponModel),
    couponController.deleteCoupon
  );

module.exports = router;
