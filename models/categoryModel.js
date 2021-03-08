const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  slug: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "catogory must belong to a user"],
  },
  category: {
    type: String,
    required: [true, "Please give the category name"],
  },
  description: String,
  active: {
    type: String,
    default: true,
  },
});
categorySchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
  });
  next();
});

categorySchema.pre("save", function (next) {
  this.slug = slugify(this.category, { lower: true });
  next();
});

const category = mongoose.model("category", categorySchema);
module.exports = category;
