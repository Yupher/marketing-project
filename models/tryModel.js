const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty!']
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;