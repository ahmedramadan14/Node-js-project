const express = require('express');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/auth');
const { getPosts, getPost, createPost, updatePost, deletePost } = require('../controllers/post.controller');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

router.route('/:id')
  .get(getPost)
  .patch(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

module.exports = router;
