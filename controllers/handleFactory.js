const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const APIFeatures = require("./../utils/apiFeatures");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const vendorModel = require("../models/vendorModel");

exports.getAll = (Model, params) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();
    let doc = await features.query;
    if (params && params.populateUser) {
      for (let i = 0; i < doc.length; i++) {
        let userData = await userModel.findById(doc[i].user);
        doc[i].user = userData;
      }
    }

    //get active prod

    if (params && params.activeProduct) {
      let activeProds = [];

      doc.forEach((elm) => {
        let subsData = elm.user.subscription;
        let lastAddedPeriodInMilliseconds = subsData.lastAddedPeriod * 86400000;
        let lastActivationDate = subsData.activationDate
          ? Date.parse(subsData.activationDate)
          : 0;

        if (lastActivationDate + lastAddedPeriodInMilliseconds > Date.now()) {
          activeProds.push(elm);
        }
      });
      doc = activeProds;
    }

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

// add new try
exports.createOne = (Model, params) =>
  catchAsync(async (req, res, next) => {
    let warning = undefined;
    // Add User
    if (params && params.addUser) {
      req.body.user = req.user._id;
    }
    if (
      params &&
      params.spliceTag &&
      req.body.tags &&
      req.body.tags.length > 3
    ) {
      req.body.tags = req.body.tags.splice(4);
      warning = "Max tags is 3";
    }
    if (params && params.checkCategory) {
      let categoryData = await categoryModel.findById(req.body.categories);
      if (!req.body.categories || !categoryData) {
        return next(new AppError("A product must have a Category", 404));
      }
    }

    if (params && params.addProduct) {
      req.body.product = req.params.id;
    }

    //check if vendor is reviewing its own product which he can't
    if (params && params.checkReview) {
      let productData = await productModel.findById(req.params.id);
      if (!productData) {
        return next(new AppError("Product not found", 404));
      }

      if (productData.user._id.toString() === req.user._id.toString()) {
        return next(new AppError("You can not review your own product", 404));
      }
    }
    //populate user in review
    if (params && params.populateUser) {
      let userData =
        (await userModel.findById(req.user._id)) ||
        (await vendorModel.findById(req.user._id));
      if (!userData) {
        return next(new AppError("User not found", 404));
      }
      req.body.user = userData;
    }

    const doc = await Model.create(req.body);

    //add review to product
    if (params && params.addReviewToProduct) {
      let productData = await productModel.findById(req.params.id);
      productData.reviews.push(doc._id);
      await productData.save();
    }
    res.status(201).json({
      status: "success",
      warning,
      data: {
        data: doc,
      },
    });
  });

// get One
exports.getOne = (Model, params, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    if (params && params.populateUser) {
      let userData = await userModel.findById(doc.user);
      doc.user = userData;
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//Update try
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//Delete try
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
