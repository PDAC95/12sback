const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String
  },

  // Status and Tracking
  status: {
    type: String,
    enum: ['lead', 'registered', 'active', 'inactive', 'banned'],
    default: 'lead'
  },
  captureStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  captureSource: [{
    type: String
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  registrationCompleted: {
    type: Date
  },

  // Additional Fields
  ipAddress: String,
  userAgent: String,
  referrer: String,
  
  // Marketing
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  marketingOptIn: {
    type: Boolean,
    default: false
  },

  // Analytics
  conversionData: {
    initialSource: String,
    initialTimestamp: Date,
    completionTimestamp: Date,
    timeToConvert: Number // in minutes
  }
}, {
  timestamps: true
});

// Indexes for performance
customerSchema.index({ status: 1, createdAt: -1 });
customerSchema.index({ captureStep: 1 });
customerSchema.index({ lastActivity: -1 });

// Instance Methods

// Update capture progress
customerSchema.methods.updateCaptureProgress = async function(data) {
  // Track what fields are being updated
  const fieldsToUpdate = Object.keys(data);
  
  // Update provided fields
  if (data.firstName) this.firstName = data.firstName;
  if (data.lastName) this.lastName = data.lastName;
  if (data.phone) this.phone = data.phone;
  
  // Calculate capture step based on filled fields
  let step = 1; // Email is always step 1
  
  if (this.firstName && this.lastName) {
    step = 2;
  }
  
  if (this.firstName && this.lastName && this.phone) {
    step = 3;
  }
  
  // Update capture step
  this.captureStep = Math.max(this.captureStep, step);
  
  // Update last activity
  this.lastActivity = new Date();
  
  // Save and return
  await this.save();
  return this;
};

// Compare password
customerSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static Methods

// Find or create lead
customerSchema.statics.findOrCreateLead = async function(email, source = 'unknown') {
  try {
    // Try to find existing customer
    let customer = await this.findOne({ email });
    
    if (customer) {
      // Update existing customer
      customer.lastActivity = new Date();
      
      // Add source if new
      if (!customer.captureSource.includes(source)) {
        customer.captureSource.push(source);
      }
      
      await customer.save();
      return customer;
    }
    
    // Create new lead
    customer = new this({
      email,
      status: 'lead',
      captureStep: 1,
      captureSource: [source],
      conversionData: {
        initialSource: source,
        initialTimestamp: new Date()
      }
    });
    
    await customer.save();
    return customer;
    
  } catch (error) {
    console.error('Error in findOrCreateLead:', error);
    throw error;
  }
};

// Get conversion rates
customerSchema.statics.getConversionRates = async function() {
  try {
    const pipeline = [
      {
        $facet: {
          totalLeads: [
            { $match: { status: 'lead' } },
            { $count: 'count' }
          ],
          registeredUsers: [
            { $match: { status: { $in: ['registered', 'active'] } } },
            { $count: 'count' }
          ],
          byStep: [
            {
              $group: {
                _id: '$captureStep',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          bySource: [
            { $unwind: '$captureSource' },
            {
              $group: {
                _id: '$captureSource',
                total: { $sum: 1 },
                converted: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['registered', 'active']] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          timeToConvert: [
            {
              $match: {
                'conversionData.timeToConvert': { $exists: true, $gt: 0 }
              }
            },
            {
              $group: {
                _id: null,
                avgMinutes: { $avg: '$conversionData.timeToConvert' },
                minMinutes: { $min: '$conversionData.timeToConvert' },
                maxMinutes: { $max: '$conversionData.timeToConvert' }
              }
            }
          ],
          last30Days: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                leads: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'lead'] }, 1, 0]
                  }
                },
                registered: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['registered', 'active']] },
                      1,
                      0
                    ]
                  }
                }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ];

    const results = await this.aggregate(pipeline);
    const data = results[0];

    // Process results
    const totalLeads = data.totalLeads[0]?.count || 0;
    const registeredUsers = data.registeredUsers[0]?.count || 0;
    const conversionRate = totalLeads > 0 ? (registeredUsers / totalLeads) * 100 : 0;

    // Process source conversion rates
    const sourceRates = {};
    data.bySource.forEach(source => {
      sourceRates[source._id] = {
        total: source.total,
        converted: source.converted,
        rate: source.total > 0 ? (source.converted / source.total) * 100 : 0
      };
    });

    return {
      summary: {
        totalLeads,
        registeredUsers,
        conversionRate: conversionRate.toFixed(2) + '%'
      },
      byStep: data.byStep,
      bySource: sourceRates,
      avgTimeToConvert: data.timeToConvert[0] || null,
      last30Days: data.last30Days
    };

  } catch (error) {
    console.error('Error getting conversion rates:', error);
    throw error;
  }
};

// Pre-save hook to track conversion time
customerSchema.pre('save', function(next) {
  // If status is changing from lead to registered
  if (this.isModified('status') && 
      this.status === 'registered' && 
      this.conversionData?.initialTimestamp) {
    
    this.conversionData.completionTimestamp = new Date();
    const timeDiff = this.conversionData.completionTimestamp - this.conversionData.initialTimestamp;
    this.conversionData.timeToConvert = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
  }
  
  next();
});

module.exports = mongoose.model('Customer', customerSchema);