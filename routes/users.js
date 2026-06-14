const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');

// @route   PUT /api/users/profile
// @desc    Update user profile details (fullName, email, phone, profilePicture)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, phone, profilePicture } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email is changing, verify it is not already taken
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }
      user.email = email.toLowerCase();
    }

    // Update other fields
    user.fullName = fullName !== undefined ? fullName.trim() : user.fullName;
    user.phone = phone !== undefined ? phone.trim() : user.phone;
    user.profilePicture = profilePicture !== undefined ? profilePicture.trim() : user.profilePicture;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// @route   GET /api/users/addresses
// @desc    Get user's address book
// @access  Private
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching addresses', error: error.message });
  }
});

// @route   POST /api/users/addresses
// @desc    Add a new address
// @access  Private
router.post('/addresses', auth, async (req, res) => {
  try {
    const { fullName, addressLine, city, state, postalCode, country, phone, isDefault } = req.body;

    if (!fullName || !addressLine || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'Please provide all required address fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is the first address, automatically make it default
    const shouldBeDefault = user.addresses.length === 0 ? true : !!isDefault;

    // If set to default, unset other defaults
    if (shouldBeDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      fullName,
      addressLine,
      city,
      state,
      postalCode,
      country,
      phone: phone || '',
      isDefault: shouldBeDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding address', error: error.message });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update a specific address
// @access  Private
router.put('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { fullName, addressLine, city, state, postalCode, country, phone, isDefault } = req.body;

    if (!fullName || !addressLine || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'Please provide all required address fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting to default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.fullName = fullName;
    address.addressLine = addressLine;
    address.city = city;
    address.state = state;
    address.postalCode = postalCode;
    address.country = country;
    address.phone = phone || '';
    address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

    // If we updated the only address, ensure it remains default
    if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating address', error: error.message });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete a specific address
// @access  Private
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and have other addresses left, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting address', error: error.message });
  }
});

// @route   POST /api/users/addresses/:addressId/default
// @desc    Set address as default
// @access  Private
router.post('/addresses/:addressId/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let addressFound = false;
    user.addresses.forEach(addr => {
      if (addr._id.toString() === req.params.addressId) {
        addr.isDefault = true;
        addressFound = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!addressFound) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await user.save();

    res.json({
      message: 'Default address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error setting default address', error: error.message });
  }
});

// @route   POST /api/users/security/change-password
// @desc    Change user password
// @access  Private
router.post('/security/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error changing password', error: error.message });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { orderUpdates, promotions } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize preferences object if it doesn't exist
    if (!user.preferences) {
      user.preferences = {
        notificationPreferences: { orderUpdates: true, promotions: false },
        theme: 'lavender'
      };
    }

    if (orderUpdates !== undefined) {
      user.preferences.notificationPreferences.orderUpdates = !!orderUpdates;
    }
    if (promotions !== undefined) {
      user.preferences.notificationPreferences.promotions = !!promotions;
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating preferences', error: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all registered users (Admin only, safe fields)
// @access  Private
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find({});
    const customers = [];
    for (const u of users) {
      const orderCount = await Order.countDocuments({ user: u._id });
      customers.push({
        _id: u._id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
        orderCount
      });
    }
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users list', error: error.message });
  }
});

module.exports = router;
