const express = require("express");
const productModel = require("../models/productModel");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");
const { checkIfProductExist } = require("../controllers/orderController");

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

// This route is exclusif to admins
router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    orderController.updateOrder
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    orderController.deleteOrder
  );

module.exports = router;
