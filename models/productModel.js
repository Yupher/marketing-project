const mongoose = require("mongoose");
const slugify = require("slugify");
const reviewModel = require("./reviewModel");
// const User = require('./userModel');
// const validator = require('validator');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    unique: true,
    trim: true,
    maxlength: [
      40,
      "A product name must have less or equal then 40 characters",
    ],
    minlength: [
      10,
      "A product name must have more or equal then 10 characters",
    ],
  },
  quantity: {
    type: Number,
    required: [true, "A product must have quantity"],
  },
  color: {
    type: String,
    required: [true, "A product must have a color"],
  },
  size: {
    type: String,
    required: [true, "A product must have a size"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "vendor",
    required: [true, "Review must belong to a user"],
  },
  slug: String,
  reviews: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "review",
    },
  ],
  ratingsAverage: {
    type: Number,
    default: 4.5,
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
  },
  priceDiscount: {
    value: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    period: Number,
  },
  description: {
    type: String,
    trim: true,
    required: [true, "A product must have a description"],
  },
  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "A product must have a category"],
    },
  ],
  tags: {
    type: Array,
  },
  shipping: {
    type: Number,
    required: [true, "A product must have a shipping price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
  },
});

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

productSchema.pre(/^find/, function (next) {
  this.populate("user");
  this.populate("categories");
  this.populate("reviews");
  next();
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre("save", async function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

const product = mongoose.model("product", productSchema);

module.exports = product;
