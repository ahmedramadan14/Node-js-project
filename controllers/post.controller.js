const Post = require('../models/post.model');
const User = require("../models/user.model"); 

exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate('autherId', 'name email');
  res.json(posts);
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('autherId', 'name email');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, autherId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    let finalAuthorId;

    if (req.user.role === "admin") {
      finalAuthorId = autherId || req.user.id; 
    } else {
      if (autherId && autherId !== req.user.id) {
        return res.status(403).json({
          message: "You are not allowed to  create a post for another user",
        });
      }
      finalAuthorId = req.user.id;
    }

    const user = await User.findById(finalAuthorId);
    if (!user) {
      return res.status(404).json({ message: "Author not found" });
    }

    const post = await Post.create({
      title,
      content,
      image,
      autherId: finalAuthorId,
    });

    res.status(201).json({
      status: "success",
      data: { post },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const post = await Post.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.autherId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete this post" });
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
