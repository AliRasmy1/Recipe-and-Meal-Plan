const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const User = require('../models/user.model');

exports.createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      userId: req.user.userId
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error: error.message });
  }
};

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('userId', 'username profileImage')
      .sort('-createdDate');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
};

// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('userId', 'username profileImage')
      .populate('comments.userId', 'username profileImage')
      .populate('ratings.userId', 'username');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
};

// Update a recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};


exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Ensure the likes field is initialized
    if (!Array.isArray(recipe.likes)) {
      recipe.likes = [];
    }

    const userId = req.user.userId;

    // Add or remove the user's ID from the likes array
    if (recipe.likes.includes(userId)) {
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId);
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error liking recipe', error: error.message });
  }
};


// Add a comment to a recipe
exports.addComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = {
      id: new mongoose.Types.ObjectId().toString(),
      userId: req.user.userId,
      username: req.user.username,
      text: req.body.text
    };

    // Add only the comment without modifying unrelated fields
    recipe.comments.push(comment);
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};


// Add or update a rating for a recipe
exports.addRating = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const existingRating = recipe.ratings.find(
      rating => rating.userId.toString() === req.user.userId
    );

    if (existingRating) {
      existingRating.rating = req.body.rating;
    } else {
      recipe.ratings.push({
        userId: req.user.userId,
        rating: req.body.rating
      });
    }

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error adding rating', error: error.message });
  }
};

// Search recipes
exports.searchRecipes = async (req, res) => {
  try {
    const { query, cuisine, difficulty, cookingTime } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (cuisine) {
      searchQuery.cuisine = cuisine;
    }

    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }

    if (cookingTime) {
      searchQuery.cookingTime = { $lte: parseInt(cookingTime) };
    }

    const recipes = await Recipe.find(searchQuery)
      .populate('userId', 'username profileImage')
      .sort('-createdDate');

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error searching recipes', error: error.message });
  }
};
