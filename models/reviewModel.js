const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const productModel = require("./productModel");
const UserModel = require("./userModel");
const vendorModel = require("./vendorModel");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can not be empty!"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please rate this product before you submit!"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "product",
    required: [true, "Review must belong to a  product."],
  },
  user: {
    type: Object,
    required: [true, "Review must belong to a user"],
  },
  active: {
    type: Boolean,
    default: true,
  },
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const review = mongoose.model("review", reviewSchema);
module.exports = review;
