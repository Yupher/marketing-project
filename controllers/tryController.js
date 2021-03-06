const Try = require('./../models/tryModel');
const factory = require('../controllers/handleFactory');
// const catchAsync = require('./../utils/catchAsync');


exports.getAllTry= factory.getAll(Try);
exports.createTry= factory.createOne(Try);
exports.getTry= factory.getOne(Try);
exports.updateTry = factory.updateOne(Try);
exports.deleteTry = factory.deleteOne(Try);