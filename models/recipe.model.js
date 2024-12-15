const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: String, // e.g., "1 cup", "2 tbsp"
    required: true
  },
  price: {
    type: Number, // Optional, can be fetched from an external API
    required: true
  }
});

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true // Denormalized for performance
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  cookingTime: {
    type: Number, // In minutes
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  ingredients: [ingredientSchema], // Array of ingredients
  totalCost: {
    type: Number,
    required: true
  },
  macros: {
    carb: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    fats: {
      type: Number,
      required: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cuisine: {
    type: String
  },
  timeSlot: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  ratings: [ratingSchema], // Array of ratings
  comments: [commentSchema], // Array of comments
  servings: {
    type: Number
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  likes: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'User',
  default: []
}
});

module.exports = mongoose.model('Recipe', recipeSchema);
