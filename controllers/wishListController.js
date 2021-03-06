const cartModel = require("../models/cartModel");
const wishListModel = require("../models/whishListModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllWishLists = factory.getAll(wishListModel); // for developpers

exports.getWishList = factory.getOne(wishListModel);

exports.createWishList = factory.createOne(wishListModel, { addUser: true });

//add item to wishlist
exports.addItem = catchAsync(async (req, res, next) => {
  let wishListData = await wishListModel.findOne({ user: req.user._id });

  //check if wishlist exists in data base
  if (!wishListData) {
    return next(new AppError("WishList not found", 404));
  }
  // add items to wishlist
  wishListData.products.push({ product: req.params.id });
  await wishListData.save();
  res.status(200).json({
    success: true,
    wishListData,
  });
});

//delete item from wishlist
exports.deleteItem = catchAsync(async (req, res, next) => {
  let wishListData = await wishListModel.findOne({ user: req.user._id });

  //check if wishlist exists in data base
  if (!wishListData) {
    return next(new AppError("WishList not found", 404));
  }
  let filtered = [];
  let bool = false;
  wishListData.products.forEach((elem) => {
    //check if the product in request is the same in the wishlist
    if (elem.product._id.toString() === req.params.id.toString()) {
      bool = true;
    } else {
      filtered.push(elem);
    }
  });
  if (!bool) {
    return next(new AppError("Porduct not existe.", 404));
  }

  wishListData = await wishListModel.findOneAndUpdate(
    { user: req.user._id },
    { products: filtered },
    { new: true }
  );
  return res.status(200).json({
    success: true,
    document: wishListData,
  });
});

//delete all items from wishlist this is not optimal for users as they can delete all their items accidentaly without return this is mainly for developers
exports.deleteAllItems = catchAsync(async (req, res, next) => {
  let wishListData = await wishListModel.findOne({ user: req.user._id });

  //check if wishlist exists in data base
  if (!wishListData) {
    return next(new AppError("WishList not found.", 404));
  }

  wishListData.products = [];
  await wishListData.save();
  return res.status(200).json({
    success: true,
    wishListData
  });
});

// add wishlist items to cart
exports.addToCart = catchAsync(async (req, res, next) => {


  let wishListData = await wishListModel.findOne({ user: req.user._id });
  let cartData = await cartModel.findOne({ user: req.user._id });


  //check if cart exists in data base
  if (!cartData) {
    return next(new AppError("Cart not found", 404));
  }

  //check if wishlist exists in data base
  if (!wishListData) {
    return next(new AppError("Wishlist not found", 404));
  }

  let bool = false;


  wishListData.products.forEach((elm) => {
    //check if selected element is the same element in the wishlist
    if (elm.product._id.toString() === req.params.id) {
      bool = true;
      cartData.products.push(elm);
    }
  });

  if (!bool) {
    return next(
      new AppError(`No document with this ID: ${req.params.id}.`, 404)
    );
  }





  let myData = await cartData.save();

  return res.status(200).json({
    success: true,
    data: myData
  });
});
