const categoryModel = require("../models/categoryModel");
const factory = require("./handleFactory");






exports.getAllCategory = factory.getAll(categoryModel);

exports.getCategory = factory.getOne(categoryModel);

exports.createCategory = factory.createOne(categoryModel,{addUser:true});

exports.updateCategory = factory.updateOne(categoryModel);

exports.deleteCategory = factory.deleteOne(categoryModel);