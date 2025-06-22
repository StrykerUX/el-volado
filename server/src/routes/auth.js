const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters' 
      });
    }
    
    // Check if user exists in database
    const existingUser = await User.findByEmailOrUsername(email) || 
                         await User.findByEmailOrUsername(username);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }
    
    // Create user in database
    const user = await User.create({
      username,
      email,
      password_hash: password, // Will be hashed by User model hook
      display_name: username,
      is_active: true,
      is_verified: false
    });
    
    // Generate tokens using middleware function
    const tokens = generateTokens(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false,
        error: 'Username or email already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to register user' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, emailOrUsername, password } = req.body;
    
    // Support both email and emailOrUsername fields
    const loginIdentifier = email || emailOrUsername;
    
    // Validation
    if (!loginIdentifier || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }
    
    // Find user in database
    const user = await User.findByEmailOrUsername(loginIdentifier);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false,
        error: 'Account is deactivated' 
      });
    }
    
    // Check password using User model method
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    // Generate tokens using middleware function
    const tokens = generateTokens(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to login' 
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // For JWT, logout is typically handled client-side by removing the token
    // But we can log the event for security monitoring
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to logout' 
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        is_active: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to refresh token' 
    });
  }
});

module.exports = router;