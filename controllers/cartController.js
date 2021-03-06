const cartModel = require("../models/cartModel");
const wishListModel = require("../models/whishListModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");

// cart will be created automatically when user signup these three following controllers are for developers
exports.getAllCarts = factory.getAll(cartModel);

exports.getCart = factory.getOne(cartModel);

exports.createCart = factory.createOne(cartModel, { addUser: true });

//add item to cart
exports.addItem = catchAsync(async (req, res, next) => {
  let cartData = await cartModel.findOne({ user: req.user._id });

  //check if cart exists in the data base
  if (!cartData) {
    return next(new AppError("cart not found", 404));
  }

  let productData = await productModel.findById(req.params.id);

  //chek if the product exists in the data base
  if (!productData) {
    return next(new AppError("Product not found.", 404));
  }
  let { quantity, coupon } = req.body;

  //check quantity input
  if (!quantity) {
    quantity = 1;
  } else if (quantity < 1) {
    return next(new AppError("Quantity is not valid.", 404));
  }


  cartData.products.push({ product: req.params.id, quantity, coupon });

  await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { products: cartData.products }
  );

  let newCartData = await cartModel.findOne({ user: req.user._id });

  res.status(200).json({
    success: true,
    result: newCartData,
  });
});

//delete item from cart
exports.deleteItem = catchAsync(async (req, res, next) => {
  let cartData = await cartModel.findOne({ user: req.user._id });

  //check if the cart exist in data base
  if (!cartData) {
    return next(new AppError("cart not found", 404));
  }

  let bool = false;
  let filtered = [];

  cartData.products.forEach((elem) => {
    // check if the selected prodect exists in the cart
    if (elem.product._id.toString() === req.params.id.toString()) {
      bool = true;
    } else {
      filtered.push(elem);
    }
  });

  if (!bool) {
    return next(new AppError("Porduct not existe.", 404));
  }

  await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { products: filtered }
  );

  cartData = await cartModel.findOne({ user: req.user._id });

  return res.status(200).json({
    success: true,
    document: cartData,
  });
});

//delete all cart items 'this is not optimal for users they can accidently delete all items in their cart accidently this is mainly for developer'
exports.DeleteAllItems = catchAsync(async (req, res, next) => {
  let cartData = await cartModel.findOne({ user: req.user._id });
  //check if cart exists in the data base
  if (!cartData) {
    return next(new AppError("cart not found", 404));
  }
  cartData.products = [];
  cartData.products.splice(index, 1);
  await cartData.save();
  return res.status(200).json({
    success: true,
  });
});


//move cart items to wishlist
exports.moveToWishList = catchAsync(async (req, res, next) => {
  let cartData = await cartModel.findOne({ user: req.user._id });
  // check if cart existe in the data base

  if (!cartData) {
    return next(new AppError("Cart do not exist", 404));
  }

  let bool = false;
  let movedProduct = [];
  let notmovedProduct = [];
  cartData.products.forEach((elm) => {
    //pushin items to wishlist
    if (elm.product._id.toString() === req.params.id) {
      bool = true;
      movedProduct.push(elm);
    }
  });
  cartData.products.forEach((elm) => {
    if (elm.product._id.toString() !== req.params.id) {
      notmovedProduct.push(elm);
    }
  });
  if (!bool) {
    return next(
      new AppError(`No document with this ID: ${req.params.id}.`, 404)
    );
  }

  // finding wishlist document in data base and updating with the new items
  let wishListData = await wishListModel.findOneAndUpdate(
    { user: req.user._id },
    { products: [...movedProduct] },
    { new: true }
  );
  cartData = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { products: notmovedProduct },
    { new: true }
  );
  return res.status(200).json({
    success: true,
    document: cartData
  });
});


//purchase All cart items
exports.purchaseAll = catchAsync(async (req, res, next) => {


  const cartData = await cartModel.findOne({ user: req.user._id });

  //check if the cart exists in the data base
  if (!cartData) {
    return next(new AppError("Cart do not exist.", 404));
  }

  let { products } = cartData;

  // check product
  if (!Array.isArray(products) || products.length === 0) {
    return next(new AppError("Please, Add to cart before buying.", 404));
  }


  //concatenate the sames products
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      // if the same product is added mutiple times , it will save one with some of the quantities and delete the others
      if (products[i].product._id.toString() === products[j].product._id.toString()) {
        products[i].quantity = products[i].quantity + products[j].quantity;
        products[j].quantity = 0;
      }
    }
  }


  let finalProds = [];

  products.forEach((elm) => {
    //delete products with quantity of 0
    if (elm.quantity !== 0) {
      finalProds.push(elm);
    }
  });


  // check before buy
  for (let i = 0; i < finalProds.length; i++) {

    // check quantities
    if (finalProds[i].quantity > finalProds[i].product.quantity) {
      return next(new AppError("Quantity of this product is insufisant.", 404));
    }

    // check double coupon code
    for (let j = 0; j < finalProds.length; j++) {
      if (i !== j && finalProds[i].coupon && finalProds[j].coupon && finalProds[i].coupon._id.toString() === finalProds[j].coupon._id.toString()) {
        return next(
          new AppError(
            "You cannot use coupon two time.",
            404
          )
        );
      }
    }

    // coupon multi order
    if (finalProds[i].coupon && finalProds[i].quantity > 1) {
      return next(new AppError("You can not use coupon on more than 1 quantity of the product.", 404));
    }

    // check valid coupon
    if (finalProds[i].coupon && finalProds[i].coupon.used) {
      return next(new AppError("Coupon is not valid.", 404));
    }

    // check expired coupon
    if (finalProds[i].coupon) {
      let periodMiliseconds =
        Date.parse(finalProds[i].coupon.createdAt) +
        finalProds[i].coupon.period * 86400000;

      if (Date.now() > periodMiliseconds) {
        return next(new AppError("Coupon has expired.", 404));
      }
    }

  }


  // buy everything
  finalProds.forEach(async (elm) => {

    let newOrders = {
      product: elm.product._id,
      quantity: elm.quantity,
      coupon: elm.coupon,
      adressFirstLine: req.body.adressFirstLine,
      paymentMethod: req.body.paymentMethod,
    };

    await orderModel.create(newOrders);
  });


  // delete cart

  cartData.products = [];
  await cartData.save()


  return res.status(200).json({ success: true });
});

