const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      coupon: {
        type: mongoose.Schema.ObjectId,
        ref: "coupon",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

cartSchema.pre(/^find/, function (next) {
  this.populate("products.coupon");
  this.populate("products.product");
  this.populate("user");
  next();
});


const cart = mongoose.model("cart", cartSchema);
module.exports = cart;
