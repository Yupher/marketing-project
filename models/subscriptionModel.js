const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const userModel = require("./userModel");

const subscriptionSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: "vendor",
  },
  allTime: {
    type: Number,
    default: 0,
  },
  allRefused: {
    type: Number,
    default: 0,
  },
  allOrders: {
    type: Number,
    default: 0,
  },
  allAborts: {
    type: Number,
    default: 0,
  },
  requestDate: {
    type: Date,
    default: null,
  },
  activationDate: {
    type: Date,
    default: null,
  },
  valid: {
    type: Boolean,
    default: false,
  },
  waitingForAccept: {
    type: Boolean,
    default: false,
  },
  lastAddedPeriod: {
    type: Number,
    default: 0,
  },
  requestPeriod: {
    type: Number,
    default: 0,
  },
  newSubscriber: {
    type: Boolean,
    defualt: undefined,
  },
  refused: {
    type: Boolean,
    defualt: false,
  },
  allActivationDates: [
    {
      type: Date,
      default: null,
    },
  ],
  allAddedPeriods: [
    {
      type: Number,
      default: null,
    },
  ],
});

subscriptionSchema.pre(/^find/, function (next) {
  this.populate("admin");
  next();
});

const subscription = mongoose.model("subscription", subscriptionSchema);

module.exports = subscription;
