const express = require("express");
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(cartController.getAllCarts) // for developper
  .post(authController.protect, cartController.createCart);

router
  .route("/purchase")
  .post(authController.protect, cartController.purchaseAll);

router
  .route("/movetowishlist/:id")
  .get(authController.protect, cartController.moveToWishList);
router
  .route("/:id")
  .get(authController.protect, cartController.getCart)
  .post(authController.protect, cartController.addItem)
  .delete(authController.protect, cartController.deleteItem);

module.exports = router;
