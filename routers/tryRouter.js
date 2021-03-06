const express = require('express');
const tryController = require('./../controllers/tryController');

const router = express.Router({ mergeParams: true });

//router.use(authController.protect);

router
  .route('/')
  .get(tryController.getAllTry)
  .post(tryController.createTry);

router
  .route('/:id')
  .get(tryController.getTry)
  .patch(
    tryController.updateTry
  ) 
.delete(
    tryController.deleteTry
  );

module.exports = router;