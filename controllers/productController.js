const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllProducts = factory.getAll(productModel);

exports.getAllProductsActive = factory.getAll(productModel, {
  activeProduct: true,
});

exports.getProduct = factory.getOne(productModel);

exports.createProduct = factory.createOne(productModel, {
  addUser: true,
  spliceTag: true,
  checkCategory: true,
});
exports.updateProduct = factory.updateOne(productModel);
exports.deleteProduct = factory.deleteOne(productModel);

//add discount to a product (protected and users)
exports.AddDiscount = catchAsync(async (req, res, next) => {
  const productData = await productModel.findById(req.params.id);
  //check if this product exists
  if (!productData) {
    return next(new AppError("Product not found", 404));
  }

  let { value, period } = req.body;

  //check if discount value and period are submited
  if (!value || !period) {
    return next(new AppError("please give us all informations", 404));
  }
  // check if value is valid
  if (value < 0 || value > 100) {
    return next(new AppError("please give us a valid information", 404));
  }

  let daysInMiliseconds = Date.now() + period * 86400000;

  // check if discount's period of time is valid
  if (daysInMiliseconds - Date.now() <= 0) {
    return next(new AppError("period of days is not valid", 404));
  }

  await productModel.findByIdAndUpdate(req.params.id, {
    priceDiscount: {
      createdAt: Date.now(),
      value,
      period,
    },
  });

  let newDoc = await productModel.findById(req.params.id);

  return res.status(200).json({
    success: true,
    discount: newDoc,
  });
});

exports.calculeRatings = catchAsync(async (req, rse, next) => {
  let reviewData = await reviewModel.find();

  if (reviewData) {
    let ratingsQuantity;
    let ratingsAverage;
    reviewData.forEach(async (elm) => {
      let productData = await productModel.findById(elm.product);

      if (productData) {
        ratingsQuantity = productData.reviews.length;
        let ratingsTotal = 0;
        productData.reviews.forEach((elm) => {
          ratingsTotal = ratingsTotal + elm.rating;
        });

        ratingsAverage =
          ratingsQuantity === 0 ? 4.5 : ratingsTotal / ratingsQuantity;
        productData.ratingsQuantity = ratingsQuantity;
        productData.ratingsAverage = ratingsAverage;
        await productData.save();
      } else {
        next(null);
      }
    });
    next();
  }
});
