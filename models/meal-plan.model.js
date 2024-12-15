const mongoose = require('mongoose');

const mealPlanSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  meals: {
    type: Map,
    of: {
      breakfast: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      lunch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      dinner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      snacks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      }]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);