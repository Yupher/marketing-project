const couponModel = require("../models/couponModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllCoupon = factory.getAll(couponModel);

exports.getCoupon = factory.getOne(couponModel);

exports.createCoupon = factory.createOne(couponModel, { addUser: true });

exports.updateCoupon = factory.updateOne(couponModel);

exports.deleteCoupon = factory.deleteOne(couponModel);

exports.couponInfoValidation = catchAsync(async (req, res, next) => {
  let { discount, period } = req.body;
  let daysInMiliseconds;

  if (period) {
    daysInMiliseconds = Date.now() + period * 86400000;

    // checking if the period of coupon is valid shoudn't be les or equal to 0
    if (daysInMiliseconds - Date.now() <= 0) {
      return next(new AppError("period of days is not valid", 404));
    }
  }

  //value must be between 1% and 99%
  if (discount < 0 || discount > 100) {
    return next(new AppError("please give us a valid information", 404));
  }

  next();
});

exports.getVendorCoupon = catchAsync(async (req, res, next) => {
  const couponData = await couponModel.find({ user: req.user._id });

  //check if order exist in data base
  if (!couponData) {
    return next(new AppError("You do not have any coupons.", 404));
  }

  return res.status(200).json({
    success: true,
    results: couponData.length,
    couponData,
  });
});
