const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please tell us Promo name."],
    unique: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "vendor",
    required: [true, "Discount must belong to a user."],
  },
  used: {
    type: Boolean,
    default: false,
  },
  discount: {
    required: [true, "Coupon must have a discount."],
    type: Number,
    max: 100,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  period: {
    required: [true, "Coupon must have a period."],
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

/* couponSchema.index({ product: 1, user: 1 }, { unique: true }); */

couponSchema.pre(/^find/, function (next) {
  this.populate({
    path: "product",
  });

  this.populate({
    path: "user",
  });
  next();
});

const coupon = mongoose.model("coupon", couponSchema);
module.exports = coupon;
