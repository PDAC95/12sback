const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { 
  validateQuickRegister, 
  validateFullRegister,
  validateLeadUpdate 
} = require('../middleware/validation');

// Analytics tracking
const trackCaptureEvent = async (customerId, event, data = {}) => {
  try {
    // Log to analytics service or database
    console.log(`[ANALYTICS] Customer ${customerId}: ${event}`, data);
    
    // You can expand this to send to analytics services like:
    // - Google Analytics
    // - Mixpanel
    // - Segment
    // - Custom analytics database
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Quick register endpoint (email only)
router.post('/quick-register', validateQuickRegister, async (req, res) => {
  try {
    const { email, source = 'modal' } = req.body;

    // Check for existing customer
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update existing lead
      customer.captureStep = Math.max(customer.captureStep, 1);
      customer.lastActivity = new Date();
      
      // Update source if it's a new source
      if (!customer.captureSource.includes(source)) {
        customer.captureSource.push(source);
      }

      await customer.save();

      // Track returning lead
      await trackCaptureEvent(customer._id, 'lead_returned', {
        email,
        source,
        captureStep: customer.captureStep
      });

      return res.status(200).json({
        success: true,
        message: 'Welcome back!',
        data: {
          customerId: customer._id,
          captureStep: customer.captureStep,
          isExisting: true
        }
      });
    }

    // Create new lead
    customer = await Customer.findOrCreateLead(email, source);

    // Track new lead
    await trackCaptureEvent(customer._id, 'lead_captured', {
      email,
      source,
      captureStep: 1
    });

    return res.status(201).json({
      success: true,
      message: 'Email captured successfully',
      data: {
        customerId: customer._id,
        captureStep: customer.captureStep,
        isExisting: false
      }
    });

  } catch (error) {
    console.error('Quick register error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process registration'
    });
  }
});

// Update lead information (progressive capture)
router.put('/update-lead/:customerId', validateLeadUpdate, async (req, res) => {
  try {
    const { customerId } = req.params;
    const updateData = req.body;

    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Update capture progress
    const updatedCustomer = await customer.updateCaptureProgress(updateData);

    // Track capture progress
    await trackCaptureEvent(customerId, 'lead_updated', {
      captureStep: updatedCustomer.captureStep,
      fieldsUpdated: Object.keys(updateData)
    });

    return res.status(200).json({
      success: true,
      message: 'Information updated successfully',
      data: {
        customerId: updatedCustomer._id,
        captureStep: updatedCustomer.captureStep
      }
    });

  } catch (error) {
    console.error('Update lead error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update information'
    });
  }
});

// Full registration (complete all fields)
router.post('/complete-registration', validateFullRegister, async (req, res) => {
  try {
    const { email, firstName, lastName, phone, password, customerId } = req.body;

    let customer;

    if (customerId) {
      // Update existing lead
      customer = await Customer.findById(customerId);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // Check if email matches
      if (customer.email !== email) {
        return res.status(400).json({
          success: false,
          error: 'Email mismatch'
        });
      }
    } else {
      // Check if customer exists
      customer = await Customer.findOne({ email });
      
      if (!customer) {
        // Create new customer
        customer = new Customer({
          email,
          status: 'lead',
          captureStep: 0,
          captureSource: ['registration']
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update customer information
    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.phone = phone;
    customer.password = hashedPassword;
    customer.status = 'registered';
    customer.captureStep = 3; // Completed all steps
    customer.registrationCompleted = new Date();
    customer.lastActivity = new Date();

    await customer.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer._id, 
        email: customer.email,
        status: customer.status
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Track registration completion
    await trackCaptureEvent(customer._id, 'registration_completed', {
      email,
      source: customer.captureSource[0] || 'direct'
    });

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        customerId: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        token
      }
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete registration'
    });
  }
});

// Get conversion rates (admin endpoint)
router.get('/conversion-rates', async (req, res) => {
  try {
    const rates = await Customer.getConversionRates();
    
    return res.status(200).json({
      success: true,
      data: rates
    });

  } catch (error) {
    console.error('Get conversion rates error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get conversion rates'
    });
  }
});

// Check if email exists
router.post('/check-email', validateQuickRegister, async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await Customer.findOne({ email });

    return res.status(200).json({
      success: true,
      exists: !!customer,
      data: customer ? {
        status: customer.status,
        captureStep: customer.captureStep
      } : null
    });

  } catch (error) {
    console.error('Check email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check email'
    });
  }
});

module.exports = router;