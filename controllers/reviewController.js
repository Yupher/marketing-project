const reviewModel = require("../models/reviewModel");
const factory = require("./handleFactory");

exports.getAllReviews = factory.getAll(reviewModel);
exports.getReview = factory.getOne(reviewModel);
exports.createReview = factory.createOne(reviewModel, {
  addUser: true,
  addProduct: true,
});
exports.updateReview = factory.updateOne(reviewModel);
exports.deleteReview = factory.deleteOne(reviewModel);
