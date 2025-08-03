const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errorMessages,
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Bio cannot exceed 300 characters'),
    
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors,
];

// Post creation validation
const validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Post content must be between 1 and 1000 characters'),
    
  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Bio cannot exceed 300 characters'),
    
  handleValidationErrors,
];

// Comment validation
const validateComment = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
    
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePost,
  validateProfileUpdate,
  validateComment,
  handleValidationErrors,
};
