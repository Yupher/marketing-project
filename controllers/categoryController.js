const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllCategory = factory.getAll(categoryModel);

exports.getCategory = factory.getOne(categoryModel);

exports.createCategory = factory.createOne(categoryModel, { addUser: true });

exports.updateCategory = factory.updateOne(categoryModel);

exports.deleteCategory = factory.deleteOne(categoryModel);

exports.categoryOrders = catchAsync(async (req, res, next) => {
  let categoryData = await categoryModel.findById(req.params.id);
  if (!categoryData) {
    return next(new AppError("No category was found", 404));
  }
  let allOrders = await orderModel.find();
  let catOrders = [];
  allOrders.forEach((order) => {
    let { product } = order;
    if (product.categories.include(req.params.id)) {
      catOrders.push(order);
    }
  });
  return res.status(200).json({
    success: true,
    data: cartOrders,
  });
});

exports.categoryProducts = catchAsync(async (req, res, next) => {
  let categoryData = await categoryModel.findById(req.params.id);
  if (!categoryData) {
    return next(new AppError("No category was found", 404));
  }
  let productData = await productModel.find();
  let catProduct = [];
  productData.forEach((product) => {
    let { categories } = product;
    if (categories.include(req.params.id)) {
      catProduct.push(product);
    }
  });
  return res.status(200).json({
    success: true,
    data: catProduct,
  });
});
