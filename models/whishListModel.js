const mongoose = require ('mongoose')

const wishListSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
    products:[{
        product:{
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now()
    }
})
wishListSchema.pre(/^find/, function (next) {
    this.populate("products.product");
    this.populate("user");
    next();
  });

const whishList = mongoose.model("wishList", wishListSchema);
module.exports = whishList;