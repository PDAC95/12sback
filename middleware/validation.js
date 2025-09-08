const rateLimit = require('express-rate-limit');
const validator = require('validator');

// List of common disposable email domains
const disposableEmailDomains = [
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'throwaway.email', 'yopmail.com', 'maildrop.cc', 'getnada.com',
  'temp-mail.org', 'fakeinbox.com', 'sharklasers.com', 'guerrillamail.info'
];

// Rate limiter for registration attempts
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many registration attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Email validation
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check for disposable email domains
  const emailDomain = email.toLowerCase().split('@')[1];
  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({ error: 'Disposable email addresses are not allowed' });
  }

  // Normalize email
  req.body.email = validator.normalizeEmail(email.toLowerCase());

  next();
};

// Phone validation (US format)
const validatePhone = (req, res, next) => {
  const { phone } = req.body;

  // Phone is optional, but if provided must be valid
  if (phone) {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid US phone number (10 digits)
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit US phone number' });
    }

    // Check if it starts with a valid US area code (not 0 or 1)
    if (cleanPhone[0] === '0' || cleanPhone[0] === '1') {
      return res.status(400).json({ error: 'Invalid US phone number' });
    }

    // Format phone number as (XXX) XXX-XXXX
    req.body.phone = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 10)}`;
  }

  next();
};

// Quick register validation (email only)
const validateQuickRegister = [
  registrationLimiter,
  validateEmail,
  (req, res, next) => {
    // Additional quick register specific validation if needed
    next();
  }
];

// Full register validation (all fields)
const validateFullRegister = [
  registrationLimiter,
  validateEmail,
  validatePhone,
  (req, res, next) => {
    const { firstName, lastName, password } = req.body;

    // Validate first name
    if (firstName) {
      if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        return res.status(400).json({ error: 'First name must be at least 2 characters' });
      }
      req.body.firstName = validator.escape(firstName.trim());
    }

    // Validate last name
    if (lastName) {
      if (typeof lastName !== 'string' || lastName.trim().length < 2) {
        return res.status(400).json({ error: 'Last name must be at least 2 characters' });
      }
      req.body.lastName = validator.escape(lastName.trim());
    }

    // Validate password if provided
    if (password) {
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      
      // Check password strength
      if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
      })) {
        return res.status(400).json({ 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }
    }

    next();
  }
];

// Lead update validation
const validateLeadUpdate = [
  validatePhone,
  (req, res, next) => {
    const { firstName, lastName } = req.body;

    // Validate first name if provided
    if (firstName !== undefined) {
      if (!firstName || firstName.trim().length < 2) {
        return res.status(400).json({ error: 'First name must be at least 2 characters' });
      }
      req.body.firstName = validator.escape(firstName.trim());
    }

    // Validate last name if provided
    if (lastName !== undefined) {
      if (!lastName || lastName.trim().length < 2) {
        return res.status(400).json({ error: 'Last name must be at least 2 characters' });
      }
      req.body.lastName = validator.escape(lastName.trim());
    }

    next();
  }
];

module.exports = {
  validateEmail,
  validatePhone,
  validateQuickRegister,
  validateFullRegister,
  validateLeadUpdate,
  registrationLimiter
};