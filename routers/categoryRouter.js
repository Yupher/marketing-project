const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");

const router = express.Router();
//router.use(authController.protect);

router
  .route("/")
  .get(categoryController.getAllCategory)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    categoryController.createCategory
  );

router
  .route("/order/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    categoryController.categoryOrders
  );

router.route("/products/:id").get(categoryController.categoryProducts);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    categoryController.deleteCategory
  );

module.exports = router;
