const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // TODO: Get user data from database
    const userProfile = {
      id: user.id,
      username: user.username,
      email: 'user@example.com', // TODO: Get from database
      stats: {
        totalCoinsEarned: 0,
        totalTaps: 0,
        totalTimePlayedHours: 0,
        achievementsUnlocked: 0
      },
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: userProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    
    // TODO: Update user in database
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: { username }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;