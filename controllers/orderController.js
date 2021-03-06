const orderModel = require("../models/orderModel");
const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllOrders = factory.getAll(orderModel);

exports.getOrder = factory.getOne(orderModel);

exports.createOrder = factory.createOne(orderModel, {
  addUser: true,
});

exports.updateOrder = factory.updateOne(orderModel);

exports.deleteOrder = factory.deleteOne(orderModel);

exports.checkIfProductExist = (Model) =>
  catchAsync(async (req, res, next) => {
    let data = await Model.findById(req.body.product);

    //check if product exist in data base
    if (!data) {
      return next(new AppError("Product not found.", 404));
    }
    //check for product quantity
    if (req.body.quantity > data.quantity) {
      return next(new AppError("We ran out of this product.", 404));
    }
    next();
  });

exports.getVendorOrders = catchAsync(async (req, res, next) => {
  const orderData = await orderModel.find({ addedBy: req.user._id });

  //check if order exist in data base
  if (!orderData) {
    return next(new AppError("You do not have any orders", 404));
  }

  return res.status(200).json({
    success: true,
    results: orderData.length,
    orderData,
  });
});
