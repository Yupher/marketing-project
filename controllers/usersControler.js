const userModel = require("../models/userModel");
const factory = require("./handleFactory");

exports.getAllUsers = factory.getAll(userModel);

exports.getUser = factory.getOne(userModel);

exports.deleteUser = factory.deleteOne(userModel);
