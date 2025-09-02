const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.signup = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      bio, 
      password, 
      role
    } = req.body;
    const user = await User.create({
      name, 
      email, 
      bio, 
      password, 
      role 
    });
    const token = signToken(user._id);
    const cleanUser = user.toObject();
    delete cleanUser.password;
    res.status(201).json({ 
      status: 'success', 
      token, 
      user: cleanUser });
  } catch (err) {
    res.status(400).json({ status: 'fail'
      , message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail'
        , message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, 
      user.password))) {
      return res.status(401).json({ status: 'fail', 
        message: 'Incorrect email or password' });
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ status: 'success', token, user });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Create first admin
exports.ensureFirstAdmin = async () => {
  const count = await User.countDocuments({ role: 'admin' });
  if (count === 0) {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(' First admin created:', admin.email);
  }
};
