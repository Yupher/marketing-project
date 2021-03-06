const subscriptionModel = require("../models/subscriptionModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

exports.getAllSubscriptions = factory.getAll(subscriptionModel, {
  populateUser: true,
});

exports.getSubscription = factory.getOne(subscriptionModel, {
  populateUser: true,
});

exports.deleteSubscription = factory.deleteOne(subscriptionModel);

//request subscription

exports.requestSubscription = catchAsync(async (req, res, next) => {
  let subData = await subscriptionModel.findOne({ vendor: req.user._id });
  //check if subscription exists in data base
  if (!subData) {
    return next(new AppError("Subscription document does not exist.", 404));
  }

  //check if subs exists in data base
  if (subData.waitingForAccept) {
    return next(
      new AppError(
        "Sorry, Your request is already being processed, an administrator will see it soon.",
        404
      )
    );
  }

  //check if user enterd a period of subscription
  let { period } = req.body;

  if (!period) {
    return next(new AppError("Please enter the period of time.", 404));
  }

  //check if subs period is valid
  let periodInMilisecond = period * 86400000;

  if (periodInMilisecond + Date.now() <= Date.now()) {
    return next(new AppError("Please enter a valid period of time.", 404));
  }

  let subRequest = {
    waitingForAccept: true,
    requestDate: Date.now(),
    requestPeriod: period,
    newSubscriber:
      !subData.newSubscriber && subData.newSubscriber !== false ? true : false,
  };

  await subscriptionModel.findOneAndUpdate(
    { vendor: req.user._id },
    subRequest
  );

  let newSubRequest = await subscriptionModel.findOne({ vendor: req.user._id });

  return res.status(200).json({
    success: true,
    result: newSubRequest,
  });
});

exports.subsRequestProcessing = catchAsync(async (req, res, next) => {
  let subsData = await subscriptionModel.findById(req.params.id);

  //check if subs exists in data base
  if (!subsData) {
    return next(new AppError("Subscription document does not exist.", 404));
  }

  //check body
  if (
    !req.body &&
    !req.body.decision &&
    req.body.decision !== "accepted" &&
    req.body.decision !== "rejected"
  ) {
    return next(
      new AppError("Please select an option(accepted or rejected).", 404)
    );
  }

  //check if subs exists in data base
  if (!subsData.waitingForAccept) {
    return next(new AppError("Sorry, No request with this ID.", 404));
  }

  let processedSub;

  if (req.body.decision === "accepted") {
    processedSub = {
      admin: req.user._id,
      refused: false,
      newSubscriber: false,
      allTime: subsData.allTime + subsData.requestPeriod,
      allOrders: subsData.allOrders + 1,
      valid: true,
      activationDate: Date.now(),
      lastAddedPeriod: subsData.requestPeriod,
      waitingForAccept: false,
      allActivationDates: [...subsData.allActivationDates, Date.now()],
      allAddedPeriods: [...subsData.allAddedPeriods, subsData.requestPeriod],
    };
  } else {
    processedSub = {
      admin: req.user._id,
      lastAddedPeriod: 0,
      activationDate: Date.now(),
      newSubscriber: false,
      valid: false,
      waitingForAccept: false,
      allRefused: subsData.allRefused + 1,
      refused: true,
    };
  }

  await subscriptionModel.findByIdAndUpdate(req.params.id, processedSub);
  let updatedSubs = await subscriptionModel.findById(req.params.id);

  return res.status(200).json({
    success: true,
    result: updatedSubs,
  });
});

exports.abortSubscription = catchAsync(async (req, res, next) => {
  let subsData = await subscriptionModel.findOne({ vendor: req.user._id });

  //check if subs exists in data base
  if (!subsData) {
    return next(new AppError("Subscription document does not exist.", 404));
  }

  //check if the user subs is valid or not
  if (!req.user.isValid) {
    return next(new AppError("You didn't activate you subscription yet.", 404));
  }

  let abortedSub = {
    allAborts: subsData.allAborts + 1,
    lastAddedPeriod: 0,
    activationDate: Date.now(),
    valid: false,
    waitingForAccept: false,
  };

  await subscriptionModel.findOneAndUpdate(
    { vendor: req.user._id },
    abortedSub
  );
  let updatedSubs = await subscriptionModel.findOne({ vendor: req.user._id });

  return res.status(200).json({ success: true, result: updatedSubs });
});
