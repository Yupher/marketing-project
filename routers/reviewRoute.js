const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const reviewModel = require("../models/reviewModel");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
//All Review
router.route("/").get(reviewController.getAllReviews);

//individual Review
router
  .route("/:id")
  .get(reviewController.getReview)
  .post(
    authController.protect,
    authController.restrictTo("client", "admin"),
    reviewController.createReview
  )
  .patch(
    authController.protect,
    authController.restrictTo("client"),
    authController.permitedTo(reviewModel),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo("client", "admin"),
    authController.permitedTo(reviewModel),
    reviewController.deleteReview
  );

module.exports = router;
