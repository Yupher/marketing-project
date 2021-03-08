const express = require("express");
const productModel = require("../models/productModel");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { checkIfProductExist } = require("../controllers/orderController");
const orderModel = require("../models/orderModel");

const router = express.Router();
// router.use(authController.protect);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.getAllOrders
  )
  .post(
    authController.protect,
    orderController.checkIfProductExist(productModel),
    orderController.createOrder
  );

router
  .route("/me")
  .get(
    authController.protect,
    authController.restrictTo("vendor"),
    orderController.getVendorOrders
  );

router
  .route("/me/:id")
  .get(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(orderModel, { addedBy: true }),
    orderController.getVendorOrders
  );

// This route is exclusif to admins
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.getOrder
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.updateOrder
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.deleteOrder
  );

module.exports = router;
