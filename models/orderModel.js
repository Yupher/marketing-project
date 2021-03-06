const mongoose = require("mongoose");
const productModel = require("./productModel");

const AppError = require("../utils/appError");
const coupon = require("./couponModel");

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "product",
    reqyuired: [true, "you have to order a product"],
  },
  quantity: {
    type: Number,
    required: [true, "you must select a quantity"],
    min: [1],
  },
  price: Number,
  coupon: {
    type: mongoose.Schema.ObjectId,
    ref: "coupon",
  },
  discount: Number,
  priceAfterDiscount: Number,
  shipping: Number,
  totalAmount: Number,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    reqyuired: [true, "user who ordered is required"],
  },
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    reqyuired: [true, "vendor who added this product is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paymentMethod: {
    type: String,
    enum: ["paypal", "visa", "masterCard"],
  },
  adressFirstLine: {
    type: String,
    required: [true, "you must provide a shipping adress"],
  },
  adressLastLine: String,
});

orderSchema.pre(/^find/, function (next) {
  this.populate("coupon");
  this.populate("product");
  this.populate("User");
  next();
});



orderSchema.pre("save", async function (next) {
  let productData = await productModel.findById(this.product);

  //check if product exists in the data base
  if (!productData) {
    return next(new AppError("product not found", 404));
  }

  //checking the quantity of the product
  if (productData && productData.quantity <= 0) {
    return next(new AppError("we ran out of this product", 404));
  }


  this.price = productData.price * this.quantity;
  this.priceAfterDiscount = this.price;
  this.shipping = productData.shipping;
  this.addedBy = productData.user;

  //checking if the product has discount
  if (productData.priceDiscount && productData.priceDiscount.period && productData.priceDiscount.value) {
    let { period, value, createdAt } = productData.priceDiscount;
    let periodMiliseconds = Date.parse(createdAt) + period * 86400000;

    if (periodMiliseconds > Date.now()) {
      this.discount = value;
      this.priceAfterDiscount = this.price * (1 - value / 100);
    }

  }


  //checking if the user has coupon

  let couponData = await coupon.findById(this.coupon);

  if (this.coupon && !couponData) {
    return next(new AppError("this coupon is not valid."));
  } else if (couponData) {

    let { createdAt, used, period, discount, user } = couponData;

    // check it's own coupon
    if (user._id.toString() !== productData.user._id.toString()) {
      return next(new AppError("this coupon does not belong to this vendor"));
    }

    let periodMiliseconds = Date.parse(createdAt) + period * 86400000;

    if (this.quantity > 1) {
      return next(
        new AppError("You can not use a coupon on multiple product", 404)
      );
    }


    // check expired coupon 
    if (periodMiliseconds < Date.now()) {
      return next(new AppError("Coupon has expired.", 404));
    }

    // check if coupon used
    if (used) {
      return next(new AppError("Coupon has already been used.", 404));
    }

    this.priceAfterDiscount = this.priceAfterDiscount * (1 - discount / 100);

    couponData.used = true;
    await couponData.save();

  }




  this.totalAmount = this.priceAfterDiscount + this.shipping;
  productData.quantity = productData.quantity - this.quantity;
  await productData.save();

  next();
});

const order = mongoose.model("orders", orderSchema);
module.exports = order;
