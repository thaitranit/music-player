const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
  // Create default admin if not exists
  createDefaultAdmin: async () => {
    try {
      const adminExists = await User.findOne({ username: 'admin' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({ 
          username: 'admin', 
          password: hashedPassword, 
          isAdmin: true 
        });
        await admin.save();
        console.log('✅ Default admin created (username: admin, password: admin123)');
      }
    } catch (error) {
      console.error('❌ Error creating default admin:', error.message);
    }
  },

  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;
