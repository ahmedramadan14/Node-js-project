const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('admin'), getUsers)
  .post(protect, restrictTo('admin'), createUser);

router
  .route('/:id')
  .get(protect, getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
