const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const reviewModel = require("../models/reviewModel");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
//All Review
router.route("/").get(reviewController.getAllReviews);

router
  .route("/me/:id")
  .delete(
    authController.protect,
    authController.permitedTo(reviewModel),
    reviewController.deleteReview
  );

//individual Review
router
  .route("/:id")
  .get(reviewController.getReview)
  .post(authController.protect, reviewController.createReview)
  .patch(
    authController.protect,
    authController.permitedTo(reviewModel),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    reviewController.deleteReview
  );

module.exports = router;
