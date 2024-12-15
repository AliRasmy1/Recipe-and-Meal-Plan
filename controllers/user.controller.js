const User = require('../models/user.model');
const Recipe = require('../models/recipe.model');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('following', 'username profileImage')
      .populate('followers', 'username profileImage')
      .populate('savedRecipes');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recipes = await Recipe.find({ author: user._id })
      .sort('-createdAt');

    res.json({ user, recipes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      bio: req.body.bio,
      profileImage: req.body.profileImage
    };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);
    
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);
    
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
};

exports.saveRecipe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!user.savedRecipes.includes(recipe._id)) {
      user.savedRecipes.push(recipe._id);
      await user.save();
    }

    res.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving recipe', error: error.message });
  }
};

exports.unsaveRecipe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    user.savedRecipes = user.savedRecipes.filter(
      id => id.toString() !== req.params.recipeId
    );
    await user.save();

    res.json({ message: 'Recipe removed from saved recipes' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved recipe', error: error.message });
  }
};