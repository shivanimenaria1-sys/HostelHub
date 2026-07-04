const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Helper
const generateToken = (id, email) => {
  return jwt.sign(
    { id, email },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '7d' } // JWT expiration set to 7 days
  );
};

// @desc    Google Auth login / signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      status: 'error',
      message: 'ID Token is required'
    });
  }

  try {
    let email, name, picture, googleId;

    // Verify token using google-auth-library if CLIENT_ID is configured
    // Fallback/Mock logic in development to ease testing if CLIENT_ID is not configured
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else {
      // Development mock fallback: decode JWT payload loosely (since we're running locally without config)
      console.warn("GOOGLE_CLIENT_ID is not defined in .env. Attempting fallback decoding of idToken.");
      
      // Decodes base64 payload of Google ID Token (which is a standard JWT)
      const base64Url = idToken.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format');
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString()
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      email = payload.email;
      name = payload.name;
      picture = payload.picture || '';
      googleId = payload.sub || payload.email;
    }

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Could not retrieve email from Google authentication token'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    let needsOnboarding = false;

    if (!user) {
      isNewUser = true;
      needsOnboarding = true;

      // Create new user record
      user = await User.create({
        name,
        email,
        googleId,
        profilePic: picture,
        hostel: '',
        roomNumber: '',
        phoneNumber: '',
        needsOnboarding: true
      });
    } else {
      needsOnboarding = user.needsOnboarding;
      
      // Update googleId and profilePic if not set
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && !user.profilePic) {
        user.profilePic = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Generate backend JWT
    const token = generateToken(user._id, user.email);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        hostel: user.hostel,
        roomNumber: roomNumber = user.roomNumber,
        phoneNumber: user.phoneNumber,
        needsOnboarding: user.needsOnboarding
      },
      isNewUser,
      needsOnboarding
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Google token verification failed',
      details: error.message
    });
  }
};

// @desc    Update Onboarding details
// @route   PUT /api/auth/onboarding
// @access  Private
const updateOnboarding = async (req, res) => {
  const { hostel, roomNumber, phoneNumber } = req.body;

  // Simple validation
  if (!hostel || !roomNumber || !phoneNumber) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all onboarding fields (hostel, roomNumber, phoneNumber)'
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(450).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update boarding details
    user.hostel = hostel;
    user.roomNumber = roomNumber;
    user.phoneNumber = phoneNumber;
    user.needsOnboarding = false; // complete onboarding

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Onboarding completed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
        phoneNumber: user.phoneNumber,
        needsOnboarding: user.needsOnboarding
      }
    });
  } catch (error) {
    console.error('Onboarding Update Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update onboarding details'
    });
  }
};

module.exports = {
  googleLogin,
  updateOnboarding
};
