const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../config/repository');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const ADMIN_REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'scholarfind_super_secret_admin_key_2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Register a new user
 * Note: By default, all registrations assign the 'student' role.
 * Public users cannot arbitrarily set their role to 'admin'.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await repository.users.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Role assignment security: only assign admin if adminSecret matches
    let role = 'student';
    if (adminSecret && adminSecret === ADMIN_REGISTRATION_SECRET) {
      role = 'admin';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await repository.users.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role
    });

    // If student, create initial empty profile record
    if (role === 'student') {
      await repository.profiles.upsert(user._id, {
        fullName: user.name,
        state: '',
        course: '',
        qualificationLevel: '',
        currentYear: '',
        institutionType: '',
        marksPercentage: null,
        annualIncome: null,
        category: '',
        gender: '',
        hasDisability: false,
        disabilityPercentage: 0,
        isFirstGenerationLearner: false
      });
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

/**
 * User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await repository.users.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res) => {
  try {
    const user = await repository.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
