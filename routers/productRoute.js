const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoute");
const productModel = require("../models/productModel");
const router = express.Router();

//router.use("/:productId/reviews", reviewRouter);

router
  .route("/all")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    productController.calculeRatings,
    productController.getAllProducts
  );

router
  .route("/")
  .get(productController.calculeRatings, productController.getAllProductsActive)
  .post(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.checkVendorSub,
    productController.createProduct
  );

router
  .route("/add-discount/:id")
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(productModel),
    authController.checkVendorSub,
    productController.AddDiscount
  );

router
  .route("/:id")
  .get(productController.calculeRatings, productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo("vendor"),
    authController.permitedTo(productModel),
    authController.checkVendorSub,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "vendor"),
    authController.permitedTo(productModel),
    productController.deleteProduct
  );

module.exports = router;
