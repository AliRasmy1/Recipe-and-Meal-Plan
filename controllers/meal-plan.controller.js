const MealPlan = require('../models/meal-plan.model');
const Recipe = require('../models/recipe.model');


exports.getMealPlan = async (req, res) => {
  try {
    const { weekStartDate } = req.query;

    
    const filter = { user: req.user.userId };
    if (weekStartDate) {
      filter.weekStartDate = new Date(weekStartDate);
    }

    const mealPlans = await MealPlan.find(filter)
      .populate({
        path: 'meals',
        populate: {
          path: 'breakfast lunch dinner snacks',
          model: 'Recipe',
        },
      })
      .sort({ weekStartDate: 1 }); 

    if (!mealPlans.length) {
      return res.status(404).json({ message: 'No meal plans found.' });
    }

    res.status(200).json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving meal plans.', error: error.message });
  }
};


exports.createMealPlan = async (req, res) => {
  try {
    const { weekStartDate, meals } = req.body;

    for (const day of Object.keys(meals)) {
      const { breakfast, lunch, dinner, snacks } = meals[day];
      const recipeIds = [];

      if (breakfast) recipeIds.push(breakfast);
      if (lunch) recipeIds.push(lunch);
      if (dinner) recipeIds.push(dinner);
      if (snacks && snacks.length > 0) recipeIds.push(...snacks);

      if (recipeIds.length > 0) {
        const validRecipes = await Recipe.find({ _id: { $in: recipeIds } });

        if (validRecipes.length !== recipeIds.length) {
          return res.status(400).json({ message: 'Invalid recipe ID(s) provided.' });
        }
      }
    }

    const existingMealPlan = await MealPlan.findOne({
      user: req.user.userId,
      weekStartDate,
    });

    if (existingMealPlan) {
      return res.status(400).json({ message: 'Meal plan already exists for this week.' });
    }

    const newMealPlan = await MealPlan.create({
      user: req.user.userId,
      weekStartDate,
      meals,
    });

    res.status(201).json(newMealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meal plan.', error: error.message });
  }
};


exports.updateMealPlan = async (req, res) => {
  try {
    const { weekStartDate, meals } = req.body;

    for (const day of Object.keys(meals)) {
      const { breakfast, lunch, dinner, snacks } = meals[day];
      const recipeIds = [breakfast, lunch, dinner, ...snacks];
      const validRecipes = await Recipe.find({ _id: { $in: recipeIds } });

      if (validRecipes.length !== recipeIds.filter(Boolean).length) {
        return res.status(400).json({ message: 'Invalid recipe ID(s) provided.' });
      }
    }

    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      { user: req.user.userId, weekStartDate },
      { meals },
      { new: true }
    );

    if (!updatedMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for this week.' });
    }

    res.status(200).json(updatedMealPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meal plan.', error: error.message });
  }
};

exports.deleteMealPlan = async (req, res) => {
  try {
    const { weekStartDate } = req.body;

    const mealPlan = await MealPlan.findOneAndDelete({
      user: req.user.userId,
      weekStartDate,
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for the specified week.' });
    }

    res.status(200).json({ message: 'Meal plan deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal plan', error: error.message });
  }
};
