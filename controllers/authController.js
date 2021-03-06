const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const UserModel = require("./../models/userModel");
const vendorModel = require("../models/vendorModel");
const cartModel = require("../models/cartModel");
const wishListModel = require("../models/whishListModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const subscriptionModel = require("../models/subscriptionModel");

//sign the json web token
const signToken = (user) => {
  let { name, email, id } = user;
  let payload = {
    name,
    email,
    id,
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

//sending the json web token to user
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//signup new user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  await wishListModel.create({ user: newUser._id });
  await cartModel.create({ user: newUser._id });
  const url = `${req.protocol}://${req.get("host")}/me`;
  // console.log(url);
  createSendToken(newUser, 201, req, res);
});

//user login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

//Logout Route
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

//vendor Signup
exports.vendorSignup = catchAsync(async (req, res, next) => {
  const newVendor = await vendorModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  let newSub = await subscriptionModel.create({
    vendor: newVendor._id,
  });
  await vendorModel.findByIdAndUpdate(newVendor._id, {
    subscription: newSub._id,
  });

  //create a whislist for this user
  await wishListModel.create({ user: newVendor._id });

  //create a cart for this user
  await cartModel.create({ user: newVendor._id });

  const url = `${req.protocol}://${req.get("host")}/me`;
  //console.log(newVendor);

  //console.log(url);
  createSendToken(newVendor, 201, req, res);
});

//vendor login
exports.vendorLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const vendor = await vendorModel.findOne({ email }).select("+password");

  if (!vendor || !(await vendor.correctPassword(password, vendor.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(vendor, 200, req, res);
});

// user protected routes access
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser =
    (await UserModel.findById(decoded.id)) ||
    (await vendorModel.findById(decoded.id));

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  //4) check if vendor subscription is valid
  if (currentUser.subscription) {
    let subsData = await subscriptionModel.findOne({ vendor: currentUser._id });
    //check if subscription exist in database
    if (!subsData) {
      return next(new AppError("No subscription fond with this user"));
    }
    let lastAddedPeriodInMilliseconds = subsData.lastAddedPeriod * 86400000;

    //check if subscription valid
    if (
      lastAddedPeriodInMilliseconds + Date.parse(subsData.activationDate) >
      Date.now()
    ) {
      await subscriptionModel.findOneAndUpdate(
        { user: currentUser._id },
        { valid: false }
      );
      currentUser.isValid = true;
    } else {
      currentUser.isValid = false;
    }
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//authorizing routes access to only users who have authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// authorizating users to only users who have permition to access ths document
exports.permitedTo = (Model, params) =>
  catchAsync(async (req, res, next) => {
    let id;

    if (params && params.prodBody) {
      id = req.body.product;
    } else if (params && params.wishBody) {
      id = req.body.wishList;
    } else {
      id = req.params.id;
    }
    const data = await Model.findById(id);

    if (!data) {
      return next(new AppError("Data requested not found", 404));
    }

    if (
      req.user &&
      req.user.role !== "admin" &&
      data.user._id.toString() !== req.user._id.toString()
    ) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  });

//check if the vendor subscription is valid or not if so vendor can no longer add, update products discounts
exports.checkVendorSub = catchAsync(async (req, res, next) => {
  if (!req.user.isValid) {
    return next(
      new AppError("Your subscription had expired please renew", 403)
    );
  }
  next();
});
